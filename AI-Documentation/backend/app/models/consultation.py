from sqlalchemy import Column
from sqlalchemy import Integer
from sqlalchemy import String
from sqlalchemy import Text
from sqlalchemy import DateTime

from datetime import datetime

from app.database import Base


class Consultation(Base):

    __tablename__ = "consultations"

    consultation_id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    session_id = Column(
        Integer,
        nullable=False
    )

    patient_id = Column(
        String,
        nullable=False
    )

    transcript = Column(
        Text
    )

    report = Column(
        Text
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )