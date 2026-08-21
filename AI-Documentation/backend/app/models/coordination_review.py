from sqlalchemy import Column, Integer, String, Text, DateTime
from datetime import datetime
from app.database import Base

class CoordinationReview(Base):
    __tablename__ = "coordination_reviews"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(String, nullable=False, index=True)
    patient_name = Column(String, nullable=False)
    proposed_action = Column(Text, nullable=False)
    reason = Column(Text, nullable=False)
    supporting_evidence = Column(Text, nullable=True)
    source_records = Column(Text, nullable=True)  # Store JSON or comma-separated references (e.g. Appointment ID)
    agent_responsible = Column(String, nullable=False)
    importance_level = Column(String, default="Medium")  # Low, Medium, High, Critical
    timestamp = Column(DateTime, default=datetime.utcnow)
    status = Column(String, default="PENDING")  # PENDING, APPROVED, REJECTED
    reviewer = Column(String, nullable=True)
    reviewer_comment = Column(Text, nullable=True)
    decision_timestamp = Column(DateTime, nullable=True)
    original_ai_proposal = Column(Text, nullable=False)
