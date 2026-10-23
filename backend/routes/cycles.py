from typing import List
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
try:
    from ..database import get_db, Cycle, CycleFlowLog, SymptomLog, MoodLog, UserProfile
    from ..schemas import CycleResponse, CycleLogFlowRequest, CycleCreateRequest, CycleUpdateRequest, FlowLogItem
    from .auth import get_current_user_id
except (ImportError, ValueError):
    from database import get_db, Cycle, CycleFlowLog, SymptomLog, MoodLog, UserProfile
    from schemas import CycleResponse, CycleLogFlowRequest, CycleCreateRequest, CycleUpdateRequest, FlowLogItem
    from routes.auth import get_current_user_id

router = APIRouter(prefix="/api/cycles", tags=["Cycles"])

def _format_cycle(c: Cycle) -> CycleResponse:
    flow_logs = [
        FlowLogItem(date=fl.date, flow=fl.flow, icon=fl.icon)
        for fl in c.flow_logs
    ]
    return CycleResponse(
        id=c.id,
        startDate=c.start_date,
        endDate=c.end_date,
        length=c.length,
        periodDuration=c.period_duration,
        status=c.status,
        phase=c.phase,
        notes=c.notes,
        flowLogs=flow_logs
    )

@router.get("", response_model=List[CycleResponse])
def get_cycles(user_id: str = Depends(get_current_user_id), db: Session = Depends(get_db)):
    cycles = db.query(Cycle).filter(Cycle.user_id == user_id).order_by(Cycle.start_date.desc()).all()
    return [_format_cycle(c) for c in cycles]

@router.post("", response_model=CycleResponse)
def create_cycle(req: CycleCreateRequest, user_id: str = Depends(get_current_user_id), db: Session = Depends(get_db)):
    new_id = f"cyc_{int(datetime.utcnow().timestamp() * 1000)}"
    new_cycle = Cycle(
        id=new_id,
        user_id=user_id,
        start_date=req.startDate,
        end_date=req.endDate,
        length=req.length or 28,
        period_duration=req.periodDuration or 5,
        status=req.status or "completed",
        phase=req.phase or "Follicular Phase",
        notes=req.notes or ""
    )
    db.add(new_cycle)

    profile = db.query(UserProfile).filter(UserProfile.id == user_id).first()
    if profile:
        if not profile.last_period_start_date or str(req.startDate) > str(profile.last_period_start_date):
            profile.last_period_start_date = req.startDate

    db.commit()
    db.refresh(new_cycle)
    return _format_cycle(new_cycle)

@router.put("/{cycle_id}", response_model=CycleResponse)
def update_cycle(cycle_id: str, req: CycleUpdateRequest, user_id: str = Depends(get_current_user_id), db: Session = Depends(get_db)):
    cycle = db.query(Cycle).filter(Cycle.id == cycle_id, Cycle.user_id == user_id).first()
    if not cycle:
        raise HTTPException(status_code=404, detail="Cycle record not found")

    if req.startDate is not None:
        cycle.start_date = req.startDate
    if req.endDate is not None:
        cycle.end_date = req.endDate
    if req.length is not None:
        cycle.length = req.length
    if req.periodDuration is not None:
        cycle.period_duration = req.periodDuration
    if req.status is not None:
        cycle.status = req.status
    if req.phase is not None:
        cycle.phase = req.phase
    if req.notes is not None:
        cycle.notes = req.notes

    db.commit()
    db.refresh(cycle)
    return _format_cycle(cycle)

@router.delete("/{cycle_id}")
def delete_cycle(cycle_id: str, user_id: str = Depends(get_current_user_id), db: Session = Depends(get_db)):
    cycle = db.query(Cycle).filter(Cycle.id == cycle_id, Cycle.user_id == user_id).first()
    if not cycle:
        raise HTTPException(status_code=404, detail="Cycle record not found")

    db.delete(cycle)
    db.commit()
    return {"message": "Cycle deleted successfully", "id": cycle_id}

@router.post("/flow", response_model=CycleResponse)
def log_cycle_flow(req: CycleLogFlowRequest, user_id: str = Depends(get_current_user_id), db: Session = Depends(get_db)):
    today = req.startDate or datetime.utcnow().strftime("%Y-%m-%d")
    icon = "💧" if req.flow == "Light" else "🩸"

    # Get or create current cycle for this authenticated user
    current_cycle = db.query(Cycle).filter(Cycle.user_id == user_id, Cycle.status == "current").first()
    if not current_cycle:
        current_cycle = Cycle(
            id=f"cyc_{int(datetime.utcnow().timestamp())}",
            user_id=user_id,
            start_date=today,
            length=28,
            period_duration=5,
            status="current",
            phase="Menstrual Phase",
            notes="Logged via FemCare app"
        )
        db.add(current_cycle)
        db.flush()

    # Find existing flow log or create new
    existing_flow = db.query(CycleFlowLog).filter(
        CycleFlowLog.cycle_id == current_cycle.id,
        CycleFlowLog.date == today
    ).first()

    if existing_flow:
        existing_flow.flow = req.flow
        existing_flow.icon = icon
    else:
        new_flow = CycleFlowLog(
            id=f"fl_{int(datetime.utcnow().timestamp() * 1000)}",
            cycle_id=current_cycle.id,
            date=today,
            flow=req.flow,
            icon=icon
        )
        db.add(new_flow)

    # Optional Mood logging
    if req.optionalMood:
        mood_obj = req.optionalMood
        new_mood = MoodLog(
            id=f"m_{int(datetime.utcnow().timestamp() * 1000)}",
            user_id=user_id,
            date=today,
            mood_id=mood_obj.get("id", "good"),
            label=mood_obj.get("label", "Good"),
            emoji=mood_obj.get("emoji", "🙂"),
            time=datetime.utcnow().strftime("%I:%M %p"),
            note="Recorded during period log"
        )
        db.add(new_mood)

    # Optional Symptoms logging
    if req.optionalSymptoms:
        for sym in req.optionalSymptoms:
            new_sym = SymptomLog(
                id=f"sym_{int(datetime.utcnow().timestamp() * 1000)}",
                user_id=user_id,
                date=today,
                symptom_id=sym.get("name", "symptom").lower().replace(" ", "_"),
                symptom_name=sym.get("name", "Symptom"),
                category=sym.get("category", "Pain & Discomfort"),
                severity="Moderate",
                time_logged=datetime.utcnow().strftime("%I:%M %p"),
                notes="Recorded during period log"
            )
            db.add(new_sym)

    # Update profile last_period_start_date
    profile = db.query(UserProfile).filter(UserProfile.id == user_id).first()
    if profile:
        if not profile.last_period_start_date or str(today) >= str(profile.last_period_start_date):
            profile.last_period_start_date = today

    db.commit()
    db.refresh(current_cycle)
    return _format_cycle(current_cycle)

@router.delete("/{cycle_id}/flow/{flow_date}")
def delete_cycle_flow(cycle_id: str, flow_date: str, user_id: str = Depends(get_current_user_id), db: Session = Depends(get_db)):
    cycle = db.query(Cycle).filter(Cycle.id == cycle_id, Cycle.user_id == user_id).first()
    if not cycle:
        raise HTTPException(status_code=404, detail="Cycle not found or unauthorized")

    flow_log = db.query(CycleFlowLog).filter(
        CycleFlowLog.cycle_id == cycle_id,
        CycleFlowLog.date == flow_date
    ).first()

    if not flow_log:
        raise HTTPException(status_code=404, detail="Flow entry not found")

    db.delete(flow_log)
    db.commit()
    return {"message": "Flow log deleted successfully", "cycleId": cycle_id, "date": flow_date}
