from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean
from datetime import datetime
from app.database import Base

class Investigation(Base):
    __tablename__ = "investigations"

    investigation_id = Column(
        Integer,
        primary_key=True,
        index=True
    )
    patient_id = Column(
        String,
        nullable=False,
        index=True
    )
    test_name = Column(
        String,
        nullable=False
    )
    ordered_date = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )
    scheduled_date = Column(
        DateTime,
        nullable=True
    )
    status = Column(
        String,
        default="ORDERED",
        nullable=False
    )
    result_available = Column(
        Boolean,
        default=False,
        nullable=False
    )
    result_reference = Column(
        String,
        nullable=True
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
