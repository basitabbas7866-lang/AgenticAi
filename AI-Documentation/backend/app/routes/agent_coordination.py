from fastapi import APIRouter, HTTPException
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.agents.coordinator_agent import PatientJourneyCoordinatorAgent

router = APIRouter(
    tags=["Agent Coordination"]
)

@router.get("/patient/{patient_id}/coordination/analyze")
def analyze_coordination(patient_id: str):
    db: Session = SessionLocal()
    try:
        coordinator = PatientJourneyCoordinatorAgent()
        result = coordinator.run_analysis(db, patient_id=patient_id)
        if "error" in result:
            raise HTTPException(status_code=404, detail=result["error"])
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()
