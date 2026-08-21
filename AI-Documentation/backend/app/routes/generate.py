from fastapi import APIRouter
from pydantic import BaseModel

from app.services.soap_service import (
    generate_soap
)

from app.services.session_service import (
    save_consultation
)

router = APIRouter()


class ConversationRequest(
    BaseModel
):

    patient_id: str
    conversation: str


@router.post("/generate")
def generate(
    request: ConversationRequest
):

    report = generate_soap(
        request.conversation,
        request.patient_id
    )

    session_id = save_consultation(
        patient_id=request.patient_id,
        transcript=request.conversation,
        report=report
    )

    return {

        "session_id":
        session_id,

        "response":
        report

    }