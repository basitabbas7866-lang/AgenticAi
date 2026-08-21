from app.database import SessionLocal

from app.models.session import Session
from app.models.consultation import Consultation


def save_consultation(
    patient_id,
    conversation,
    report
):

    db = SessionLocal()

    try:

        session = Session(
            patient_id=patient_id
        )

        db.add(session)

        db.commit()

        db.refresh(session)

        consultation = Consultation(
            session_id=session.session_id,
            patient_id=patient_id,
            conversation=conversation,
            report=report
        )

        db.add(consultation)

        db.commit()

        return session.session_id

    finally:

        db.close()