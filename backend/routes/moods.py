from typing import List
from datetime import datetime
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
try:
    from ..database import get_db, MoodLog
    from ..schemas import MoodResponse, MoodCreateRequest
except (ImportError, ValueError):
    from database import get_db, MoodLog
    from schemas import MoodResponse, MoodCreateRequest

router = APIRouter(prefix="/api/moods", tags=["Moods"])

@router.get("", response_model=List[MoodResponse])
def get_moods(db: Session = Depends(get_db)):
    logs = db.query(MoodLog).filter(MoodLog.user_id == "usr_101").order_by(MoodLog.date.desc(), MoodLog.created_at.desc()).all()
    return [
        MoodResponse(
            id=m.id,
            date=m.date,
            moodId=m.mood_id,
            label=m.label,
            emoji=m.emoji,
            time=m.time,
            note=m.note or ""
        )
        for m in logs
    ]

@router.post("", response_model=MoodResponse)
def add_mood(req: MoodCreateRequest, db: Session = Depends(get_db)):
    today = datetime.utcnow().strftime("%Y-%m-%d")
    now_time = datetime.utcnow().strftime("%I:%M %p")
    new_id = f"m_{int(datetime.utcnow().timestamp() * 1000)}"

    mood_obj = req.moodObj
    mood = MoodLog(
        id=new_id,
        user_id="usr_101",
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

    return MoodResponse(
        id=mood.id,
        date=mood.date,
        moodId=mood.mood_id,
        label=mood.label,
        emoji=mood.emoji,
        time=mood.time,
        note=mood.note or ""
    )
