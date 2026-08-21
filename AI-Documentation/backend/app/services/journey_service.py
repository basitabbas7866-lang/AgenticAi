from datetime import datetime
from sqlalchemy.orm import Session
from app.models.journey_event import JourneyEvent

def add_journey_event(
    db: Session,
    patient_id: str,
    event_type: str,
    title: str,
    description: str,
    status: str,
    department_service: str | None = None,
    related_entity_type: str | None = None,
    related_entity_id: str | None = None,
    timestamp: datetime | None = None
):
    event = JourneyEvent(
        patient_id=patient_id,
        event_type=event_type,
        title=title,
        description=description,
        timestamp=timestamp or datetime.utcnow(),
        status=status,
        department_service=department_service,
        related_entity_type=related_entity_type,
        related_entity_id=related_entity_id
    )
    db.add(event)
    db.commit()
    db.refresh(event)
    return event
