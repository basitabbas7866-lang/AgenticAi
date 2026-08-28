from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from app.database import SessionLocal
from app.models.user import User
from app.models.patient import Patient

router = APIRouter(
    tags=["Authentication"]
)

class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str
    role: str  # doctor, nurse, patient
    specialty: Optional[str] = None
    # Patient-specific fields (required when role == "patient")
    age: Optional[int] = None
    gender: Optional[str] = None
    phone: Optional[str] = None

class LoginRequest(BaseModel):
    email: str
    password: str
    role: str  # doctor, nurse, patient

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/auth/register")
def register_user(req: RegisterRequest, db: Session = Depends(get_db)):
    if req.role not in ["doctor", "nurse", "patient"]:
        raise HTTPException(status_code=400, detail="Invalid role. Must be doctor, nurse, or patient.")
    
    # Validate patient-specific fields
    if req.role == "patient":
        missing = []
        if not req.age:
            missing.append("age")
        if not req.gender:
            missing.append("gender")
        if not req.phone:
            missing.append("phone")
        if missing:
            raise HTTPException(
                status_code=400,
                detail=f"Missing required fields for patient registration: {', '.join(missing)}"
            )
    
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == req.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="An account with this email already exists.")
    
    try:
        patient_id = None

        if req.role == "patient":
            # Generate next patient ID
            last_patient = db.query(Patient).order_by(Patient.patient_id.desc()).first()
            if last_patient:
                next_id = int(last_patient.patient_id[1:]) + 1
            else:
                next_id = 1001
            patient_id = f"P{next_id}"

            new_patient = Patient(
                patient_id=patient_id,
                name=req.name,
                age=req.age,          # Real value from form
                gender=req.gender,    # Real value from form
                phone=req.phone,      # Real value from form
                status="PENDING"
            )
            db.add(new_patient)
            db.flush()  # Flush to get patient_id before user commit

        new_user = User(
            name=req.name,
            email=req.email,
            password=req.password,  # Stored plain for prototype simplicity
            role=req.role,
            specialty=req.specialty if req.role == "doctor" else None,
            patient_id=patient_id   # Link user to patient record
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)

        return {
            "status": "success",
            "message": "User registered successfully",
            "user": {
                "id": new_user.id,
                "name": new_user.name,
                "email": new_user.email,
                "role": new_user.role,
                "specialty": new_user.specialty,
                "patient_id": new_user.patient_id
            }
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/auth/login")
def login_user(req: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(
        User.email == req.email,
        User.password == req.password,
        User.role == req.role
    ).first()
    
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email, password, or role combination.")
    
    # For patient users: resolve patient_id from linked record or name-match fallback
    patient_id = user.patient_id
    if req.role == "patient" and not patient_id:
        # Legacy fallback: find patient by name match
        matched = db.query(Patient).filter(
            Patient.name.ilike(f"%{user.name}%")
        ).first()
        if matched:
            patient_id = matched.patient_id
            # Update user record to persist the link for future logins
            user.patient_id = patient_id
            db.commit()

    return {
        "status": "success",
        "message": "Login successful",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role,
            "specialty": user.specialty,
            "patient_id": patient_id
        }
    }

class UserUpdateRequest(BaseModel):
    name: str
    email: str
    specialty: Optional[str] = None

@router.put("/auth/user/{user_id}/update")
def update_user(user_id: int, req: UserUpdateRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if req.email != user.email:
        existing = db.query(User).filter(User.email == req.email).first()
        if existing:
            raise HTTPException(status_code=400, detail="Email already taken")
            
    try:
        user.name = req.name
        user.email = req.email
        user.specialty = req.specialty
        db.commit()
        db.refresh(user)
        return {
            "success": True,
            "message": "User details updated successfully",
            "user": {
                "id": user.id,
                "name": user.name,
                "email": user.email,
                "role": user.role,
                "specialty": user.specialty,
                "patient_id": user.patient_id
            }
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
