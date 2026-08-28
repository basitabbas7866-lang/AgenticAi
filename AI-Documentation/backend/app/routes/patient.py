from fastapi import APIRouter
from sqlalchemy.orm import Session
from sqlalchemy import or_
from pydantic import BaseModel

from app.database import SessionLocal
from app.models.patient import Patient, Prescription
from app.models.user import User
from app.models.appointment import Appointment

router = APIRouter(
    tags=["Patients"]
)


@router.post("/patient/create")
def create_patient(data: dict):

    db: Session = SessionLocal()

    try:

        # Get Last Patient

        last_patient = (
            db.query(Patient)
            .order_by(
                Patient.patient_id.desc()
            )
            .first()
        )

        if last_patient:

            next_id = (
                int(
                    last_patient.patient_id[1:]
                ) + 1
            )

        else:

            next_id = 1001

        patient_id = f"P{next_id}"

        patient = Patient(
            patient_id=patient_id,
            name=data["name"],
            age=data["age"],
            gender=data["gender"],
            phone=data["phone"],
            assigned_doctor_id=data.get("assigned_doctor_id"),
            status=data.get("status", "PENDING")
        )

        db.add(patient)
        db.commit()

        try:
            from app.services.journey_service import add_journey_event
            add_journey_event(
                db=db,
                patient_id=patient_id,
                event_type="registration",
                title="Patient Registered",
                description=f"Demographics recorded: {patient.name}, Age: {patient.age}, Gender: {patient.gender}",
                status="Completed",
                department_service="Front Desk / EHR Registry",
                related_entity_type="patient",
                related_entity_id=patient_id
            )
        except Exception as je:
            print("Failed to add journey event during registration:", je)

        return {
            "success": True,
            "patient_id": patient_id,
            "message":
            "Patient Created Successfully"
        }

    except Exception as e:

        db.rollback()

        return {
            "success": False,
            "message": str(e)
        }

    finally:

        db.close()


@router.get("/patient/{patient_id}")
def get_patient(patient_id: str):
    db: Session = SessionLocal()
    try:
        patient = (
            db.query(Patient)
            .filter(
                Patient.patient_id == patient_id
            )
            .first()
        )

        if not patient:
            return {
                "exists": False,
                "message": "Patient Not Found"
            }

        claimed_by_name = None
        if patient.assigned_doctor_id:
            try:
                c_id = int(patient.assigned_doctor_id)
            except ValueError:
                c_id = -1
            claiming_doc = db.query(User).filter(User.id == c_id).first()
            if claiming_doc:
                claimed_by_name = claiming_doc.name

        latest_apt = db.query(Appointment).filter(
            Appointment.patient_id == patient.patient_id,
            Appointment.status == "SCHEDULED"
        ).order_by(Appointment.created_at.desc()).first()

        return {
            "exists": True,
            "patient": {
                "patient_id": patient.patient_id,
                "name": patient.name,
                "age": patient.age,
                "gender": patient.gender,
                "phone": patient.phone,
                "assigned_doctor_id": patient.assigned_doctor_id,
                "claimed_by_name": claimed_by_name,
                "status": patient.status,
                "appointment_department": latest_apt.department_service if latest_apt else None,
                "appointment_type": latest_apt.appointment_type if latest_apt else None,
                "appointment_date": latest_apt.appointment_date.isoformat() if latest_apt else None,
            }
        }

    finally:

        db.close()


