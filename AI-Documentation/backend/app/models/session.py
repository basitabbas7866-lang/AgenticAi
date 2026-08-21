from sqlalchemy import Column
from sqlalchemy import Integer
from sqlalchemy import String
from sqlalchemy import DateTime

from datetime import datetime

from app.database import Base


class Session(Base):

    __tablename__ = "sessions"

    session_id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    patient_id = Column(
        String,
        nullable=False
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )