from typing import List
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
try:
    from ..database import get_db, MoodLog
    from ..schemas import MoodResponse, MoodCreateRequest
    from .auth import get_current_user_id
except (ImportError, ValueError):
    from database import get_db, MoodLog
    from schemas import MoodResponse, MoodCreateRequest
    from routes.auth import get_current_user_id

router = APIRouter(prefix="/api/moods", tags=["Moods"])

def _format_mood(m: MoodLog) -> MoodResponse:
    return MoodResponse(
        id=m.id,
        date=m.date,
        moodId=m.mood_id,
        label=m.label,
        emoji=m.emoji,
        time=m.time,
        note=m.note or ""
    )

@router.get("", response_model=List[MoodResponse])
def get_moods(user_id: str = Depends(get_current_user_id), db: Session = Depends(get_db)):
    logs = db.query(MoodLog).filter(MoodLog.user_id == user_id).order_by(MoodLog.date.desc(), MoodLog.created_at.desc()).all()
    return [_format_mood(m) for m in logs]

@router.post("", response_model=MoodResponse)
def add_mood(req: MoodCreateRequest, user_id: str = Depends(get_current_user_id), db: Session = Depends(get_db)):
    today = datetime.utcnow().strftime("%Y-%m-%d")
    now_time = datetime.utcnow().strftime("%I:%M %p")
    new_id = f"m_{int(datetime.utcnow().timestamp() * 1000)}"

    mood_obj = req.moodObj
    mood = MoodLog(
        id=new_id,
        user_id=user_id,
        date=today,
        mood_id=mood_obj.get("id", "good"),
        label=mood_obj.get("label", "Good"),
        emoji=mood_obj.get("emoji", "🙂"),
        time=now_time,
        note=req.note or ""
    )
    db.add(mood)
    db.commit()
    db.refresh(mood)
    return _format_mood(mood)

@router.delete("/{mood_id}")
def delete_mood(mood_id: str, user_id: str = Depends(get_current_user_id), db: Session = Depends(get_db)):
    mood = db.query(MoodLog).filter(MoodLog.id == mood_id, MoodLog.user_id == user_id).first()
    if not mood:
        raise HTTPException(status_code=404, detail="Mood log not found or unauthorized")

    db.delete(mood)
    db.commit()
    return {"message": "Mood log deleted successfully", "id": mood_id}
