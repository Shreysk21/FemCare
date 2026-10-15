from typing import List
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
try:
    from ..database import get_db, SymptomLog
    from ..schemas import SymptomResponse, SymptomCreateRequest, SymptomUpdateRequest
except (ImportError, ValueError):
    from database import get_db, SymptomLog
    from schemas import SymptomResponse, SymptomCreateRequest, SymptomUpdateRequest

router = APIRouter(prefix="/api/symptoms", tags=["Symptoms"])

@router.get("", response_model=List[SymptomResponse])
def get_symptoms(db: Session = Depends(get_db)):
    logs = db.query(SymptomLog).filter(SymptomLog.user_id == "usr_101").order_by(SymptomLog.date.desc(), SymptomLog.created_at.desc()).all()
    return [
        SymptomResponse(
            id=s.id,
            date=s.date,
            symptomId=s.symptom_id,
            symptomName=s.symptom_name,
            category=s.category,
            severity=s.severity,
            timeLogged=s.time_logged,
            notes=s.notes or ""
        )
        for s in logs
    ]

@router.post("", response_model=SymptomResponse)
def add_symptom(req: SymptomCreateRequest, db: Session = Depends(get_db)):
    today = datetime.utcnow().strftime("%Y-%m-%d")
    now_time = datetime.utcnow().strftime("%I:%M %p")
    new_id = f"sym_{int(datetime.utcnow().timestamp() * 1000)}"

    symptom = SymptomLog(
        id=new_id,
        user_id="usr_101",
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

    return SymptomResponse(
        id=symptom.id,
        date=symptom.date,
        symptomId=symptom.symptom_id,
        symptomName=symptom.symptom_name,
        category=symptom.category,
        severity=symptom.severity,
        timeLogged=symptom.time_logged,
        notes=symptom.notes or ""
    )

@router.put("/{symptom_id}", response_model=SymptomResponse)
def update_symptom(symptom_id: str, req: SymptomUpdateRequest, db: Session = Depends(get_db)):
    symptom = db.query(SymptomLog).filter(SymptomLog.id == symptom_id).first()
    if not symptom:
        raise HTTPException(status_code=404, detail="Symptom log not found")

    symptom.severity = req.severity
    symptom.notes = req.notes or ""

    db.commit()
    db.refresh(symptom)

    return SymptomResponse(
        id=symptom.id,
        date=symptom.date,
        symptomId=symptom.symptom_id,
        symptomName=symptom.symptom_name,
        category=symptom.category,
        severity=symptom.severity,
        timeLogged=symptom.time_logged,
        notes=symptom.notes or ""
    )

@router.delete("/{symptom_id}")
def delete_symptom(symptom_id: str, db: Session = Depends(get_db)):
    symptom = db.query(SymptomLog).filter(SymptomLog.id == symptom_id).first()
    if not symptom:
        raise HTTPException(status_code=404, detail="Symptom log not found")

    db.delete(symptom)
    db.commit()
    return {"message": "Symptom deleted successfully", "id": symptom_id}
