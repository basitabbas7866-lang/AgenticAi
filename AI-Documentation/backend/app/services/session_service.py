from app.database import SessionLocal

from app.models.session import Session
from app.models.consultation import Consultation

from app.rag.store_report import store_report


def save_consultation(patient_id, transcript, soap_note, ai_insights, validation, report=None):
    """
    Save a new consultation session with multi-agent outputs.
    Returns dict with consultation_id and session_id.
    """

    db = SessionLocal()

    try:
        session = Session(patient_id=patient_id)
        db.add(session)
        db.commit()
        db.refresh(session)

        # Count existing sessions for this patient (session_number)
        session_count = (
            db.query(Consultation)
            .filter(Consultation.patient_id == patient_id)
            .count()
        )

        consultation = Consultation(
            session_id=session.session_id,
            session_number=session_count + 1,
            patient_id=patient_id,
            transcript=transcript,
            report=report or soap_note,   # legacy field
            soap_note=soap_note,
            ai_insights=ai_insights,
            validation=validation
        )

        db.add(consultation)
        db.commit()
        db.refresh(consultation)

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
                description="Multi-agent clinical documentation compiled and saved.",
                status="Completed",
                department_service="AI Clinical Documentation Engine",
                related_entity_type="consultation",
                related_entity_id=str(consultation.consultation_id)
            )
        except Exception as je:
            print("Failed to add journey events during consultation save:", je)

        store_report(patient_id, soap_note)

        return {
            "consultation_id": consultation.consultation_id,
            "session_id": session.session_id,
            "session_number": session_count + 1
        }

    finally:
        db.close()