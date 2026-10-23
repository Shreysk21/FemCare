from typing import List, Dict, Any
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
try:
    from ..database import get_db, Cycle, CycleFlowLog, SymptomLog, MigraineLog, UserProfile
    from ..schemas import (
        PredictionInsightsResponse,
        PhaseSymptomItem,
        SmartHealthAlertsResponse,
        SmartHealthAlertItem
    )
    from .auth import get_current_user_id
except (ImportError, ValueError):
    from database import get_db, Cycle, CycleFlowLog, SymptomLog, MigraineLog, UserProfile
    from schemas import (
        PredictionInsightsResponse,
        PhaseSymptomItem,
        SmartHealthAlertsResponse,
        SmartHealthAlertItem
    )
    from routes.auth import get_current_user_id

router = APIRouter(prefix="/api/predictions", tags=["Predictions"])

@router.get("/insights", response_model=PredictionInsightsResponse)
def get_prediction_insights(user_id: str = Depends(get_current_user_id), db: Session = Depends(get_db)):
    """
    Explainable, symptom-informed cycle and pattern estimation algorithm.
    Evaluates historical cycle lengths and recurring symptoms across cycle phases strictly from logged records.
    """
    profile = db.query(UserProfile).filter(UserProfile.id == user_id).first()
    base_length = profile.avg_cycle_length if profile and profile.avg_cycle_length else 28
    last_start_str = str(profile.last_period_start_date) if profile and profile.last_period_start_date else None

    cycles = db.query(Cycle).filter(Cycle.user_id == user_id).order_by(Cycle.start_date.desc()).all()
    symptoms = db.query(SymptomLog).filter(SymptomLog.user_id == user_id).all()
    migraines = db.query(MigraineLog).filter(MigraineLog.user_id == user_id).all()

    # 1. Cycle Length Estimation
    valid_lengths = [c.length for c in cycles if c.length and 20 <= c.length <= 45]
    has_sufficient_data = len(valid_lengths) >= 2

    if has_sufficient_data:
        est_cycle_length = round(sum(valid_lengths) / len(valid_lengths))
        confidence_note = f"Estimated from {len(valid_lengths)} recorded historical cycles (Average: {est_cycle_length} days)."
    elif len(valid_lengths) == 1:
        est_cycle_length = valid_lengths[0]
        confidence_note = f"Single cycle recorded ({est_cycle_length} days). Additional cycles will deepen prediction confidence."
    else:
        est_cycle_length = base_length
        confidence_note = "Insufficient cycle history. Log your cycle dates to calculate personalized averages and predictions."

    # Most recent cycle start date
    most_recent_start = None
    if cycles and cycles[0].start_date:
        most_recent_start = str(cycles[0].start_date)
    elif last_start_str:
        most_recent_start = last_start_str

    next_period_est = ""
    if most_recent_start:
        try:
            start_dt = datetime.strptime(most_recent_start[:10], "%Y-%m-%d")
            next_dt = start_dt + timedelta(days=est_cycle_length)
            next_period_est = next_dt.strftime("%Y-%m-%d")
        except Exception:
            next_period_est = ""

    # 2. Phase-Based Symptom Recurrence Analysis (calculated only from real user logs)
    recurring_phase_symptoms: List[PhaseSymptomItem] = []

    if symptoms and cycles:
        phase_buckets: Dict[str, Dict[str, int]] = {
            "Menstrual Phase (Days 1–5)": {},
            "Follicular Phase (Days 6–12)": {},
            "Ovulation Window (Days 13–16)": {},
            "Luteal Phase (Days 17–28)": {}
        }

        for sym in symptoms:
            try:
                sym_date = datetime.strptime(str(sym.date)[:10], "%Y-%m-%d")
                closest_cycle_start = None
                for c in cycles:
                    c_start = datetime.strptime(str(c.start_date)[:10], "%Y-%m-%d")
                    if c_start <= sym_date:
                        closest_cycle_start = c_start
                        break

                if not closest_cycle_start and most_recent_start:
                    closest_cycle_start = datetime.strptime(most_recent_start[:10], "%Y-%m-%d")

                if closest_cycle_start:
                    day_in_cycle = (sym_date - closest_cycle_start).days + 1
                    if 1 <= day_in_cycle <= 5:
                        phase_name = "Menstrual Phase (Days 1–5)"
                    elif 6 <= day_in_cycle <= 12:
                        phase_name = "Follicular Phase (Days 6–12)"
                    elif 13 <= day_in_cycle <= 16:
                        phase_name = "Ovulation Window (Days 13–16)"
                    else:
                        phase_name = "Luteal Phase (Days 17–28)"

                    s_name = sym.symptom_name
                    phase_buckets[phase_name][s_name] = phase_buckets[phase_name].get(s_name, 0) + 1
            except Exception:
                continue

        total_sym_count = max(len(symptoms), 1)
        for phase_name, sym_dict in phase_buckets.items():
            for sym_name, count in sym_dict.items():
                if count >= 1:
                    pct = min(round((count / total_sym_count) * 100), 100)
                    msg = f"You have recorded {sym_name} {count} time(s) during your {phase_name}."
                    recurring_phase_symptoms.append(
                        PhaseSymptomItem(
                            symptomName=sym_name,
                            phase=phase_name,
                            count=count,
                            percentage=pct,
                            message=msg
                        )
                    )

    # 3. Migraine Cycle Patterns (calculated only if user has logged migraine episodes)
    migraine_patterns = []
    if migraines and len(migraines) > 0:
        for m in migraines[:4]:
            migraine_patterns.append({
                "date": m.date,
                "severity": m.severity,
                "durationHours": m.duration_hours,
                "triggers": m.triggers or "Not specified",
                "correlation": "Co-factor logged by user"
            })

    return PredictionInsightsResponse(
        nextPeriodEstimatedDate=next_period_est,
        nextEstimatedPeriodDate=next_period_est,
        estimatedCycleLength=est_cycle_length,
        estimatedCycleLengthDays=est_cycle_length,
        historicalCycleCount=len(cycles),
        isSufficientData=has_sufficient_data,
        confidenceNote=confidence_note,
        recurringPhaseSymptoms=recurring_phase_symptoms[:6],
        migraineCyclePatterns=migraine_patterns[:4],
        disclaimer="Predictions and estimated dates are non-diagnostic statistical projections calculated from your personal history. They are not guaranteed and must never be used for medical diagnosis, treatment decisions, or contraception."
    )

