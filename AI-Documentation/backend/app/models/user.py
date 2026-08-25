from sqlalchemy import Column, Integer, String
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)  # Stored as plain text for mock/prototype simplicity
    role = Column(String, nullable=False)  # doctor, nurse, patient
    specialty = Column(String, nullable=True)  # medical specialty for doctors
    patient_id = Column(String, nullable=True)  # linked Patient record ID for patient-role users
