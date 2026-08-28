from app.database import SessionLocal
from app.models.consultation import Consultation
from app.agents.formatter_agent import generate_final_report
from app.rag.store_history import store_history


def finalize_report(consultation_id, doctor_diagnosis, doctor_prescription, doctor_notes):

    db = SessionLocal()

    try:
        consultation = (
            db.query(Consultation)
            .filter(Consultation.consultation_id == consultation_id)
            .first()
        )

        if not consultation:
            raise Exception("Consultation Not Found")

        report = generate_final_report(
            patient_id=consultation.patient_id,
            soap=consultation.soap_note or "",
            doctor_diagnosis=doctor_diagnosis,
            doctor_prescription=doctor_prescription,
            doctor_notes=doctor_notes
        )

        consultation.final_report = report
        consultation.doctor_diagnosis = doctor_diagnosis
        consultation.doctor_prescription = doctor_prescription
        consultation.doctor_notes = doctor_notes

        db.commit()

        # --------------------------------
        # Store Doctor Validated History in ChromaDB
        # --------------------------------
        store_history(
            patient_id=consultation.patient_id,
            diagnosis=doctor_diagnosis,
            prescription=doctor_prescription,
            notes=doctor_notes
        )

        print(f"Doctor History Stored For {consultation.patient_id}")

        # Also add journey event for finalized report
        try:
            from app.services.journey_service import add_journey_event
            add_journey_event(
                db=db,
                patient_id=consultation.patient_id,
                event_type="documentation",
                title="Final Clinical Report Finalized",
                description="Doctor-reviewed and signed-off clinical summary compiled.",
                status="Completed",
                department_service="AI Clinical Documentation Engine",
                related_entity_type="consultation",
                related_entity_id=str(consultation_id)
            )
        except Exception as je:
            print("Failed to add journey event for finalized report:", je)

        return report

    finally:
        db.close()
