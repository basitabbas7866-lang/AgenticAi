from sqlalchemy import Column, Integer, String, Text, DateTime
from datetime import datetime
from app.database import Base

class Referral(Base):
    __tablename__ = "referrals"

    referral_id = Column(
        Integer,
        primary_key=True,
        index=True
    )
    patient_id = Column(
        String,
        nullable=False,
        index=True
    )
    referring_department = Column(
        String,
        nullable=False
    )
    referred_department_specialist = Column(
        String,
        nullable=False
    )
    referral_reason = Column(
        Text,
        nullable=False
    )
    priority = Column(
        String,
        default="Routine",
        nullable=False
    )
    status = Column(
        String,
        default="CREATED",
        nullable=False
    )
    referral_date = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )
    appointment_info = Column(
        Text,
        nullable=True
    )
    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )
    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False
    )