@router.get("/smart-alerts", response_model=SmartHealthAlertsResponse)
def get_smart_health_alerts(user_id: str = Depends(get_current_user_id), db: Session = Depends(get_db)):
    """
    Evidence-based Smart Health Alert Detection Engine.
    Uses actual saved records for the authenticated user to detect acute safety indicators or trend changes.
    """
    symptoms = db.query(SymptomLog).filter(SymptomLog.user_id == user_id).order_by(SymptomLog.date.desc(), SymptomLog.created_at.desc()).all()
    migraines = db.query(MigraineLog).filter(MigraineLog.user_id == user_id).order_by(MigraineLog.date.desc(), MigraineLog.created_at.desc()).all()
    cycles = db.query(Cycle).filter(Cycle.user_id == user_id).order_by(Cycle.start_date.desc()).all()

    total_logs = len(symptoms) + len(migraines)
    today_dt = datetime.utcnow()

    # --- 1. URGENT SAFETY GUIDANCE CHECK ---
    pain_keywords = ["abdominal cramps", "pelvic heaviness", "pelvic pain", "lower back pain", "cramps"]
    recent_severe_pain = []
    
    for s in symptoms:
        try:
            s_dt = datetime.strptime(str(s.date)[:10], "%Y-%m-%d")
            days_ago = (today_dt - s_dt).days
        except Exception:
            days_ago = 99

        if days_ago <= 7 and (s.severity or "").lower() == "severe":
            s_name_lower = (s.symptom_name or "").lower()
            if any(k in s_name_lower for k in pain_keywords):
                recent_severe_pain.append(s)

    if recent_severe_pain:
        latest_severe = recent_severe_pain[0]
        notes_lower = (latest_severe.notes or "").lower()
        emergency_cues = ["faint", "dizzy", "dizziness", "sudden", "fever", "vomit", "unbearable", "excruciating", "emergency"]
        has_acute_cue = any(c in notes_lower for c in emergency_cues) or len(recent_severe_pain) >= 2

        if has_acute_cue:
            return SmartHealthAlertsResponse(
                hasAlert=True,
                status="urgent",
                alert=SmartHealthAlertItem(
                    id=f"urgent_pain_{latest_severe.id}_{latest_severe.severity}_{latest_severe.date}",
                    level="urgent",
                    title="Urgent Medical Guidance: Severe Acute Pain",
                    message="A recent record indicates severe, acute pelvic/abdominal pain. Sudden or incapacitating pelvic pain requires immediate medical evaluation to rule out acute conditions such as ovarian torsion, ectopic pregnancy, pelvic infection, or internal complications.",
                    recommendation="Seek immediate emergency medical care (call 112 / 911 or visit the nearest emergency room). Do not wait for symptoms to resolve on their own.",
                    patternType="emergency_pain",
                    detectedOn=str(latest_severe.date),
                    signature=f"urgent_pain_{latest_severe.id}_{latest_severe.severity}_{latest_severe.date}",
                    symptomName=latest_severe.symptom_name,
                    frequency=len(recent_severe_pain),
                    severity="Severe",
                    actions=["call_emergency", "acknowledge_care"]
                ),
                totalLogsEvaluated=total_logs,
                dataConfidence="High (Emergency Clinical Red Flag Detected)",
                clinicalDisclaimer="Emergency safety guidance based on self-reported severe symptoms. This is not a diagnosis. Seek emergency medical care immediately."
            )

    # Emergency Neurological Warning
    for m in migraines:
        try:
            m_dt = datetime.strptime(str(m.date)[:10], "%Y-%m-%d")
            days_ago = (today_dt - m_dt).days
        except Exception:
            days_ago = 99

        if days_ago <= 7 and (m.severity or "").lower() == "severe":
            m_notes = (m.notes or "").lower()
            m_triggers = (m.triggers or "").lower()
            is_prolonged = (m.duration_hours or 0) >= 24
            has_neuro_red_flag = any(w in m_notes or w in m_triggers for w in ["thunderclap", "worst headache", "confusion", "stiff neck", "numbness", "vision loss", "unbearable"])
            
            if is_prolonged or has_neuro_red_flag:
                return SmartHealthAlertsResponse(
                    hasAlert=True,
                    status="urgent",
                    alert=SmartHealthAlertItem(
                        id=f"urgent_migraine_{m.id}_{m.severity}_{m.date}",
                        level="urgent",
                        title="Urgent Medical Guidance: Severe Prolonged Migraine",
                        message="You have recorded a severe migraine episode with prolonged duration (>= 24 hours) or acute neurological warning signs. Severe, sudden 'thunderclap' headaches or unremitting severe episodes require emergency evaluation to rule out acute vascular or neurological causes.",
                        recommendation="Contact emergency medical services or go to an emergency medical facility promptly.",
                        patternType="emergency_neurological",
                        detectedOn=str(m.date),
                        signature=f"urgent_migraine_{m.id}_{m.severity}_{m.date}_{m.duration_hours}",
                        symptomName="Severe Migraine",
                        frequency=1,
                        severity="Severe",
                        actions=["call_emergency", "acknowledge_care"]
                    ),
                    totalLogsEvaluated=total_logs,
                    dataConfidence="High (Emergency Neurological Red Flag Detected)",
                    clinicalDisclaimer="Clinical emergency guidance. Not a medical conclusion. Contact emergency healthcare professionals immediately."
                )

    # --- 2. INSUFFICIENT DATA CHECK FOR PATTERN TRENDS ---
    if len(symptoms) < 3 and len(migraines) < 2:
        return SmartHealthAlertsResponse(
            hasAlert=False,
            status="insufficient_data",
            alert=None,
            totalLogsEvaluated=total_logs,
            dataConfidence="Insufficient data (minimum 3 symptom logs or 2 migraine logs required)",
            clinicalDisclaimer="Health alerts evaluate changes across your saved records. They do not replace clinical consultations."
        )

    # --- 3. CONCERNING NON-URGENT PATTERNS CHECK ---
    recent_pain_logs = []
    for s in symptoms:
        try:
            s_dt = datetime.strptime(str(s.date)[:10], "%Y-%m-%d")
            days_ago = (today_dt - s_dt).days
        except Exception:
            days_ago = 99

        if days_ago <= 14:
            s_name_lower = (s.symptom_name or "").lower()
            if any(k in s_name_lower for k in pain_keywords):
                recent_pain_logs.append(s)

    if len(recent_pain_logs) >= 2:
        recent_pain_logs.sort(key=lambda x: str(x.date))
        sev_rank = {"mild": 1, "moderate": 2, "severe": 3}
        ranks = [sev_rank.get((p.severity or "moderate").lower(), 2) for p in recent_pain_logs]
        
        is_worsening = (len(ranks) >= 2 and ranks[-1] > ranks[0] and ranks[-1] >= 2) or (len(ranks) >= 3 and ranks[-1] >= ranks[-2] > ranks[-3])
        
        if is_worsening:
            latest_pain = recent_pain_logs[-1]
            return SmartHealthAlertsResponse(
                hasAlert=True,
                status="concerning",
                alert=SmartHealthAlertItem(
                    id=f"concerning_worsening_{latest_pain.id}_{latest_pain.severity}_{latest_pain.date}",
                    level="concerning",
                    title="Pain Progression Trend Observed",
                    message=f"Your logged pain symptoms have shown an escalating severity trend over recent entries (progressing to {latest_pain.severity}). Tracking pain changes helps identify potential conditions early.",
                    recommendation="Review your symptom pattern in 'My Health Patterns' and consider preparing a summary to discuss with your healthcare professional.",
                    patternType="worsening_pain",
                    detectedOn=str(latest_pain.date),
                    signature=f"worsening_pain_{latest_pain.symptom_name}_{latest_pain.severity}_{latest_pain.date}_{len(recent_pain_logs)}",
                    symptomName=latest_pain.symptom_name,
                    frequency=len(recent_pain_logs),
                    severity=latest_pain.severity,
                    actions=["view_details", "dismiss"]
                ),
                totalLogsEvaluated=total_logs,
                dataConfidence="Established Pattern (Consecutive Severity Escalation)",
                clinicalDisclaimer="Non-diagnostic pattern observation based on user-logged records. Consult your clinician for medical evaluation."
            )

    # Normal Status
    return SmartHealthAlertsResponse(
        hasAlert=False,
        status="normal",
        alert=None,
        totalLogsEvaluated=total_logs,
        dataConfidence="Normal (No Concerning or Urgent Patterns Detected)",
        clinicalDisclaimer="Smart health alerts monitor changes in self-reported health records. Normal status reflects expected or mild symptom variations."
    )
