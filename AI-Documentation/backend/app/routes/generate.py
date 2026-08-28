from fastapi import APIRouter
from pydantic import BaseModel
from app.services.soap_service import generate_soap_with_rag, compile_final_report
from app.services.session_service import save_consultation

router = APIRouter()

class ConversationRequest(BaseModel):
    patient_id: str
    conversation: str

class FinalReportRequest(BaseModel):
    patient_id: str
    soap_note: str
    prescription: str
    historical_comparison: str = ""

@router.post("/generate")
def generate(request: ConversationRequest):
    result = generate_soap_with_rag(
        request.conversation,
        request.patient_id
    )

    report = result["report"]
    rag_metadata = result.get("rag_metadata", {})

    session_id = save_consultation(
        patient_id=request.patient_id,
        transcript=request.conversation,
        report=report
    )

    return {
        "session_id": session_id,
        "response": report,
        "rag_metadata": rag_metadata
    }

@router.post("/generate/final_report")
def generate_final(request: FinalReportRequest):
    final_report = compile_final_report(
        soap_note=request.soap_note,
        prescription=request.prescription,
        historical_comparison=request.historical_comparison
    )
    return {
        "status": "success",
        "final_report": final_report
    }