from fastapi import APIRouter
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models.patient import Patient

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
            phone=data["phone"]
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
                Patient.patient_id ==
                patient_id
            )
            .first()
        )

        if not patient:

            return {
                "exists": False,
                "message":
                "Patient Not Found"
            }

        return {
            "exists": True,
            "patient": {
                "patient_id":
                patient.patient_id,

                "name":
                patient.name,

                "age":
                patient.age,

                "gender":
                patient.gender,

                "phone":
                patient.phone
            }
        }

    finally:

        db.close()