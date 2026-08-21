from sqlalchemy import Column, Integer, String, Text, DateTime
from datetime import datetime
from app.database import Base

class JourneyEvent(Base):
    __tablename__ = "journey_events"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )
    patient_id = Column(
        String,
        nullable=False,
        index=True
    )
    event_type = Column(
        String,
        nullable=False
    )
    title = Column(
        String,
        nullable=False
    )
    description = Column(
        Text,
        nullable=False
    )
    timestamp = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )
    status = Column(
        String,
        nullable=False
    )
    department_service = Column(
        String,
        nullable=True
    )
    related_entity_type = Column(
        String,
        nullable=True
    )
    related_entity_id = Column(
        String,
        nullable=True
    )
    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )
