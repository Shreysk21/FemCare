from datetime import datetime
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
try:
    from ..database import get_db, HydrationLog, HydrationEntry
    from ..schemas import HydrationResponse, HydrationAddRequest, HydrationHistoryItem
    from .auth import get_current_user_id
except (ImportError, ValueError):
    from database import get_db, HydrationLog, HydrationEntry
    from schemas import HydrationResponse, HydrationAddRequest, HydrationHistoryItem
    from routes.auth import get_current_user_id

router = APIRouter(prefix="/api/hydration", tags=["Hydration"])

@router.get("", response_model=HydrationResponse)
def get_hydration(user_id: str = Depends(get_current_user_id), db: Session = Depends(get_db)):
    today = datetime.utcnow().strftime("%Y-%m-%d")
    log = db.query(HydrationLog).filter(
        HydrationLog.user_id == user_id,
        HydrationLog.date == today
    ).first()

    if not log:
        # Fallback to the latest record for this user
        log = db.query(HydrationLog).filter(HydrationLog.user_id == user_id).order_by(HydrationLog.date.desc()).first()

    if not log:
        # Return default 0 progress for user without fabricating entries
        return HydrationResponse(
            date=today,
            currentMl=0,
            goalMl=2000,
            glasses=0,
            targetGlasses=8,
            history=[]
        )

    history_items = [
        HydrationHistoryItem(time=e.time, amountMl=e.amount_ml)
        for e in log.entries
    ]

    return HydrationResponse(
        date=log.date,
        currentMl=log.current_ml,
        goalMl=log.goal_ml,
        glasses=log.glasses,
        targetGlasses=log.target_glasses,
        history=history_items
    )

@router.post("/add", response_model=HydrationResponse)
def add_hydration(req: HydrationAddRequest, user_id: str = Depends(get_current_user_id), db: Session = Depends(get_db)):
    today = datetime.utcnow().strftime("%Y-%m-%d")
    now_time = datetime.utcnow().strftime("%I:%M %p")

    log = db.query(HydrationLog).filter(
        HydrationLog.user_id == user_id,
        HydrationLog.date == today
    ).first()

    if not log:
        log = HydrationLog(
            id=f"hyd_{int(datetime.utcnow().timestamp())}",
            user_id=user_id,
            date=today,
            current_ml=0,
            goal_ml=2000,
            glasses=0,
            target_glasses=8
        )
        db.add(log)
        db.flush()

    amount = req.get_amount()
    new_ml = log.current_ml + amount
    new_glasses = min(round(new_ml / 250), 12)
    log.current_ml = new_ml
    log.glasses = new_glasses

    entry = HydrationEntry(
        id=f"he_{int(datetime.utcnow().timestamp() * 1000)}",
        hydration_log_id=log.id,
        time=now_time,
        amount_ml=amount
    )
    db.add(entry)
    db.commit()
    db.refresh(log)

    history_items = [
        HydrationHistoryItem(time=e.time, amountMl=e.amount_ml)
        for e in log.entries
    ]

    return HydrationResponse(
        date=log.date,
        currentMl=log.current_ml,
        goalMl=log.goal_ml,
        glasses=log.glasses,
        targetGlasses=log.target_glasses,
        history=history_items
    )
