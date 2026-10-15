from typing import List
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
try:
    from ..database import get_db, Cycle, CycleFlowLog, SymptomLog, MoodLog
    from ..schemas import CycleResponse, CycleLogFlowRequest, FlowLogItem
except (ImportError, ValueError):
    from database import get_db, Cycle, CycleFlowLog, SymptomLog, MoodLog
    from schemas import CycleResponse, CycleLogFlowRequest, FlowLogItem

router = APIRouter(prefix="/api/cycles", tags=["Cycles"])

@router.get("", response_model=List[CycleResponse])
def get_cycles(db: Session = Depends(get_db)):
    cycles = db.query(Cycle).filter(Cycle.user_id == "usr_101").order_by(Cycle.start_date.desc()).all()
    results = []
    for c in cycles:
        flow_logs = [
            FlowLogItem(date=fl.date, flow=fl.flow, icon=fl.icon)
            for fl in c.flow_logs
        ]
        results.append(
            CycleResponse(
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
        )
    return results

@router.post("/flow", response_model=CycleResponse)
def log_cycle_flow(req: CycleLogFlowRequest, db: Session = Depends(get_db)):
    today = req.startDate or datetime.utcnow().strftime("%Y-%m-%d")
    icon = "💧" if req.flow == "Light" else "🩸"

    # Get or create current cycle
    current_cycle = db.query(Cycle).filter(Cycle.user_id == "usr_101", Cycle.status == "current").first()
    if not current_cycle:
        current_cycle = Cycle(
            id=f"cyc_{int(datetime.utcnow().timestamp())}",
            user_id="usr_101",
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
            user_id="usr_101",
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
                user_id="usr_101",
                date=today,
                symptom_id=sym.get("name", "symptom").lower().replace(" ", "_"),
                symptom_name=sym.get("name", "Symptom"),
                category=sym.get("category", "Pain & Discomfort"),
                severity="Moderate",
                time_logged=datetime.utcnow().strftime("%I:%M %p"),
                notes="Recorded during period log"
            )
            db.add(new_sym)

    db.commit()
    db.refresh(current_cycle)

    return CycleResponse(
        id=current_cycle.id,
        startDate=current_cycle.start_date,
        endDate=current_cycle.end_date,
        length=current_cycle.length,
        periodDuration=current_cycle.period_duration,
        status=current_cycle.status,
        phase=current_cycle.phase,
        notes=current_cycle.notes,
        flowLogs=[
            FlowLogItem(date=fl.date, flow=fl.flow, icon=fl.icon)
            for fl in current_cycle.flow_logs
        ]
    )

@router.delete("/{cycle_id}/flow/{flow_date}")
def delete_cycle_flow(cycle_id: str, flow_date: str, db: Session = Depends(get_db)):
    flow_log = db.query(CycleFlowLog).filter(
        CycleFlowLog.cycle_id == cycle_id,
        CycleFlowLog.date == flow_date
    ).first()

    if not flow_log:
        raise HTTPException(status_code=404, detail="Flow entry not found")

    db.delete(flow_log)
    db.commit()
    return {"message": "Flow log deleted successfully", "cycleId": cycle_id, "date": flow_date}
