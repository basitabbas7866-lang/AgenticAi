from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from datetime import datetime
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.patient import Patient
from app.models.consultation import Consultation
from app.models.journey_event import JourneyEvent
from app.services.journey_service import add_journey_event

router = APIRouter(
    tags=["Journey"]
)

class JourneyEventCreate(BaseModel):
    event_type: str
    title: str
    description: str
    status: str
    department_service: str | None = None
    related_entity_type: str | None = None
    related_entity_id: str | None = None

@router.get("/patient/{patient_id}/journey")
def get_patient_journey(patient_id: str):
    db: Session = SessionLocal()
    try:
        patient = db.query(Patient).filter(Patient.patient_id == patient_id).first()
        if not patient:
            raise HTTPException(status_code=404, detail="Patient not found")
        
        events = (
            db.query(JourneyEvent)
            .filter(JourneyEvent.patient_id == patient_id)
            .order_by(JourneyEvent.timestamp.asc())
            .all()
        )
        
        # Synthesize timeline events if no explicit logs are found
        if not events:
            synthesized = []
            
            # 1. Registration event
            synthesized.append({
                "id": f"synth-reg-{patient_id}",
                "patient_id": patient_id,
                "event_type": "registration",
                "title": "Patient Registered",
                "description": f"Registered chart. Name: {patient.name}, Age: {patient.age}, Gender: {patient.gender}",
                "timestamp": patient.created_at.isoformat(),
                "status": "Completed",
                "department_service": "Front Desk / EHR Registry",
                "related_entity_type": "patient",
                "related_entity_id": patient_id,
                "created_at": patient.created_at.isoformat()
            })
            
            # 2. Consultations & Document events
            consultations = (
                db.query(Consultation)
                .filter(Consultation.patient_id == patient_id)
                .order_by(Consultation.created_at.asc())
                .all()
            )
            for idx, c in enumerate(consultations):
                synthesized.append({
                    "id": f"synth-cons-{c.consultation_id}",
                    "patient_id": patient_id,
                    "event_type": "consultation",
                    "title": f"Consultation Encounter #{idx + 1}",
                    "description": "Patient dialogue and audio transcription recorded.",
                    "timestamp": c.created_at.isoformat(),
                    "status": "Completed",
                    "department_service": "Outpatient Clinic",
                    "related_entity_type": "consultation",
                    "related_entity_id": str(c.consultation_id),
                    "created_at": c.created_at.isoformat()
                })
                synthesized.append({
                    "id": f"synth-doc-{c.consultation_id}",
                    "patient_id": patient_id,
                    "event_type": "documentation",
                    "title": "SOAP Documentation Compiled",
                    "description": "Clinical summary and AI generated SOAP note saved to database.",
                    "timestamp": c.created_at.isoformat(),
                    "status": "Completed",
                    "department_service": "AI Clinical Documentation Engine",
                    "related_entity_type": "consultation",
                    "related_entity_id": str(c.consultation_id),
                    "created_at": c.created_at.isoformat()
                })
            
            # Sort synthesized events by timestamp (chronological)
            synthesized.sort(key=lambda x: x["timestamp"])
            return synthesized
            
        result = []
        for e in events:
            result.append({
                "id": e.id,
                "patient_id": e.patient_id,
                "event_type": e.event_type,
                "title": e.title,
                "description": e.description,
                "timestamp": e.timestamp.isoformat(),
                "status": e.status,
                "department_service": e.department_service,
                "related_entity_type": e.related_entity_type,
                "related_entity_id": e.related_entity_id,
                "created_at": e.created_at.isoformat()
            })
        return result
    finally:
        db.close()

@router.post("/patient/{patient_id}/journey/event")
def create_journey_event_manual(patient_id: str, request: JourneyEventCreate):
    db: Session = SessionLocal()
    try:
        patient = db.query(Patient).filter(Patient.patient_id == patient_id).first()
        if not patient:
            raise HTTPException(status_code=404, detail="Patient not found")
        
        event = add_journey_event(
            db=db,
            patient_id=patient_id,
            event_type=request.event_type,
            title=request.title,
            description=request.description,
            status=request.status,
            department_service=request.department_service,
            related_entity_type=request.related_entity_type,
            related_entity_id=request.related_entity_id
        )
        return {
            "success": True,
            "id": event.id,
            "message": "Journey event added successfully."
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()
