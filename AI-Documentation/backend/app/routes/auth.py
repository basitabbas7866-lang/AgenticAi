from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.database import SessionLocal
from app.models.user import User

router = APIRouter(
    tags=["Authentication"]
)

class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str
    role: str  # doctor, nurse, patient
    specialty: str | None = None

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
    
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == req.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="An account with this email already exists.")
    
    try:
        new_user = User(
            name=req.name,
            email=req.email,
            password=req.password,  # Stored plain for prototype simplicity
            role=req.role,
            specialty=req.specialty if req.role == "doctor" else None
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
                "specialty": new_user.specialty
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
    
    return {
        "status": "success",
        "message": "Login successful",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role,
            "specialty": user.specialty
        }
    }
