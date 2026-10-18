from typing import List, Dict, Any
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
try:
    from ..database import get_db, MigraineLog, PcodLog, UserProfile, Cycle, SymptomLog
    from ..schemas import (
        MigraineLogCreateRequest,
        MigraineLogUpdateRequest,
        MigraineLogResponse,
        PcodLogCreateRequest,
        PcodLogUpdateRequest,
        PcodLogResponse,
        ConditionPrefsUpdateRequest
    )
except (ImportError, ValueError):
    from database import get_db, MigraineLog, PcodLog, UserProfile, Cycle, SymptomLog
    from schemas import (
        MigraineLogCreateRequest,
        MigraineLogUpdateRequest,
        MigraineLogResponse,
        PcodLogCreateRequest,
        PcodLogUpdateRequest,
        PcodLogResponse,
        ConditionPrefsUpdateRequest
    )

router = APIRouter(prefix="/api/conditions", tags=["Conditions"])

# --- MIGRAINE LOGS ---

@router.get("/migraine", response_model=List[MigraineLogResponse])
def get_migraine_logs(db: Session = Depends(get_db)):
    """Retrieve all user-logged migraine episodes."""
    logs = db.query(MigraineLog).filter(
        MigraineLog.user_id == "usr_101"
    ).order_by(MigraineLog.date.desc(), MigraineLog.created_at.desc()).all()

    return [
        MigraineLogResponse(
            id=log.id,
            userId=log.user_id,
            date=log.date,
            durationHours=log.duration_hours or 0,
            severity=log.severity or "Moderate",
            hasAura=bool(log.has_aura),
            hasNausea=bool(log.has_nausea),
            sensitivityLight=bool(log.sensitivity_light),
            triggers=log.triggers or "",
            medicationTaken=log.medication_taken or "",
            notes=log.notes or "",
            createdAt=log.created_at.strftime("%Y-%m-%d %I:%M %p") if log.created_at else ""
        )
        for log in logs
    ]

@router.post("/migraine", response_model=MigraineLogResponse)
def add_migraine_log(req: MigraineLogCreateRequest, db: Session = Depends(get_db)):
    """Add a new migraine episode log with triggers and severity."""
    today = req.date or datetime.utcnow().strftime("%Y-%m-%d")
    new_id = f"mig_{int(datetime.utcnow().timestamp() * 1000)}"

    log = MigraineLog(
        id=new_id,
        user_id="usr_101",
        date=today,
        duration_hours=req.durationHours or 2,
        severity=req.severity or "Moderate",
        has_aura=bool(req.hasAura),
        has_nausea=bool(req.hasNausea),
        sensitivity_light=bool(req.sensitivityLight),
        triggers=req.triggers or "",
        medication_taken=req.medicationTaken or "",
        notes=req.notes or "",
        created_at=datetime.utcnow()
    )

    db.add(log)
    db.commit()
    db.refresh(log)

    return MigraineLogResponse(
        id=log.id,
        userId=log.user_id,
        date=log.date,
        durationHours=log.duration_hours,
        severity=log.severity,
        hasAura=bool(log.has_aura),
        hasNausea=bool(log.has_nausea),
        sensitivityLight=bool(log.sensitivity_light),
        triggers=log.triggers or "",
        medicationTaken=log.medication_taken or "",
        notes=log.notes or "",
        createdAt=log.created_at.strftime("%Y-%m-%d %I:%M %p")
    )

@router.put("/migraine/{log_id}", response_model=MigraineLogResponse)
def update_migraine_log(log_id: str, req: MigraineLogUpdateRequest, db: Session = Depends(get_db)):
    """Update an existing migraine episode entry."""
    log = db.query(MigraineLog).filter(MigraineLog.id == log_id, MigraineLog.user_id == "usr_101").first()
    if not log:
        raise HTTPException(status_code=404, detail="Migraine log not found")

    if req.date is not None:
        log.date = req.date
    if req.durationHours is not None:
        log.duration_hours = req.durationHours
    if req.severity is not None:
        log.severity = req.severity
    if req.hasAura is not None:
        log.has_aura = req.hasAura
    if req.hasNausea is not None:
        log.has_nausea = req.hasNausea
    if req.sensitivityLight is not None:
        log.sensitivity_light = req.sensitivityLight
    if req.triggers is not None:
        log.triggers = req.triggers
    if req.medicationTaken is not None:
        log.medication_taken = req.medicationTaken
    if req.notes is not None:
        log.notes = req.notes

    db.commit()
    db.refresh(log)

    return MigraineLogResponse(
        id=log.id,
        userId=log.user_id,
        date=log.date,
        durationHours=log.duration_hours or 0,
        severity=log.severity or "Moderate",
        hasAura=bool(log.has_aura),
        hasNausea=bool(log.has_nausea),
        sensitivityLight=bool(log.sensitivity_light),
        triggers=log.triggers or "",
        medicationTaken=log.medication_taken or "",
        notes=log.notes or "",
        createdAt=log.created_at.strftime("%Y-%m-%d %I:%M %p") if log.created_at else ""
    )