@router.get("/patients")
def get_all_patients(doctor_id: str | None = None):
    db: Session = SessionLocal()
    try:
        # Load all real database patients
        patients = db.query(Patient).all()
        
        # Load all prescriptions to build map of patient_id -> set of prescribing doctor_ids
        prescriptions = db.query(Prescription).all()
        presc_map = {}
        for pr in prescriptions:
            if pr.patient_id not in presc_map:
                presc_map[pr.patient_id] = set()
            presc_map[pr.patient_id].add(str(pr.doctor_id))

        doc_int_id = -1
        doctor = None
        specialty_keyword = ""
        if doctor_id:
            try:
                doc_int_id = int(doctor_id)
                doctor = db.query(User).filter(User.id == doc_int_id).first()
                if doctor:
                    specialty_keyword = (doctor.specialty or "").strip().lower()
            except ValueError:
                pass

        # Build list of responses including claimed doctor name + appointment dept info
        response_patients = []
        for p in patients:
            claimed_by_name = None
            if p.assigned_doctor_id:
                try:
                    c_id = int(p.assigned_doctor_id)
                except ValueError:
                    c_id = -1
                claiming_doc = db.query(User).filter(User.id == c_id).first()
                if claiming_doc:
                    claimed_by_name = claiming_doc.name

            # Fetch the latest scheduled appointment to show dept info on the card
            latest_apt = db.query(Appointment).filter(
                Appointment.patient_id == p.patient_id,
                Appointment.status.in_(["SCHEDULED", "PENDING", "REQUESTED"])
            ).order_by(Appointment.created_at.desc()).first()

            dept_name = latest_apt.department_service if latest_apt else None
            
            # Check specialty match
            matches_specialty = False
            if specialty_keyword and dept_name:
                d_lower = dept_name.lower()
                matches_specialty = specialty_keyword in d_lower or d_lower in specialty_keyword or "general" in specialty_keyword
            elif not specialty_keyword:
                matches_specialty = True

            is_my_patient = False
            if doctor_id:
                if str(p.assigned_doctor_id) == str(doctor_id) or str(doctor_id) in presc_map.get(p.patient_id, set()):
                    is_my_patient = True

            # Calculate priority for sorting:
            # 1. My patient (claimed/prescribed) -> Priority 1
            # 2. Matching specialty request -> Priority 2
            # 3. Unclaimed new registration -> Priority 3
            # 4. Others -> Priority 4
            priority = 4
            if is_my_patient:
                priority = 1
            elif matches_specialty and not p.assigned_doctor_id:
                priority = 2
            elif not p.assigned_doctor_id:
                priority = 3

            response_patients.append({
                "patient_id": p.patient_id,
                "name": p.name,
                "age": p.age,
                "gender": p.gender,
                "phone": p.phone,
                "assigned_doctor_id": p.assigned_doctor_id,
                "claimed_by_name": claimed_by_name,
                "status": p.status,
                "appointment_department": dept_name,
                "appointment_type": latest_apt.appointment_type if latest_apt else None,
                "appointment_date": latest_apt.appointment_date.isoformat() if latest_apt else None,
                "matches_specialty": matches_specialty,
                "is_my_patient": is_my_patient,
                "priority": priority
            })
            
        # Sort by priority then by patient_id desc
        response_patients.sort(key=lambda x: (x["priority"], x["patient_id"]))

        return {
            "success": True,
            "patients": response_patients
        }
    except Exception as e:
        return {"success": False, "message": str(e)}
    finally:
        db.close()


@router.get("/doctors")
def get_all_doctors():
    db: Session = SessionLocal()
    try:
        doctors = db.query(User).filter(User.role == "doctor").all()
        return {
            "success": True,
            "doctors": [
                {
                    "id": d.id,
                    "name": d.name,
                    "email": d.email,
                    "specialty": d.specialty
                } for d in doctors
            ]
        }
    except Exception as e:
        return {"success": False, "message": str(e)}
    finally:
        db.close()


class AssignDoctorRequest(BaseModel):
    doctor_id: str

class PrescribeRequest(BaseModel):
    doctor_id: str
    doctor_name: str
    medication_name: str
    instructions: str


@router.post("/patient/{patient_id}/assign-doctor")
def assign_doctor(patient_id: str, req: AssignDoctorRequest):
    db: Session = SessionLocal()
    try:
        patient = db.query(Patient).filter(Patient.patient_id == patient_id).first()
        if not patient:
            return {"success": False, "message": "Patient not found"}
        
        patient.assigned_doctor_id = req.doctor_id
        patient.status = "PENDING"
        db.commit()
        return {"success": True, "message": "Doctor assigned successfully, awaiting approval"}
    except Exception as e:
        db.rollback()
        return {"success": False, "message": str(e)}
    finally:
        db.close()


@router.post("/patient/{patient_id}/approve")
def approve_patient(patient_id: str, doctor_id: str | None = None):
    db: Session = SessionLocal()
    try:
        patient = db.query(Patient).filter(Patient.patient_id == patient_id).first()
        if not patient:
            return {"success": False, "message": "Patient not found"}
        
        patient.status = "APPROVED"
        doc_name = "Assigned Doctor"
        if doctor_id:
            patient.assigned_doctor_id = doctor_id
            doc_user = db.query(User).filter(User.id == int(doctor_id)).first()
            if doc_user:
                doc_name = doc_user.name
        db.commit()

        try:
            from app.services.journey_service import add_journey_event
            add_journey_event(
                db=db,
                patient_id=patient_id,
                event_type="consultation",
                title="Clinical Checkup Intake Claimed",
                description=f"Patient claimed & intake approved by {doc_name}. Active consultation and record coordination initialized.",
                status="Completed",
                department_service="Specialist Clinical Unit",
                related_entity_type="patient",
                related_entity_id=patient_id
            )
        except Exception as je:
            print("Failed to add journey event on approve:", je)

        return {"success": True, "message": "Patient intake approved successfully"}
    except Exception as e:
        db.rollback()
        return {"success": False, "message": str(e)}
    finally:
        db.close()


