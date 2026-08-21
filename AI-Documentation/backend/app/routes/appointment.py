from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from datetime import datetime
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.patient import Patient
from app.models.appointment import Appointment
from app.services.journey_service import add_journey_event

router = APIRouter(
    tags=["Appointments"]
)

class AppointmentCreate(BaseModel):
    department_service: str
    appointment_type: str
    appointment_date: datetime
    notes: str | None = None

class AppointmentUpdate(BaseModel):
    department_service: str | None = None
    appointment_type: str | None = None
    appointment_date: datetime | None = None
    status: str | None = None
    notes: str | None = None

@router.post("/patient/{patient_id}/appointments")
def create_appointment(patient_id: str, request: AppointmentCreate):
    db: Session = SessionLocal()
    try:
        patient = db.query(Patient).filter(Patient.patient_id == patient_id).first()
        if not patient:
            raise HTTPException(status_code=404, detail="Patient not found")
        
        appointment = Appointment(
            patient_id=patient_id,
            department_service=request.department_service,
            appointment_type=request.appointment_type,
            appointment_date=request.appointment_date,
            status="SCHEDULED",
            notes=request.notes
        )
        db.add(appointment)
        db.commit()
        db.refresh(appointment)
        
        # Log to Care Journey
        date_str = appointment.appointment_date.strftime("%b %d, %Y at %I:%M %p")
        add_journey_event(
            db=db,
            patient_id=patient_id,
            event_type="appointment",
            title="Appointment Scheduled",
            description=f"Scheduled {appointment.appointment_type} with {appointment.department_service} on {date_str}.",
            status="Scheduled",
            department_service=appointment.department_service,
            related_entity_type="appointment",
            related_entity_id=str(appointment.appointment_id)
        )
        
        return {
            "success": True,
            "appointment_id": appointment.appointment_id,
            "message": "Appointment scheduled successfully."
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()

@router.get("/patient/{patient_id}/appointments")
def get_patient_appointments(patient_id: str):
    db: Session = SessionLocal()
    try:
        appointments = (
            db.query(Appointment)
            .filter(Appointment.patient_id == patient_id)
            .order_by(Appointment.appointment_date.asc())
            .all()
        )
        result = []
        for appt in appointments:
            result.append({
                "appointment_id": appt.appointment_id,
                "patient_id": appt.patient_id,
                "department_service": appt.department_service,
                "appointment_type": appt.appointment_type,
                "appointment_date": appt.appointment_date.isoformat(),
                "status": appt.status,
                "notes": appt.notes,
                "created_at": appt.created_at.isoformat(),
                "updated_at": appt.updated_at.isoformat()
            })
        return result
    finally:
        db.close()

@router.patch("/appointments/{appointment_id}")
def update_appointment(appointment_id: int, request: AppointmentUpdate):
    db: Session = SessionLocal()
    try:
        appointment = (
            db.query(Appointment)
            .filter(Appointment.appointment_id == appointment_id)
            .first()
        )
        if not appointment:
            raise HTTPException(status_code=404, detail="Appointment not found")
        
        old_status = appointment.status
        old_date = appointment.appointment_date
        
        update_data = request.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(appointment, key, value)
            
        db.commit()
        db.refresh(appointment)
        
        # Log timeline events depending on status changes or rescheduling
        new_status = appointment.status
        new_date = appointment.appointment_date
        
        date_changed = old_date != new_date
        status_changed = old_status != new_status
        
        date_str = appointment.appointment_date.strftime("%b %d, %Y at %I:%M %p")
        
        if date_changed and new_status == "SCHEDULED":
            # Rescheduled event
            appointment.status = "RESCHEDULED"
            db.commit()
            add_journey_event(
                db=db,
                patient_id=appointment.patient_id,
                event_type="appointment",
                title="Appointment Rescheduled",
                description=f"Rescheduled {appointment.appointment_type} with {appointment.department_service} to {date_str}.",
                status="Scheduled",
                department_service=appointment.department_service,
                related_entity_type="appointment",
                related_entity_id=str(appointment.appointment_id)
            )
        elif status_changed:
            title = f"Appointment {new_status.title()}"
            journey_status = "Completed" if new_status == "COMPLETED" else "Cancelled" if new_status == "CANCELLED" else "Overdue" if new_status == "MISSED" else "Scheduled"
            description = f"Appointment for {appointment.appointment_type} with {appointment.department_service} is now marked as {new_status.lower()}."
            
            add_journey_event(
                db=db,
                patient_id=appointment.patient_id,
                event_type="appointment",
                title=title,
                description=description,
                status=journey_status,
                department_service=appointment.department_service,
                related_entity_type="appointment",
                related_entity_id=str(appointment.appointment_id)
            )
            
        return {
            "success": True,
            "message": "Appointment updated successfully."
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()
