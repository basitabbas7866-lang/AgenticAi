from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from datetime import datetime
from pydantic import BaseModel
from app.database import SessionLocal
from app.models.coordination_review import CoordinationReview
from app.services.coordination_monitor import detect_coordination_issues

router = APIRouter(
    tags=["Coordination Reviews"]
)

class ReviewActionRequest(BaseModel):
    decision: str  # APPROVED or REJECTED
    reviewer: str
    comment: str | None = None

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/coordination/reviews")
def get_coordination_reviews(db: Session = Depends(get_db)):
    try:
        # Trigger an automatic sync on fetch to keep the queue fresh
        sync_reviews_internal(db)
        reviews = db.query(CoordinationReview).order_by(CoordinationReview.timestamp.desc()).all()
        return reviews
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/patient/{patient_id}/coordination/reviews")
def get_patient_coordination_reviews(patient_id: str, db: Session = Depends(get_db)):
    try:
        # Sync first to capture recent alerts
        sync_reviews_internal(db)
        reviews = db.query(CoordinationReview).filter(
            CoordinationReview.patient_id == patient_id
        ).order_by(CoordinationReview.timestamp.desc()).all()
        return reviews
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/coordination/reviews/sync")
def sync_coordination_reviews(db: Session = Depends(get_db)):
    try:
        count = sync_reviews_internal(db)
        return {"status": "success", "synced_count": count}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/coordination/reviews/{review_id}/action")
def take_review_action(review_id: int, req: ReviewActionRequest, db: Session = Depends(get_db)):
    review = db.query(CoordinationReview).filter(CoordinationReview.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review request not found")
    
    if review.status != "PENDING":
        raise HTTPException(status_code=400, detail=f"Review is already processed with status: {review.status}")
    
    if req.decision not in ["APPROVED", "REJECTED"]:
        raise HTTPException(status_code=400, detail="Decision must be APPROVED or REJECTED")
    
    try:
        review.status = req.decision
        review.reviewer = req.reviewer
        review.reviewer_comment = req.comment
        review.decision_timestamp = datetime.utcnow()
        db.commit()
        db.refresh(review)
        return review
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

def sync_reviews_internal(db: Session) -> int:
    alerts = detect_coordination_issues(db)
    synced_count = 0
    
    for alert in alerts:
        source_ref = f"{alert['related_entity']['type']}:{alert['related_entity']['id']}"
        patient_id = alert["patient_id"]
        
        # Check if this pending alert is already in the database
        exists = db.query(CoordinationReview).filter(
            CoordinationReview.patient_id == patient_id,
            CoordinationReview.source_records == source_ref,
            CoordinationReview.status == "PENDING"
        ).first()
        
        # Also check if it's already approved/rejected (to avoid re-syncing processed alerts)
        processed = db.query(CoordinationReview).filter(
            CoordinationReview.patient_id == patient_id,
            CoordinationReview.source_records == source_ref,
            CoordinationReview.status.in_(["APPROVED", "REJECTED"])
        ).first()
        
        if not exists and not processed:
            new_review = CoordinationReview(
                patient_id=patient_id,
                patient_name=alert["patient_name"],
                proposed_action=alert["recommended_action"],
                reason=alert["explanation"],
                supporting_evidence=alert["issue_type"],
                source_records=source_ref,
                agent_responsible="RulesEngine",
                importance_level=alert["severity"],
                status="PENDING",
                original_ai_proposal=alert["recommended_action"]
            )
            db.add(new_review)
            synced_count += 1
            
    if synced_count > 0:
        db.commit()
        
    return synced_count