@router.post("/patient/{patient_id}/prescribe")
def prescribe_medication(patient_id: str, req: PrescribeRequest):
    db: Session = SessionLocal()
    try:
        patient = db.query(Patient).filter(Patient.patient_id == patient_id).first()
        if not patient:
            return {"success": False, "message": "Patient not found"}
        
        prescription = Prescription(
            patient_id=patient_id,
            doctor_id=req.doctor_id,
            doctor_name=req.doctor_name,
            medication_name=req.medication_name,
            instructions=req.instructions
        )
        db.add(prescription)
        db.commit()
        db.refresh(prescription)

        try:
            from app.services.journey_service import add_journey_event
            add_journey_event(
                db=db,
                patient_id=patient_id,
                event_type="prescription",
                title=f"Prescription Issued: {req.medication_name}",
                description=f"Prescribed by {req.doctor_name}. Instructions: {req.instructions}. EMR locked to attending specialist for continuity of care.",
                status="Active",
                department_service="Pharmacy & Medication Management",
                related_entity_type="prescription",
                related_entity_id=str(prescription.id)
            )
        except Exception as je:
            print("Failed to add journey event on prescribe:", je)

        return {
            "success": True, 
            "message": "Prescription added successfully", 
            "prescription": {
                "id": prescription.id,
                "patient_id": prescription.patient_id,
                "doctor_id": prescription.doctor_id,
                "doctor_name": prescription.doctor_name,
                "medication_name": prescription.medication_name,
                "instructions": prescription.instructions
            }
        }
    except Exception as e:
        db.rollback()
        return {"success": False, "message": str(e)}
    finally:
        db.close()


@router.get("/patient/{patient_id}/prescriptions")
def get_patient_prescriptions(patient_id: str, doctor_id: str | None = None):
    db: Session = SessionLocal()
    try:
        query = db.query(Prescription).filter(Prescription.patient_id == patient_id)
        if doctor_id:
            query = query.filter(Prescription.doctor_id == doctor_id)
        
        prescriptions = query.order_by(Prescription.prescribed_at.desc()).all()
        return {
            "success": True,
            "prescriptions": [
                {
                    "id": p.id,
                    "patient_id": p.patient_id,
                    "doctor_id": p.doctor_id,
                    "doctor_name": p.doctor_name,
                    "medication_name": p.medication_name,
                    "instructions": p.instructions,
                    "prescribed_at": p.prescribed_at.isoformat()
                } for p in prescriptions
            ]
        }
    except Exception as e:
        return {"success": False, "message": str(e)}
    finally:
        db.close()


@router.delete("/prescription/{prescription_id}")
def delete_prescription(prescription_id: int):
    db: Session = SessionLocal()
    try:
        prescription = db.query(Prescription).filter(Prescription.id == prescription_id).first()
        if not prescription:
            return {"success": False, "message": "Prescription not found"}
        
        db.delete(prescription)
        db.commit()
        return {"success": True, "message": "Prescription deleted successfully"}
    except Exception as e:
        db.rollback()
        return {"success": False, "message": str(e)}
    finally:
        db.close()


@router.put("/patient/{patient_id}/update")
def update_patient(patient_id: str, data: dict):
    db: Session = SessionLocal()
    try:
        patient = db.query(Patient).filter(Patient.patient_id == patient_id).first()
        if not patient:
            return {"success": False, "message": "Patient not found"}
        
        if "name" in data:
            patient.name = data["name"]
        if "age" in data:
            patient.age = int(data["age"])
        if "gender" in data:
            patient.gender = data["gender"]
        if "phone" in data:
            patient.phone = data["phone"]
            
        db.commit()
        return {
            "success": True, 
            "message": "Patient updated successfully",
            "patient": {
                "patient_id": patient.patient_id,
                "name": patient.name,
                "age": patient.age,
                "gender": patient.gender,
                "phone": patient.phone
            }
        }
    except Exception as e:
        db.rollback()
        return {"success": False, "message": str(e)}
    finally:
        db.close()