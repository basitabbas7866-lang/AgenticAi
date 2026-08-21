from fastapi import APIRouter, HTTPException, Header
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.agents.coordinator_agent import PatientJourneyCoordinatorAgent

router = APIRouter(
    tags=["Agent Coordination"]
)

@router.get("/patient/{patient_id}/coordination/analyze")
def analyze_coordination(patient_id: str, authorization: str | None = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=403, detail="Practitioner not authorized to access patient coordination summary")
    
    token = authorization.split(" ")[1]
    if token != "clinical-workspace-token":
        raise HTTPException(status_code=403, detail="Invalid practitioner authorization token")

    db: Session = SessionLocal()
    try:
        coordinator = PatientJourneyCoordinatorAgent()
        result = coordinator.run_analysis(db, patient_id=patient_id, auth_token=token)
        if "error" in result:
            raise HTTPException(status_code=404, detail=result["error"])
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()
