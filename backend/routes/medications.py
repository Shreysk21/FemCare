from typing import List
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
try:
    from ..database import get_db, Medication
    from ..schemas import MedicationResponse, MedicationCreateRequest
    from .auth import get_current_user_id
except (ImportError, ValueError):
    from database import get_db, Medication
    from schemas import MedicationResponse, MedicationCreateRequest
    from routes.auth import get_current_user_id

router = APIRouter(prefix="/api/medications", tags=["Medications"])

def _format_med(m: Medication) -> MedicationResponse:
    return MedicationResponse(
        id=m.id,
        userId=m.user_id,
        name=m.name,
        dosage=m.dosage or "1 tablet",
        scheduleTime=m.schedule_time or "08:00 AM",
        reminderEnabled=bool(m.reminder_enabled),
        createdAt=m.created_at.strftime("%Y-%m-%d %I:%M %p") if m.created_at else ""
    )

@router.get("", response_model=List[MedicationResponse])
def get_medications(user_id: str = Depends(get_current_user_id), db: Session = Depends(get_db)):
    meds = db.query(Medication).filter(Medication.user_id == user_id).order_by(Medication.created_at.asc()).all()
    return [_format_med(m) for m in meds]

@router.post("", response_model=MedicationResponse)
def add_medication(req: MedicationCreateRequest, user_id: str = Depends(get_current_user_id), db: Session = Depends(get_db)):
    if not req.name or not req.name.strip():
        raise HTTPException(status_code=400, detail="Medication name is required")

    new_id = f"med_{int(datetime.utcnow().timestamp() * 1000)}"

    med = Medication(
        id=new_id,
        user_id=user_id,
        name=req.name.strip(),
        dosage=req.dosage or "1 tablet",
        schedule_time=req.scheduleTime or "08:00 AM",
        reminder_enabled=req.reminderEnabled if req.reminderEnabled is not None else True,
        created_at=datetime.utcnow()
    )
    db.add(med)
    db.commit()
    db.refresh(med)
    return _format_med(med)

@router.delete("/{med_id}")
def delete_medication(med_id: str, user_id: str = Depends(get_current_user_id), db: Session = Depends(get_db)):
    med = db.query(Medication).filter(Medication.id == med_id, Medication.user_id == user_id).first()
    if not med:
        raise HTTPException(status_code=404, detail="Medication record not found or unauthorized")

    db.delete(med)
    db.commit()
    return {"message": "Medication deleted successfully", "id": med_id}
