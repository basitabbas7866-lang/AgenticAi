from sqlalchemy import Column
from sqlalchemy import Integer
from sqlalchemy import String
from sqlalchemy import Text
from sqlalchemy import DateTime

from datetime import datetime

from app.database import Base


class Consultation(Base):

    __tablename__ = "consultations"

    consultation_id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    session_id = Column(
        Integer,
        nullable=False
    )

    # Patient-wise session number
    session_number = Column(
        Integer,
        nullable=True
    )

    patient_id = Column(
        String,
        nullable=False
    )

    transcript = Column(
        Text
    )

    # Legacy combined report (kept for backward compatibility)
    report = Column(
        Text
    )

    # Agent 1: SOAP Note
    soap_note = Column(
        Text
    )

    # Agent 2: Clinical Insights
    ai_insights = Column(
        Text
    )

    # Agent 3: Validation
    validation = Column(
        Text
    )

    # Agent 4: Final Report
    final_report = Column(
        Text
    )

    # Doctor Inputs
    doctor_diagnosis = Column(
        Text
    )

    doctor_prescription = Column(
        Text
    )

    doctor_notes = Column(
        Text
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )