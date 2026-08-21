import sys
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8")

from fastapi import FastAPI

from app.routes.generate import router as generate_router
from app.routes.upload import router as upload_router
from app.routes.patient import router as patient_router

from fastapi.middleware.cors import CORSMiddleware

from app.database import Base
from app.database import engine
from app.routes.session import (
    router as session_router
)
from app.routes.journey import router as journey_router
from app.models.journey_event import JourneyEvent

from app.routes.appointment import router as appointment_router
from app.models.appointment import Appointment
from app.routes.referral import router as referral_router
from app.models.referral import Referral
from app.routes.investigation import router as investigation_router
from app.models.investigation import Investigation
from app.routes.coordination import router as coordination_router
from app.routes.agent_coordination import router as agent_coordination_router
from app.routes.review import router as review_router
from app.models.coordination_review import CoordinationReview
from app.routes.auth import router as auth_router
from app.models.user import User

app = FastAPI(
    title="ClarityNote AI"
)

Base.metadata.create_all(bind=engine)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload_router)
app.include_router(generate_router)
app.include_router(patient_router)
app.include_router(
    session_router
)
app.include_router(journey_router)
app.include_router(appointment_router)
app.include_router(referral_router)
app.include_router(investigation_router)
app.include_router(coordination_router)
app.include_router(agent_coordination_router)
app.include_router(review_router)
app.include_router(auth_router)

from app.routes.transcribe import (
    router as transcribe_router
)

app.include_router(
    transcribe_router
)

@app.get("/")
def home():
    return {
        "status": "running"
    }