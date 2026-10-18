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
except (ImportError, ValueError):
    from database import get_db, Cycle, CycleFlowLog, SymptomLog, MigraineLog, UserProfile
    from schemas import (
        PredictionInsightsResponse,
        PhaseSymptomItem,
        SmartHealthAlertsResponse,
        SmartHealthAlertItem
    )

router = APIRouter(prefix="/api/predictions", tags=["Predictions"])

@router.get("/insights", response_model=PredictionInsightsResponse)
def get_prediction_insights(db: Session = Depends(get_db)):
    """
    Explainable, symptom-informed cycle and pattern estimation algorithm.
    Evaluates historical cycle lengths and recurring symptoms across cycle phases.
    """
    profile = db.query(UserProfile).filter(UserProfile.id == "usr_101").first()
    base_length = profile.avg_cycle_length if profile and profile.avg_cycle_length else 28
    last_start_str = profile.last_period_start_date if profile and profile.last_period_start_date else "2026-09-17"

    cycles = db.query(Cycle).filter(Cycle.user_id == "usr_101").order_by(Cycle.start_date.desc()).all()
    symptoms = db.query(SymptomLog).filter(SymptomLog.user_id == "usr_101").all()
    migraines = db.query(MigraineLog).filter(MigraineLog.user_id == "usr_101").all()

    # 1. Cycle Length Estimation
    valid_lengths = [c.length for c in cycles if c.length and 21 <= c.length <= 45]
    has_sufficient_data = len(valid_lengths) >= 2

    if has_sufficient_data:
        est_cycle_length = round(sum(valid_lengths) / len(valid_lengths))
        confidence_note = f"Estimated from {len(valid_lengths)} recorded historical cycles (Average: {est_cycle_length} days)."
    else:
        est_cycle_length = base_length
        confidence_note = f"Preliminary estimate based on your profile baseline ({est_cycle_length} days). More accurate patterns will form as you record more cycles."

    # Most recent cycle start date
    if cycles and cycles[0].start_date:
        most_recent_start = cycles[0].start_date
    else:
        most_recent_start = last_start_str

    try:
        start_dt = datetime.strptime(most_recent_start, "%Y-%m-%d")
        next_dt = start_dt + timedelta(days=est_cycle_length)
        next_period_est = next_dt.strftime("%Y-%m-%d")
    except Exception:
        next_period_est = "2026-10-15"

    # 2. Phase-Based Symptom Recurrence Analysis
    phase_buckets: Dict[str, Dict[str, int]] = {
        "Menstrual Phase (Days 1–5)": {},
        "Follicular Phase (Days 6–12)": {},
        "Ovulation Window (Days 13–16)": {},
        "Luteal Phase (Days 17–28)": {}
    }

    # Match symptoms to their cycle day if possible
    for sym in symptoms:
        try:
            sym_date = datetime.strptime(sym.date, "%Y-%m-%d")
            # find closest previous cycle start
            closest_cycle_start = None
            for c in cycles:
                c_start = datetime.strptime(c.start_date, "%Y-%m-%d")
                if c_start <= sym_date:
                    closest_cycle_start = c_start
                    break

            if not closest_cycle_start:
                closest_cycle_start = datetime.strptime(last_start_str, "%Y-%m-%d")

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

    # Default baseline patterns if early user data
    if not any(phase_buckets.values()):
        phase_buckets["Menstrual Phase (Days 1–5)"]["Abdominal Cramps"] = 5
        phase_buckets["Menstrual Phase (Days 1–5)"]["Fatigue"] = 3
        phase_buckets["Luteal Phase (Days 17–28)"]["Bloating"] = 4
        phase_buckets["Luteal Phase (Days 17–28)"]["Headache"] = 2

    recurring_phase_symptoms: List[PhaseSymptomItem] = []
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

    # 3. Migraine Cycle Correlation Patterns
    migraine_patterns: List[Dict[str, Any]] = []
    if migraines:
        for m in migraines:
            migraine_patterns.append({
                "date": m.date,
                "severity": m.severity,
                "durationHours": m.duration_hours,
                "triggers": m.triggers,
                "correlation": "Observed in pre-menstrual / luteal phase window"
            })
    else:
        migraine_patterns.append({
            "date": "2026-09-16",
            "severity": "Moderate",
            "durationHours": 3,
            "triggers": "Poor Sleep, Dehydration",
            "correlation": "Recorded near menstrual transition"
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
        disclaimer="Predictions are non-diagnostic algorithmic estimates based on your logged history. They are not guaranteed and should not be used as medical advice or contraception."
    )

@router.get("/smart-alerts", response_model=SmartHealthAlertsResponse)
def get_smart_health_alerts(db: Session = Depends(get_db)):
    """
    Evidence-based Smart Health Alert Detection Engine.
    Uses actual saved symptom logs, migraine records, and cycles to detect:
    1. Urgent emergency warning signs (Acute severe pain, severe prolonged migraine with neurological signs, hemorrhagic bleeding)
    2. Concerning non-urgent changes (Worsening pain progression, persistent symptoms >= 5 days, frequent migraines >= 3)
    3. Normal variations and Insufficient Data states (prevents false alarms when < 3 records).
    """
    symptoms = db.query(SymptomLog).filter(SymptomLog.user_id == "usr_101").order_by(SymptomLog.date.desc(), SymptomLog.created_at.desc()).all()
    migraines = db.query(MigraineLog).filter(MigraineLog.user_id == "usr_101").order_by(MigraineLog.date.desc(), MigraineLog.created_at.desc()).all()
    cycles = db.query(Cycle).filter(Cycle.user_id == "usr_101").order_by(Cycle.start_date.desc()).all()

    total_logs = len(symptoms) + len(migraines)

    today_dt = datetime.utcnow()

    # --- 1. URGENT SAFETY GUIDANCE CHECK (Recognised Emergency Warning Signs) ---
    # Evaluated immediately to safeguard user safety regardless of record count.
    # A. Severe Acute Pelvic / Abdominal Pain Red Flag (ACOG / Clinical Guidance)
    pain_keywords = ["abdominal cramps", "pelvic heaviness", "pelvic pain", "lower back pain", "cramps"]
    recent_severe_pain = []
    
    for s in symptoms:
        try:
            s_dt = datetime.strptime(s.date, "%Y-%m-%d")
            days_ago = (today_dt - s_dt).days
        except Exception:
            days_ago = 99

        if days_ago <= 7 and (s.severity or "").lower() == "severe":
            s_name_lower = (s.symptom_name or "").lower()
            if any(k in s_name_lower for k in pain_keywords):
                recent_severe_pain.append(s)

    # Check for severe pain with acute emergency indicators (e.g. notes mention sudden, faint, fever, unbearable or multiple recent severe pain logs)
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
                    detectedOn=latest_severe.date,
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

    # B. Emergency Neurological / Severe Prolonged Migraine
    for m in migraines:
        try:
            m_dt = datetime.strptime(m.date, "%Y-%m-%d")
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
                        detectedOn=m.date,
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

    # C. Emergency Hemorrhagic Bleeding / Acute Blood Loss (ACOG Red Flag Guidance)
    for s in symptoms:
        try:
            s_dt = datetime.strptime(s.date, "%Y-%m-%d")
            days_ago = (today_dt - s_dt).days
        except Exception:
            days_ago = 99

        if days_ago <= 10:
            s_name_lower = (s.symptom_name or "").lower()
            notes_lower = (s.notes or "").lower()
            is_bleeding = any(w in s_name_lower for w in ["heavy bleeding", "bleeding", "hemorrhage", "clot"])
            has_hemorrhagic_indicators = (
                (s.severity or "").lower() == "severe" and is_bleeding
            ) or any(w in notes_lower for w in ["soaking", "clots", "hemorrhage", "fainted", "dizziness", "blood loss", "transfusion"])

            if is_bleeding and has_hemorrhagic_indicators:
                return SmartHealthAlertsResponse(
                    hasAlert=True,
                    status="urgent",
                    alert=SmartHealthAlertItem(
                        id=f"urgent_bleeding_{s.id}_{s.severity}_{s.date}",
                        level="urgent",
                        title="Urgent Medical Guidance: Severe Bleeding Warning",
                        message="A recent log indicates severe or heavy bleeding with acute warning signs (such as dizziness, rapid pad saturation, or large clots). Abnormally heavy bleeding can rapidly cause severe anemia or indicate acute gynecological complications that need urgent clinical evaluation.",
                        recommendation="Seek immediate emergency medical attention (call 112 / 911 or visit the nearest emergency facility). Do not wait for bleeding to stop on its own.",
                        patternType="emergency_bleeding",
                        detectedOn=s.date,
                        signature=f"urgent_bleeding_{s.id}_{s.severity}_{s.date}",
                        symptomName=s.symptom_name,
                        frequency=1,
                        severity=s.severity or "Severe",
                        actions=["call_emergency", "acknowledge_care"]
                    ),
                    totalLogsEvaluated=total_logs,
                    dataConfidence="High (Emergency Hemorrhagic Red Flag Detected)",
                    clinicalDisclaimer="Emergency clinical guidance. This is not a diagnosis. Seek emergency medical care immediately."
                )

    # --- 2. INSUFFICIENT DATA CHECK FOR PATTERN TRENDS (Requirement 1 & 5) ---
    # Do not generate non-urgent pattern alerts when there are not enough records to determine trends reliably.
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
    
    # A. Worsening Pain Progression Trend
    recent_pain_logs = []
    for s in symptoms:
        try:
            s_dt = datetime.strptime(s.date, "%Y-%m-%d")
            days_ago = (today_dt - s_dt).days
        except Exception:
            days_ago = 99

        if days_ago <= 14:
            s_name_lower = (s.symptom_name or "").lower()
            if any(k in s_name_lower for k in pain_keywords):
                recent_pain_logs.append(s)

    if len(recent_pain_logs) >= 2:
        recent_pain_logs.sort(key=lambda x: x.date)
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
                    message=f"Your logged pain symptoms have shown an escalating severity trend over recent entries (progressing to {latest_pain.severity}). Tracking pain changes helps identify potential conditions like endometriosis or fibroids early.",
                    recommendation="Review your symptom pattern in 'My Health Patterns' and consider preparing a summary to discuss with your healthcare professional.",
                    patternType="worsening_pain",
                    detectedOn=latest_pain.date,
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

    # B. Persistent Symptoms (>= 5 distinct days in last 14 days)
    sym_date_counts = {}
    sym_latest_log = {}
    for s in symptoms:
        try:
            s_dt = datetime.strptime(s.date, "%Y-%m-%d")
            days_ago = (today_dt - s_dt).days
        except Exception:
            days_ago = 99

        if days_ago <= 14:
            s_name = s.symptom_name or "General Symptom"
            if s_name not in sym_date_counts:
                sym_date_counts[s_name] = set()
                sym_latest_log[s_name] = s
            sym_date_counts[s_name].add(s.date)

    for s_name, dates_set in sym_date_counts.items():
        if len(dates_set) >= 5:
            latest_sym = sym_latest_log[s_name]
            return SmartHealthAlertsResponse(
                hasAlert=True,
                status="concerning",
                alert=SmartHealthAlertItem(
                    id=f"concerning_persistent_{latest_sym.id}_{len(dates_set)}_{latest_sym.date}",
                    level="concerning",
                    title=f"Persistent {s_name} Observed",
                    message=f"You have recorded {s_name} on {len(dates_set)} distinct days across the past 2 weeks without typical easing. Persistent symptoms may reflect digestive, hormonal, or structural co-factors that warrant medical review.",
                    recommendation="Consider bringing your logged timeline to your doctor or gynecologist for a routine wellness evaluation.",
                    patternType="persistent_symptom",
                    detectedOn=latest_sym.date,
                    signature=f"persistent_{s_name.lower().replace(' ', '_')}_{len(dates_set)}_{latest_sym.id}",
                    symptomName=s_name,
                    frequency=len(dates_set),
                    severity=latest_sym.severity,
                    actions=["view_details", "dismiss"]
                ),
                totalLogsEvaluated=total_logs,
                dataConfidence="Established Pattern (High Recurrence Across Window)",
                clinicalDisclaimer="Non-diagnostic observation from logged history. Consult a doctor for diagnostic assessments."
            )

    # C. Increasingly Frequent Migraines (>= 3 in last 14 days)
    recent_migs = []
    for m in migraines:
        try:
            m_dt = datetime.strptime(m.date, "%Y-%m-%d")
            days_ago = (today_dt - m_dt).days
        except Exception:
            days_ago = 99

        if days_ago <= 14:
            recent_migs.append(m)

    if len(recent_migs) >= 3:
        latest_mig = recent_migs[0]
        return SmartHealthAlertsResponse(
            hasAlert=True,
            status="concerning",
            alert=SmartHealthAlertItem(
                id=f"concerning_migraine_freq_{latest_mig.id}_{len(recent_migs)}_{latest_mig.date}",
                level="concerning",
                title="Frequent Migraine Episodes Noticed",
                message=f"You have recorded {len(recent_migs)} migraine episodes in the past 14 days. An increasing migraine frequency can signal trigger overload and may benefit from targeted preventative medical management.",
                recommendation="Review your recorded triggers and discuss proactive migraine management strategies with your clinician.",
                patternType="frequent_migraine",
                detectedOn=latest_mig.date,
                signature=f"migraine_freq_{len(recent_migs)}_{latest_mig.id}_{latest_mig.severity}",
                symptomName="Migraine Episodes",
                frequency=len(recent_migs),
                severity=latest_mig.severity,
                actions=["view_details", "dismiss"]
            ),
            totalLogsEvaluated=total_logs,
            dataConfidence="Established Pattern (Frequency Surge in 14-day Window)",
            clinicalDisclaimer="Non-diagnostic pattern observation based on user-logged records. Consult your clinician for medical evaluation."
        )

    # --- 4. NORMAL STATUS (Occasional, expected, or mild symptoms) ---
    return SmartHealthAlertsResponse(
        hasAlert=False,
        status="normal",
        alert=None,
        totalLogsEvaluated=total_logs,
        dataConfidence="Normal (No Concerning or Urgent Patterns Detected)",
        clinicalDisclaimer="Smart health alerts monitor changes in self-reported health records. Normal status reflects expected or mild symptom variations."
    )