@router.delete("/migraine/{log_id}")
def delete_migraine_log(log_id: str, db: Session = Depends(get_db)):
    """Delete a migraine log entry."""
    log = db.query(MigraineLog).filter(MigraineLog.id == log_id, MigraineLog.user_id == "usr_101").first()
    if not log:
        raise HTTPException(status_code=404, detail="Migraine log not found")

    db.delete(log)
    db.commit()
    return {"message": "Migraine log deleted successfully", "id": log_id}

# --- PCOD / PCOS LOGS ---

@router.get("/pcod", response_model=List[PcodLogResponse])
def get_pcod_logs(db: Session = Depends(get_db)):
    """Retrieve all user-logged PCOD/PCOS observation entries."""
    logs = db.query(PcodLog).filter(
        PcodLog.user_id == "usr_101"
    ).order_by(PcodLog.date.desc(), PcodLog.created_at.desc()).all()

    return [
        PcodLogResponse(
            id=log.id,
            userId=log.user_id,
            date=log.date,
            severity=log.severity or "Moderate",
            symptoms=log.symptoms or "",
            flowPattern=log.flow_pattern or "Irregular",
            triggers=log.triggers or "",
            notes=log.notes or "",
            createdAt=log.created_at.strftime("%Y-%m-%d %I:%M %p") if log.created_at else ""
        )
        for log in logs
    ]

@router.post("/pcod", response_model=PcodLogResponse)
def add_pcod_log(req: PcodLogCreateRequest, db: Session = Depends(get_db)):
    """Record a functional PCOD/PCOS symptom and observation entry."""
    today = req.date or datetime.utcnow().strftime("%Y-%m-%d")
    new_id = f"pcod_{int(datetime.utcnow().timestamp() * 1000)}"

    log = PcodLog(
        id=new_id,
        user_id="usr_101",
        date=today,
        severity=req.severity or "Moderate",
        symptoms=req.symptoms or "",
        flow_pattern=req.flowPattern or "Irregular",
        triggers=req.triggers or "",
        notes=req.notes or "",
        created_at=datetime.utcnow()
    )

    db.add(log)
    db.commit()
    db.refresh(log)

    return PcodLogResponse(
        id=log.id,
        userId=log.user_id,
        date=log.date,
        severity=log.severity,
        symptoms=log.symptoms or "",
        flowPattern=log.flow_pattern or "Irregular",
        triggers=log.triggers or "",
        notes=log.notes or "",
        createdAt=log.created_at.strftime("%Y-%m-%d %I:%M %p")
    )

@router.put("/pcod/{log_id}", response_model=PcodLogResponse)
def update_pcod_log(log_id: str, req: PcodLogUpdateRequest, db: Session = Depends(get_db)):
    """Update an existing PCOD/PCOS log entry."""
    log = db.query(PcodLog).filter(PcodLog.id == log_id, PcodLog.user_id == "usr_101").first()
    if not log:
        raise HTTPException(status_code=404, detail="PCOD log not found")

    if req.date is not None:
        log.date = req.date
    if req.severity is not None:
        log.severity = req.severity
    if req.symptoms is not None:
        log.symptoms = req.symptoms
    if req.flowPattern is not None:
        log.flow_pattern = req.flowPattern
    if req.triggers is not None:
        log.triggers = req.triggers
    if req.notes is not None:
        log.notes = req.notes

    db.commit()
    db.refresh(log)

    return PcodLogResponse(
        id=log.id,
        userId=log.user_id,
        date=log.date,
        severity=log.severity,
        symptoms=log.symptoms or "",
        flowPattern=log.flow_pattern or "Irregular",
        triggers=log.triggers or "",
        notes=log.notes or "",
        createdAt=log.created_at.strftime("%Y-%m-%d %I:%M %p") if log.created_at else ""
    )

