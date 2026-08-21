from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from datetime import datetime
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.patient import Patient
from app.models.referral import Referral
from app.services.journey_service import add_journey_event

router = APIRouter(
    tags=["Referrals"]
)

class ReferralCreate(BaseModel):
    referring_department: str
    referred_department_specialist: str
    referral_reason: str
    priority: str

class ReferralUpdate(BaseModel):
    referring_department: str | None = None
    referred_department_specialist: str | None = None
    referral_reason: str | None = None
    priority: str | None = None
    status: str | None = None
    appointment_info: str | None = None

@router.post("/patient/{patient_id}/referrals")
def create_referral(patient_id: str, request: ReferralCreate):
    db: Session = SessionLocal()
    try:
        patient = db.query(Patient).filter(Patient.patient_id == patient_id).first()
        if not patient:
            raise HTTPException(status_code=404, detail="Patient not found")
        
        referral = Referral(
            patient_id=patient_id,
            referring_department=request.referring_department,
            referred_department_specialist=request.referred_department_specialist,
            referral_reason=request.referral_reason,
            priority=request.priority,
            status="CREATED"
        )
        db.add(referral)
        db.commit()
        db.refresh(referral)
        
        # Log to Care Journey
        add_journey_event(
            db=db,
            patient_id=patient_id,
            event_type="referral",
            title="Referral Issued",
            description=f"Created outgoing referral from {referral.referring_department} to {referral.referred_department_specialist} (Priority: {referral.priority}). Reason: {referral.referral_reason}",
            status="Active",
            department_service=referral.referring_department,
            related_entity_type="referral",
            related_entity_id=str(referral.referral_id)
        )
        
        return {
            "success": True,
            "referral_id": referral.referral_id,
            "message": "Referral created successfully."
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()

@router.get("/patient/{patient_id}/referrals")
def get_patient_referrals(patient_id: str):
    db: Session = SessionLocal()
    try:
        referrals = (
            db.query(Referral)
            .filter(Referral.patient_id == patient_id)
            .order_by(Referral.created_at.desc())
            .all()
        )
        result = []
        for ref in referrals:
            result.append({
                "referral_id": ref.referral_id,
                "patient_id": ref.patient_id,
                "referring_department": ref.referring_department,
                "referred_department_specialist": ref.referred_department_specialist,
                "referral_reason": ref.referral_reason,
                "priority": ref.priority,
                "status": ref.status,
                "referral_date": ref.referral_date.isoformat(),
                "appointment_info": ref.appointment_info,
                "created_at": ref.created_at.isoformat(),
                "updated_at": ref.updated_at.isoformat()
            })
        return result
    finally:
        db.close()

@router.patch("/referrals/{referral_id}")
def update_referral(referral_id: int, request: ReferralUpdate):
    db: Session = SessionLocal()
    try:
        referral = (
            db.query(Referral)
            .filter(Referral.referral_id == referral_id)
            .first()
        )
        if not referral:
            raise HTTPException(status_code=404, detail="Referral not found")
        
        old_status = referral.status
        
        update_data = request.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(referral, key, value)
            
        db.commit()
        db.refresh(referral)
        
        new_status = referral.status
        if old_status != new_status:
            title = f"Referral Status: {new_status}"
            journey_status = "Completed" if new_status == "COMPLETED" else "Cancelled" if new_status == "CANCELLED" else "Overdue" if new_status == "OVERDUE" else "Active"
            description = f"Referral to {referral.referred_department_specialist} has transitioned to status: {new_status}."
            if referral.appointment_info:
                description += f" Appointment Details: {referral.appointment_info}"
            
            add_journey_event(
                db=db,
                patient_id=referral.patient_id,
                event_type="referral",
                title=title,
                description=description,
                status=journey_status,
                department_service=referral.referred_department_specialist,
                related_entity_type="referral",
                related_entity_id=str(referral.referral_id)
            )
            
        return {
            "success": True,
            "message": "Referral updated successfully."
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()
