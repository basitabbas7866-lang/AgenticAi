from app.database import SessionLocal

from app.models.session import (
    Session
)

from app.models.consultation import (
    Consultation
)

from app.rag.store_report import (
    store_report
)


def save_consultation(
    patient_id,
    transcript,
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
            transcript=transcript,
            report=report
        )

        db.add(
            consultation
        )

        db.commit()

        try:
            from app.services.journey_service import add_journey_event
            add_journey_event(
                db=db,
                patient_id=patient_id,
                event_type="consultation",
                title="Clinical Consultation Started",
                description="Clinical conversation recorded and audio transcription generated.",
                status="Completed",
                department_service="Outpatient Clinic",
                related_entity_type="session",
                related_entity_id=str(session.session_id)
            )
            add_journey_event(
                db=db,
                patient_id=patient_id,
                event_type="documentation",
                title="SOAP Note Generated",
                description="Structured clinical documentation compiled and saved.",
                status="Completed",
                department_service="AI Clinical Documentation Engine",
                related_entity_type="consultation",
                related_entity_id=str(consultation.consultation_id)
            )
        except Exception as je:
            print("Failed to add journey events during consultation save:", je)

        store_report(
            patient_id,
            report
        )

        return session.session_id

    finally:

        db.close()