@router.delete("/pcod/{log_id}")
def delete_pcod_log(log_id: str, db: Session = Depends(get_db)):
    """Delete a PCOD log entry."""
    log = db.query(PcodLog).filter(PcodLog.id == log_id, PcodLog.user_id == "usr_101").first()
    if not log:
        raise HTTPException(status_code=404, detail="PCOD log not found")

    db.delete(log)
    db.commit()
    return {"message": "PCOD log deleted successfully", "id": log_id}

# --- CONDITION PREFERENCES & SUMMARY ---

@router.put("/preferences")
def update_condition_preferences(req: ConditionPrefsUpdateRequest, db: Session = Depends(get_db)):
    """Toggle tracking preferences for PCOD/PCOS and Migraine."""
    profile = db.query(UserProfile).filter(UserProfile.id == "usr_101").first()
    if not profile:
        profile = UserProfile(id="usr_101")
        db.add(profile)

    if req.trackPcod is not None:
        profile.track_pcod = req.trackPcod
    if req.trackMigraine is not None:
        profile.track_migraine = req.trackMigraine

    db.commit()
    db.refresh(profile)

    return {
        "trackPcod": bool(profile.track_pcod),
        "trackMigraine": bool(profile.track_migraine)
    }

@router.get("/summary")
def get_conditions_summary(db: Session = Depends(get_db)):
    """
    Return trends and summary metrics for PCOD/PCOS and Migraine.
    Uses safe, non-diagnostic educational language.
    """
    # 1. PCOD/PCOS Cycle regularity analysis
    cycles = db.query(Cycle).filter(Cycle.user_id == "usr_101").order_by(Cycle.start_date.desc()).all()
    lengths = [c.length for c in cycles if c.length]
    variance = 0
    if len(lengths) > 1:
        avg = sum(lengths) / len(lengths)
        variance = round(sum(abs(l - avg) for l in lengths) / len(lengths), 1)

    pcod_logs = db.query(PcodLog).filter(PcodLog.user_id == "usr_101").all()
    pcod_symptoms_counts: Dict[str, int] = {}
    for p in pcod_logs:
        if p.symptoms:
            for s in p.symptoms.split(","):
                clean = s.strip()
                if clean:
                    pcod_symptoms_counts[clean] = pcod_symptoms_counts.get(clean, 0) + 1

    general_pcod_symptoms = db.query(SymptomLog).filter(
        SymptomLog.user_id == "usr_101",
        SymptomLog.symptom_name.in_(["Acne", "Skin Changes", "Fatigue", "Mood Swings", "Irregular Flow", "Bloating"])
    ).all()

    # 2. Migraine triggers analysis
    migraines = db.query(MigraineLog).filter(MigraineLog.user_id == "usr_101").all()
    trigger_counts: Dict[str, int] = {}
    for m in migraines:
        if m.triggers:
            for t in m.triggers.split(","):
                clean = t.strip()
                if clean:
                    trigger_counts[clean] = trigger_counts.get(clean, 0) + 1

    return {
        "pcod": {
            "recordedCyclesCount": len(cycles),
            "averageCycleLength": round(sum(lengths) / len(lengths), 1) if lengths else 28,
            "cycleVarianceDays": variance,
            "regularityStatus": "Consistent" if variance <= 2 else "Variable",
            "loggedConditionSymptomsCount": len(general_pcod_symptoms) + sum(pcod_symptoms_counts.values()),
            "totalPcodLogsCount": len(pcod_logs),
            "topReportedPcodSymptoms": [
                {"symptom": k, "count": v}
                for k, v in sorted(pcod_symptoms_counts.items(), key=lambda x: x[1], reverse=True)[:5]
            ],
            "disclaimer": "Cycle irregularity trends are user-reported observational data and do not constitute a medical diagnosis."
        },
        "migraine": {
            "totalEpisodesLogged": len(migraines),
            "topReportedTriggers": [
                {"trigger": k, "count": v}
                for k, v in sorted(trigger_counts.items(), key=lambda x: x[1], reverse=True)[:5]
            ],
            "averageDurationHours": round(sum(m.duration_hours for m in migraines) / len(migraines), 1) if migraines else 0,
            "disclaimer": "Migraine patterns reflect user-recorded observations to help identify personal lifestyle triggers."
        }
    }
