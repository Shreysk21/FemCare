from sqlalchemy.orm import Session
try:
    from .database import (
        UserProfile, Cycle, CycleFlowLog, SymptomLog, MoodLog,
        HydrationLog, HydrationEntry, CircleMember
    )
except (ImportError, ValueError):
    from database import (
        UserProfile, Cycle, CycleFlowLog, SymptomLog, MoodLog,
        HydrationLog, HydrationEntry, CircleMember
    )

def seed_initial_data(db: Session):
    existing_user = db.query(UserProfile).filter(UserProfile.id == "usr_101").first()
    if existing_user:
        return  # Already seeded

    # 1. User Profile
    user = UserProfile(
        id="usr_101",
        name="Shreya Patel",
        email="shreya.patel@example.com",
        avg_cycle_length=28,
        avg_period_duration=5,
        last_period_start_date="2026-09-17",
        theme="light",
        text_size="normal",
        privacy_mode="discreet",
        location_approved=True,
        city="San Francisco, CA",
        joined_date="2026-01-15"
    )
    db.add(user)
    db.flush()

    # 2. Cycles & Flow Logs
    cyc1 = Cycle(
        id="cyc_004",
        user_id="usr_101",
        start_date="2026-09-17",
        end_date="2026-09-21",
        length=28,
        period_duration=5,
        status="current",
        phase="Follicular Phase",
        notes="Normal cycle start, slight cramps on day 1."
    )
    cyc2 = Cycle(
        id="cyc_003",
        user_id="usr_101",
        start_date="2026-08-20",
        end_date="2026-08-24",
        length=28,
        period_duration=5,
        status="completed",
        phase="Luteal Phase",
        notes="Felt fatigued during days 1-2."
    )
    cyc3 = Cycle(
        id="cyc_002",
        user_id="usr_101",
        start_date="2026-07-23",
        end_date="2026-07-27",
        length=28,
        period_duration=5,
        status="completed",
        phase="Luteal Phase",
        notes="Stayed well hydrated."
    )
    db.add_all([cyc1, cyc2, cyc3])
    db.flush()

    flow_logs = [
        CycleFlowLog(id="fl_001", cycle_id="cyc_004", date="2026-09-17", flow="Heavy", icon="🩸"),
        CycleFlowLog(id="fl_002", cycle_id="cyc_004", date="2026-09-18", flow="Medium", icon="🩸"),
        CycleFlowLog(id="fl_003", cycle_id="cyc_004", date="2026-09-19", flow="Medium", icon="🩸"),
        CycleFlowLog(id="fl_004", cycle_id="cyc_004", date="2026-09-20", flow="Light", icon="💧"),
        CycleFlowLog(id="fl_005", cycle_id="cyc_004", date="2026-09-21", flow="Light", icon="💧"),
        CycleFlowLog(id="fl_006", cycle_id="cyc_003", date="2026-08-20", flow="Heavy", icon="🩸"),
        CycleFlowLog(id="fl_007", cycle_id="cyc_003", date="2026-08-21", flow="Heavy", icon="🩸"),
        CycleFlowLog(id="fl_008", cycle_id="cyc_003", date="2026-08-22", flow="Medium", icon="🩸"),
        CycleFlowLog(id="fl_009", cycle_id="cyc_003", date="2026-08-23", flow="Light", icon="💧"),
        CycleFlowLog(id="fl_010", cycle_id="cyc_003", date="2026-08-24", flow="Light", icon="💧"),
    ]
    db.add_all(flow_logs)

    # 3. Symptoms
    symptoms = [
        SymptomLog(
            id="sym_001",
            user_id="usr_101",
            date="2026-09-30",
            symptom_id="cramps",
            symptom_name="Abdominal Cramps",
            category="Pain & Discomfort",
            severity="Moderate",
            time_logged="09:30 AM",
            notes="Noticed after morning walk."
        ),
        SymptomLog(
            id="sym_002",
            user_id="usr_101",
            date="2026-09-29",
            symptom_id="bloating",
            symptom_name="Bloating",
            category="Digestive & Body",
            severity="Mild",
            time_logged="02:15 PM",
            notes="Felt full after lunch."
        )
    ]
    db.add_all(symptoms)

    # 4. Moods
    moods = [
        MoodLog(
            id="m_001",
            user_id="usr_101",
            date="2026-09-30",
            mood_id="good",
            label="Good",
            emoji="🙂",
            time="08:15 AM",
            note="Feeling energetic today."
        ),
        MoodLog(
            id="m_002",
            user_id="usr_101",
            date="2026-09-29",
            mood_id="okay",
            label="Okay",
            emoji="😐",
            time="07:45 PM",
            note="Calm evening."
        )
    ]
    db.add_all(moods)

    # 5. Hydration
    hyd = HydrationLog(
        id="hyd_001",
        user_id="usr_101",
        date="2026-09-30",
        current_ml=1250,
        goal_ml=2000,
        glasses=5,
        target_glasses=8
    )
    db.add(hyd)
    db.flush()

    entries = [
        HydrationEntry(id="he_1", hydration_log_id="hyd_001", time="08:00 AM", amount_ml=250),
        HydrationEntry(id="he_2", hydration_log_id="hyd_001", time="10:30 AM", amount_ml=250),
        HydrationEntry(id="he_3", hydration_log_id="hyd_001", time="12:15 PM", amount_ml=250),
        HydrationEntry(id="he_4", hydration_log_id="hyd_001", time="02:00 PM", amount_ml=250),
        HydrationEntry(id="he_5", hydration_log_id="hyd_001", time="03:45 PM", amount_ml=250),
    ]
    db.add_all(entries)

    # 6. Circle Care
    member = CircleMember(
        id="mem_1",
        user_id="usr_101",
        name="Alex Johnson",
        role="Partner",
        email="alex.j@example.com",
        sync_code="FEM-8492",
        status="Connected & Syncing",
        avatar="💖",
        share_phase_and_window=True,
        share_emotional_state=True,
        share_specific_symptoms=False,
        share_private_notes=False
    )
    db.add(member)

    db.commit()
