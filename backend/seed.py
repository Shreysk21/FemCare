from sqlalchemy.orm import Session
try:
    from .database import (
        UserProfile, Cycle, CycleFlowLog, SymptomLog, MoodLog,
        HydrationLog, HydrationEntry, CircleMember, FeedbackSubmission, MigraineLog, PcodLog,
        SleepLog, Medication, ActivityLog
    )
except (ImportError, ValueError):
    from database import (
        UserProfile, Cycle, CycleFlowLog, SymptomLog, MoodLog,
        HydrationLog, HydrationEntry, CircleMember, FeedbackSubmission, MigraineLog, PcodLog,
        SleepLog, Medication, ActivityLog
    )

DEMO_PASSWORD_HASH = "$pbkdf2-sha256$29000$.T9nTGmNsfYeo9Ra691byw$8JIJpUFMqdG0FLnyOBteA/UMaWr8rKBXAtebLOouCg0"

def seed_initial_data(db: Session):
    existing_user = db.query(UserProfile).filter(UserProfile.id == "usr_101").first()
    if existing_user:
        if not getattr(existing_user, "password_hash", None):
            existing_user.password_hash = DEMO_PASSWORD_HASH
            db.commit()

        # Check if new feature tables need initial demo data
        if db.query(FeedbackSubmission).count() == 0:
            fb1 = FeedbackSubmission(
                id="fb_001",
                user_id="usr_101",
                category="user",
                rating=5,
                usability_feedback="The symptom and cycle tracking interface is very intuitive and peaceful. The cramp SOS button is wonderfully helpful.",
                problems_encountered="",
                suggestions="A quick widget or dark lavender theme would be lovely.",
                comments="Highly recommend FemCare to my friends!",
                is_verified=False,
                status="Acknowledged"
            )
            fb2 = FeedbackSubmission(
                id="fb_002",
                user_id="usr_101",
                category="doctor",
                rating=5,
                doctor_specialty="Obstetrics & Gynecology",
                doctor_clinic_affiliation="Bay Area Women's Health Clinic",
                clinical_presentation_feedback="The cycle phase breakdown and symptom recurrence insights align well with clinical observations. Non-diagnostic phrasing is appropriately used.",
                comments="[Wellness Guidance]: Commendable focus on hydration and rest during the luteal phase.",
                is_verified=False,
                status="Submitted"
            )
            db.add_all([fb1, fb2])

        if db.query(MigraineLog).count() == 0:
            mig1 = MigraineLog(
                id="mig_001",
                user_id="usr_101",
                date="2026-09-17",
                duration_hours=3,
                severity="Severe",
                has_aura=True,
                has_nausea=True,
                sensitivity_light=True,
                triggers="Poor Sleep, Stress",
                medication_taken="Ibuprofen 400mg",
                notes="Started in the afternoon with bright light sensitivity."
            )
            mig2 = MigraineLog(
                id="mig_002",
                user_id="usr_101",
                date="2026-08-20",
                duration_hours=2,
                severity="Moderate",
                has_aura=False,
                has_nausea=False,
                sensitivity_light=True,
                triggers="Dehydration, Hormonal Shift",
                medication_taken="Paracetamol 500mg",
                notes="Coincided with cycle day 1 flow."
            )
            db.add_all([mig1, mig2])

        if db.query(PcodLog).count() == 0:
            pcod1 = PcodLog(
                id="pcod_001",
                user_id="usr_101",
                date="2026-09-22",
                severity="Moderate",
                symptoms="Acne, Excessive Fatigue, Bloating",
                flow_pattern="Delayed Flow (Day 32)",
                triggers="Poor Sleep, High Sugar Diet",
                notes="Noticed skin flare-ups and lethargy during late luteal window."
            )
            pcod2 = PcodLog(
                id="pcod_002",
                user_id="usr_101",
                date="2026-08-25",
                severity="Mild",
                symptoms="Pelvic Heaviness, Mood Shifts",
                flow_pattern="Spotting",
                triggers="High Work Stress",
                notes="Light spotting observed 2 days prior to expected cycle."
            )
            db.add_all([pcod1, pcod2])

        if db.query(SleepLog).filter(SleepLog.user_id == "usr_101").count() == 0:
            slp1 = SleepLog(id="slp_001", user_id="usr_101", date="2026-09-30", hours=7, minutes=30, quality="Good", quality_emoji="😴")
            slp2 = SleepLog(id="slp_002", user_id="usr_101", date="2026-09-29", hours=8, minutes=0, quality="Excellent", quality_emoji="🌟")
            slp3 = SleepLog(id="slp_003", user_id="usr_101", date="2026-09-28", hours=6, minutes=45, quality="Restless", quality_emoji="🥱")
            db.add_all([slp1, slp2, slp3])

        if db.query(Medication).filter(Medication.user_id == "usr_101").count() == 0:
            med1 = Medication(id="med_001", user_id="usr_101", name="Iron & Vitamin C", dosage="1 tablet", schedule_time="08:00 AM", reminder_enabled=True)
            med2 = Medication(id="med_002", user_id="usr_101", name="Magnesium Glycinate", dosage="200mg", schedule_time="09:30 PM", reminder_enabled=True)
            db.add_all([med1, med2])

        if db.query(ActivityLog).filter(ActivityLog.user_id == "usr_101").count() == 0:
            act1 = ActivityLog(id="act_001", user_id="usr_101", date="2026-09-30", steps=6400, step_goal=8000, active_minutes=35)
            act2 = ActivityLog(id="act_002", user_id="usr_101", date="2026-09-29", steps=8200, step_goal=8000, active_minutes=45)
            db.add_all([act1, act2])

        db.commit()
        return  # Rest of profile data already seeded

    # 1. User Profile
    user = UserProfile(
        id="usr_101",
        name="Shreya Patel",
        email="shreya.patel@example.com",
        password_hash=DEMO_PASSWORD_HASH,
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
