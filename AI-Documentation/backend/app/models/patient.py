from sqlalchemy import Column
from sqlalchemy import String
from sqlalchemy import Integer
from sqlalchemy import Text
from sqlalchemy import DateTime
from sqlalchemy import ForeignKey

from datetime import datetime

from app.database import Base


class Patient(Base):

    __tablename__ = "patients"

    patient_id = Column(
        String,
        primary_key=True
    )

    name = Column(String)

    age = Column(Integer)

    gender = Column(String)

    phone = Column(String)

    assigned_doctor_id = Column(String, nullable=True)
    status = Column(String, default="PENDING") # PENDING, APPROVED

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )


class Report(Base):
    __tablename__ = "reports"

    report_id = Column(
        Integer,
        primary_key=True
    )

    patient_id = Column(
        String
    )

    report_text = Column(
        Text
    )


class Prescription(Base):
    __tablename__ = "prescriptions"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )
    patient_id = Column(
        String,
        nullable=False,
        index=True
    )
    doctor_id = Column(
        String,
        nullable=False
    )
    doctor_name = Column(
        String,
        nullable=False
    )
    medication_name = Column(
        String,
        nullable=False
    )
    instructions = Column(
        Text,
        nullable=False
    )
    prescribed_at = Column(
        DateTime,
        default=datetime.utcnow
    )