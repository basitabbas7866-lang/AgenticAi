from fastapi import APIRouter
from pydantic import BaseModel

from app.orchestrator.clinical_pipeline import run_pipeline
from app.services.session_service import save_consultation
from app.services.finalize_report_service import finalize_report

router = APIRouter()


class ConversationRequest(BaseModel):
    patient_id: str
    conversation: str


class FinalizeRequest(BaseModel):
    consultation_id: int
    doctor_diagnosis: str
    doctor_prescription: str
    doctor_notes: str


@router.post("/generate")
def generate(request: ConversationRequest):
    """
    Run the three-agent clinical pipeline:
      Agent 1 — SOAP Note
      Agent 2 — Clinical Insights
      Agent 3 — Validation Report
    Save results to DB and return all three outputs.
    """

    result = run_pipeline(
        request.conversation,
        request.patient_id
    )

    session_data = save_consultation(
        patient_id=request.patient_id,
        transcript=request.conversation,
        soap_note=result["soap"],
        ai_insights=result["insights"],
        validation=result["validation"]
    )

    return {
        "consultation_id": session_data["consultation_id"],
        "session_id": session_data["session_id"],
        "session_number": session_data["session_number"],
        "soap": result["soap"],
        "insights": result["insights"],
        "validation": result["validation"]
    }


@router.post("/finalize-report")
def finalize(request: FinalizeRequest):
    """
    Doctor review step: save diagnosis, prescription, notes.
    Compile the final printable report and index in ChromaDB.
    """

    report = finalize_report(
        consultation_id=request.consultation_id,
        doctor_diagnosis=request.doctor_diagnosis,
        doctor_prescription=request.doctor_prescription,
        doctor_notes=request.doctor_notes
    )

    return {
        "final_report": report
    }