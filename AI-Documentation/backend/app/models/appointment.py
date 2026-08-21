from sqlalchemy import Column, Integer, String, Text, DateTime
from datetime import datetime
from app.database import Base

class Appointment(Base):
    __tablename__ = "appointments"

    appointment_id = Column(
        Integer,
        primary_key=True,
        index=True
    )
    patient_id = Column(
        String,
        nullable=False,
        index=True
    )
    department_service = Column(
        String,
        nullable=False
    )
    appointment_type = Column(
        String,
        nullable=False
    )
    appointment_date = Column(
        DateTime,
        nullable=False
    )
    status = Column(
        String,
        default="SCHEDULED",
        nullable=False
    )
    notes = Column(
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
