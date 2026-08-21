from fastapi import APIRouter, HTTPException
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.services.coordination_monitor import detect_coordination_issues

router = APIRouter(
    tags=["Coordination Alerts"]
)

@router.get("/coordination/alerts")
def get_all_alerts():
    db: Session = SessionLocal()
    try:
        alerts = detect_coordination_issues(db)
        return alerts
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()

@router.get("/patient/{patient_id}/alerts")
def get_patient_alerts(patient_id: str):
    db: Session = SessionLocal()
    try:
        alerts = detect_coordination_issues(db, patient_id=patient_id)
        return alerts
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()
