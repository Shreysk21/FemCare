from typing import List
from datetime import datetime
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
try:
    from ..database import get_db, ActivityLog
    from ..schemas import ActivityLogResponse, ActivityLogCreateRequest
    from .auth import get_current_user_id
except (ImportError, ValueError):
    from database import get_db, ActivityLog
    from schemas import ActivityLogResponse, ActivityLogCreateRequest
    from routes.auth import get_current_user_id

router = APIRouter(prefix="/api/activity", tags=["Activity"])

def _format_activity(a: ActivityLog) -> ActivityLogResponse:
    return ActivityLogResponse(
        id=a.id,
        userId=a.user_id,
        date=a.date,
        steps=a.steps or 0,
        stepGoal=a.step_goal or 8000,
        activeMinutes=a.active_minutes or 0
    )

@router.get("", response_model=List[ActivityLogResponse])
def get_activity_logs(user_id: str = Depends(get_current_user_id), db: Session = Depends(get_db)):
    logs = db.query(ActivityLog).filter(ActivityLog.user_id == user_id).order_by(ActivityLog.date.desc()).all()
    return [_format_activity(a) for a in logs]

@router.post("", response_model=ActivityLogResponse)
def add_activity_log(req: ActivityLogCreateRequest, user_id: str = Depends(get_current_user_id), db: Session = Depends(get_db)):
    today = req.date or datetime.utcnow().strftime("%Y-%m-%d")
    new_id = f"act_{int(datetime.utcnow().timestamp() * 1000)}"

    activity = ActivityLog(
        id=new_id,
        user_id=user_id,
        date=today,
        steps=req.steps,
        step_goal=req.stepGoal or 8000,
        active_minutes=req.activeMinutes or 0,
        created_at=datetime.utcnow()
    )
    db.add(activity)
    db.commit()
    db.refresh(activity)
    return _format_activity(activity)
