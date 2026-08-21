from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from datetime import datetime
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.patient import Patient
from app.models.investigation import Investigation
from app.services.journey_service import add_journey_event

router = APIRouter(
    tags=["Investigations"]
)

class InvestigationCreate(BaseModel):
    test_name: str
    notes: str | None = None

class InvestigationUpdate(BaseModel):
    test_name: str | None = None
    scheduled_date: datetime | None = None
    status: str | None = None
    result_available: bool | None = None
    result_reference: str | None = None
    notes: str | None = None

@router.post("/patient/{patient_id}/investigations")
def create_investigation(patient_id: str, request: InvestigationCreate):
    db: Session = SessionLocal()
    try:
        patient = db.query(Patient).filter(Patient.patient_id == patient_id).first()
        if not patient:
            raise HTTPException(status_code=404, detail="Patient not found")
        
        investigation = Investigation(
            patient_id=patient_id,
            test_name=request.test_name,
            status="ORDERED",
            notes=request.notes
        )
        db.add(investigation)
        db.commit()
        db.refresh(investigation)
        
        # Log to Care Journey
        add_journey_event(
            db=db,
            patient_id=patient_id,
            event_type="investigation",
            title="Lab Test Ordered",
            description=f"Ordered clinical investigation/test: {investigation.test_name}.",
            status="Active",
            department_service="Diagnostics / Pathology",
            related_entity_type="investigation",
            related_entity_id=str(investigation.investigation_id)
        )
        
        return {
            "success": True,
            "investigation_id": investigation.investigation_id,
            "message": "Investigation ordered successfully."
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()

@router.get("/patient/{patient_id}/investigations")
def get_patient_investigations(patient_id: str):
    db: Session = SessionLocal()
    try:
        investigations = (
            db.query(Investigation)
            .filter(Investigation.patient_id == patient_id)
            .order_by(Investigation.ordered_date.desc())
            .all()
        )
        result = []
        for inv in investigations:
            result.append({
                "investigation_id": inv.investigation_id,
                "patient_id": inv.patient_id,
                "test_name": inv.test_name,
                "ordered_date": inv.ordered_date.isoformat(),
                "scheduled_date": inv.scheduled_date.isoformat() if inv.scheduled_date else None,
                "status": inv.status,
                "result_available": inv.result_available,
                "result_reference": inv.result_reference,
                "notes": inv.notes,
                "created_at": inv.created_at.isoformat(),
                "updated_at": inv.updated_at.isoformat()
            })
        return result
    finally:
        db.close()

@router.patch("/investigations/{investigation_id}")
def update_investigation(investigation_id: int, request: InvestigationUpdate):
    db: Session = SessionLocal()
    try:
        investigation = (
            db.query(Investigation)
            .filter(Investigation.investigation_id == investigation_id)
            .first()
        )
        if not investigation:
            raise HTTPException(status_code=404, detail="Investigation not found")
        
        old_status = investigation.status
        
        update_data = request.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(investigation, key, value)
            
        db.commit()
        db.refresh(investigation)
        
        new_status = investigation.status
        if old_status != new_status:
            title = f"Test Progress: {new_status}"
            journey_status = "Completed" if new_status in ["COMPLETED", "RESULT_AVAILABLE", "CLOSED"] else "Active"
            description = f"Investigation test {investigation.test_name} status updated to {new_status}."
            if investigation.result_reference:
                description += f" Diagnostic document reference registered: {investigation.result_reference}"
            
            # CRITICAL WARNING: We must NOT interpret medical test results or provide autonomous medical conclusions.
            # Thus, we only document availability of results.
            if new_status == "RESULT_AVAILABLE":
                title = "Diagnostic Results Available"
                description = f"Diagnostic test results for {investigation.test_name} are now available in the registry. Human review required for clinical interpretation."
                
            add_journey_event(
                db=db,
                patient_id=investigation.patient_id,
                event_type="investigation",
                title=title,
                description=description,
                status=journey_status,
                department_service="Diagnostics / Pathology",
                related_entity_type="investigation",
                related_entity_id=str(investigation.investigation_id)
            )
            
        return {
            "success": True,
            "message": "Investigation updated successfully."
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()
