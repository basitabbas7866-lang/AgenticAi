# reset_db.py
import os
import sys
import shutil
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Add current path to sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import Base, engine
from app.models.user import User
from app.models.patient import Patient, Report, Prescription
from app.models.session import Session
from app.models.consultation import Consultation
from app.models.appointment import Appointment
from app.models.referral import Referral
from app.models.investigation import Investigation
from app.models.journey_event import JourneyEvent
from app.models.coordination_review import CoordinationReview

def reset_all():
    print("Connecting to database...")
    SessionLocal = sessionmaker(bind=engine)
    db = SessionLocal()

    try:
        # 1. Read existing users that are doctors or nurses
        clinicians = db.query(User).filter(User.role.in_(["doctor", "nurse"])).all()
        clinician_data = []
        for c in clinicians:
            clinician_data.append({
                "name": c.name,
                "email": c.email,
                "password": c.password,
                "role": c.role,
                "specialty": c.specialty,
                "patient_id": None
            })
        print(f"Found {len(clinician_data)} doctor/nurse user accounts to preserve.")

        # Close session before dropping tables
        db.close()

        # 2. Drop all tables
        print("Dropping all database tables...")
        Base.metadata.drop_all(bind=engine)

        # 3. Create all tables fresh
        print("Recreating database tables...")
        Base.metadata.create_all(bind=engine)

        # Re-open session to insert users
        db = SessionLocal()
        print("Re-inserting doctor/nurse accounts...")
        for data in clinician_data:
            db.add(User(**data))
        db.commit()
        print("SQLite Database reset complete.")

    except Exception as e:
        print(f"Error during database reset: {e}")
        db.rollback()
    finally:
        db.close()

    # 5. Clear ChromaDB
    chroma_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "chroma_db"))
    if os.path.exists(chroma_path):
        print(f"Clearing ChromaDB directory at {chroma_path}...")
        try:
            shutil.rmtree(chroma_path)
            print("ChromaDB vector store cleared.")
        except Exception as e:
            print(f"Error clearing ChromaDB directory: {e}")
    else:
        print("ChromaDB directory not found, nothing to clear.")

if __name__ == "__main__":
    reset_all()
