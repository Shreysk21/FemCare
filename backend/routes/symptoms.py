from typing import List
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
try:
    from ..database import get_db, SymptomLog
    from ..schemas import SymptomResponse, SymptomCreateRequest, SymptomUpdateRequest
    from .auth import get_current_user_id
except (ImportError, ValueError):
    from database import get_db, SymptomLog
    from schemas import SymptomResponse, SymptomCreateRequest, SymptomUpdateRequest
    from routes.auth import get_current_user_id

router = APIRouter(prefix="/api/symptoms", tags=["Symptoms"])

def _format_symptom(s: SymptomLog) -> SymptomResponse:
    return SymptomResponse(
        id=s.id,
        date=s.date,
        symptomId=s.symptom_id,
        symptomName=s.symptom_name,
        category=s.category,
        severity=s.severity,
        timeLogged=s.time_logged,
        notes=s.notes or ""
    )

@router.get("", response_model=List[SymptomResponse])
def get_symptoms(user_id: str = Depends(get_current_user_id), db: Session = Depends(get_db)):
    logs = db.query(SymptomLog).filter(SymptomLog.user_id == user_id).order_by(SymptomLog.date.desc(), SymptomLog.created_at.desc()).all()
    return [_format_symptom(s) for s in logs]

@router.post("", response_model=SymptomResponse)
def add_symptom(req: SymptomCreateRequest, user_id: str = Depends(get_current_user_id), db: Session = Depends(get_db)):
    today = datetime.utcnow().strftime("%Y-%m-%d")
    now_time = datetime.utcnow().strftime("%I:%M %p")
    new_id = f"sym_{int(datetime.utcnow().timestamp() * 1000)}"

    symptom = SymptomLog(
        id=new_id,
        user_id=user_id,
        date=today,
        symptom_id=req.symptomName.lower().replace(" ", "_"),
        symptom_name=req.symptomName,
        category=req.category or "Pain & Discomfort",
        severity=req.severity or "Moderate",
        time_logged=now_time,
        notes=req.notes or ""
    )
    db.add(symptom)
    db.commit()
    db.refresh(symptom)
    return _format_symptom(symptom)

@router.put("/{symptom_id}", response_model=SymptomResponse)
def update_symptom(symptom_id: str, req: SymptomUpdateRequest, user_id: str = Depends(get_current_user_id), db: Session = Depends(get_db)):
    symptom = db.query(SymptomLog).filter(SymptomLog.id == symptom_id, SymptomLog.user_id == user_id).first()
    if not symptom:
        raise HTTPException(status_code=404, detail="Symptom log not found or unauthorized")

    symptom.severity = req.severity
    symptom.notes = req.notes or ""

    db.commit()
    db.refresh(symptom)
    return _format_symptom(symptom)

@router.delete("/{symptom_id}")
def delete_symptom(symptom_id: str, user_id: str = Depends(get_current_user_id), db: Session = Depends(get_db)):
    symptom = db.query(SymptomLog).filter(SymptomLog.id == symptom_id, SymptomLog.user_id == user_id).first()
    if not symptom:
        raise HTTPException(status_code=404, detail="Symptom log not found or unauthorized")

    db.delete(symptom)
    db.commit()
    return {"message": "Symptom deleted successfully", "id": symptom_id}
