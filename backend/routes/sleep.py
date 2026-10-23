from typing import List
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
try:
    from ..database import get_db, SleepLog
    from ..schemas import SleepLogResponse, SleepLogCreateRequest
    from .auth import get_current_user_id
except (ImportError, ValueError):
    from database import get_db, SleepLog
    from schemas import SleepLogResponse, SleepLogCreateRequest
    from routes.auth import get_current_user_id

router = APIRouter(prefix="/api/sleep", tags=["Sleep"])

def _format_sleep(s: SleepLog) -> SleepLogResponse:
    return SleepLogResponse(
        id=s.id,
        userId=s.user_id,
        date=s.date,
        hours=s.hours or 0,
        minutes=s.minutes or 0,
        quality=s.quality or "Good",
        qualityEmoji=s.quality_emoji or "😴",
        createdAt=s.created_at.strftime("%Y-%m-%d %I:%M %p") if s.created_at else ""
    )

@router.get("", response_model=List[SleepLogResponse])
def get_sleep_logs(user_id: str = Depends(get_current_user_id), db: Session = Depends(get_db)):
    logs = db.query(SleepLog).filter(SleepLog.user_id == user_id).order_by(SleepLog.date.desc(), SleepLog.created_at.desc()).all()
    return [_format_sleep(s) for s in logs]

@router.post("", response_model=SleepLogResponse)
def add_sleep_log(req: SleepLogCreateRequest, user_id: str = Depends(get_current_user_id), db: Session = Depends(get_db)):
    today = req.date or datetime.utcnow().strftime("%Y-%m-%d")
    new_id = f"slp_{int(datetime.utcnow().timestamp() * 1000)}"

    sleep = SleepLog(
        id=new_id,
        user_id=user_id,
        date=today,
        hours=req.hours,
        minutes=req.minutes,
        quality=req.quality or "Good",
        quality_emoji=req.qualityEmoji or "😴",
        created_at=datetime.utcnow()
    )
    db.add(sleep)
    db.commit()
    db.refresh(sleep)
    return _format_sleep(sleep)

@router.delete("/{sleep_id}")
def delete_sleep_log(sleep_id: str, user_id: str = Depends(get_current_user_id), db: Session = Depends(get_db)):
    sleep = db.query(SleepLog).filter(SleepLog.id == sleep_id, SleepLog.user_id == user_id).first()
    if not sleep:
        raise HTTPException(status_code=404, detail="Sleep record not found or unauthorized")

    db.delete(sleep)
    db.commit()
    return {"message": "Sleep record deleted successfully", "id": sleep_id}
