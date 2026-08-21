from fastapi import APIRouter

from app.database import (
    SessionLocal
)

from app.models.consultation import (
    Consultation
)

router = APIRouter(
    tags=["Sessions"]
)


@router.get(
    "/patient/{patient_id}/sessions"
)
def get_patient_sessions(
    patient_id: str
):

    db = SessionLocal()

    try:

        consultations = (

            db.query(
                Consultation
            )

            .filter(
                Consultation.patient_id
                == patient_id
            )

            .order_by(
                Consultation.created_at.desc()
            )

            .all()

        )

        result = []

        for item in consultations:

            result.append({

                "consultation_id":
                item.consultation_id,

                "session_id":
                item.session_id,

                "transcript":
                item.transcript,

                "report":
                item.report,

                "created_at":
                item.created_at

            })

        return result

    finally:

        db.close()