"""
Automated validation of all 4 Smart Health Alert Scenarios:
1. Insufficient data (prevents false alarms when < 3 records)
2. Normal variation (mild/expected symptoms)
3. Concerning pattern (frequent migraines, worsening pain, persistent symptoms)
4. Urgent safety guidance (acute severe pain, severe prolonged migraine, hemorrhagic bleeding)
"""
import sys
from datetime import datetime, timedelta
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from database import Base, UserProfile, SymptomLog, MigraineLog, Cycle, CycleFlowLog
from routes.predictions import get_smart_health_alerts

def run_tests():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(bind=engine)
    Session = sessionmaker(bind=engine)
    db = Session()

    # Create dummy user
    user = UserProfile(id="usr_101", name="Test User", email="test@femcare.app")
    db.add(user)
    db.commit()

    print("=== TEST 1: Insufficient Data (< 3 symptoms, < 2 migraines) ===")
    db.add(SymptomLog(
        id="s1", user_id="usr_101", date=datetime.utcnow().strftime("%Y-%m-%d"),
        symptom_id="headache", symptom_name="Mild Headache", category="Pain",
        severity="Mild", time_logged="09:00"
    ))
    db.commit()
    res1 = get_smart_health_alerts(db)
    assert res1.status == "insufficient_data", f"Expected insufficient_data, got {res1.status}"
    assert res1.hasAlert == False, f"Expected hasAlert=False"
    print(f"PASS: Insufficient data correctly detected (status={res1.status}, hasAlert={res1.hasAlert})")

    print("\n=== TEST 2: Normal Baseline (>= 3 logs, no concerning trends) ===")
    # Add 2 more mild symptoms on different dates
    d1 = (datetime.utcnow() - timedelta(days=2)).strftime("%Y-%m-%d")
    d2 = (datetime.utcnow() - timedelta(days=4)).strftime("%Y-%m-%d")
    db.add(SymptomLog(
        id="s2", user_id="usr_101", date=d1,
        symptom_id="bloating", symptom_name="Bloating", category="Digestive",
        severity="Mild", time_logged="10:00"
    ))
    db.add(SymptomLog(
        id="s3", user_id="usr_101", date=d2,
        symptom_id="fatigue", symptom_name="Fatigue", category="Energy",
        severity="Mild", time_logged="11:00"
    ))
    db.commit()
    res2 = get_smart_health_alerts(db)
    assert res2.status == "normal", f"Expected normal, got {res2.status}"
    assert res2.hasAlert == False, f"Expected hasAlert=False"
    print(f"PASS: Normal status correctly detected (status={res2.status}, hasAlert={res2.hasAlert})")

    print("\n=== TEST 3A: Concerning Pattern - Worsening Pain Progression ===")
    # Add escalating pain entries
    today_str = datetime.utcnow().strftime("%Y-%m-%d")
    yesterday_str = (datetime.utcnow() - timedelta(days=1)).strftime("%Y-%m-%d")
    db.add(SymptomLog(
        id="s4", user_id="usr_101", date=yesterday_str,
        symptom_id="pelvic_cramps", symptom_name="Abdominal Cramps", category="Pain",
        severity="Moderate", time_logged="14:00"
    ))
    db.add(SymptomLog(
        id="s5", user_id="usr_101", date=today_str,
        symptom_id="pelvic_cramps", symptom_name="Abdominal Cramps", category="Pain",
        severity="Severe", time_logged="15:00", notes="Noticeably getting more intense"
    ))
    db.commit()
    res3 = get_smart_health_alerts(db)
    assert res3.hasAlert == True, f"Expected hasAlert=True"
    print(f"PASS: Concerning/Urgent pain detected: level={res3.alert.level}, title='{res3.alert.title}', pattern={res3.alert.patternType}")

    print("\n=== TEST 3B: Concerning Pattern - Frequent Migraines (>= 3 in 14 days) ===")
    # Clean symptoms and add 3 migraines
    db.query(SymptomLog).delete()
    for i in range(3):
        m_date = (datetime.utcnow() - timedelta(days=i*2)).strftime("%Y-%m-%d")
        db.add(MigraineLog(
            id=f"mig_{i}", user_id="usr_101", date=m_date,
            duration_hours=4, severity="Moderate", has_aura=True,
            triggers="Stress", medication_taken="Ibuprofen"
        ))
    db.commit()
    res_mig = get_smart_health_alerts(db)
    assert res_mig.status == "concerning", f"Expected concerning, got {res_mig.status}"
    assert res_mig.alert.patternType == "frequent_migraine"
    print(f"PASS: Frequent migraine detected: {res_mig.alert.title} (frequency={res_mig.alert.frequency})")

    print("\n=== TEST 4A: Urgent Emergency Safety Guidance - Severe Acute Pain ===")
    db.add(SymptomLog(
        id="urgent_s1", user_id="usr_101", date=today_str,
        symptom_id="pelvic_pain", symptom_name="Pelvic Pain", category="Pain",
        severity="Severe", time_logged="18:00", notes="Sudden sharp pain, feeling dizzy and faint"
    ))
    db.commit()
    res_urg_pain = get_smart_health_alerts(db)
    assert res_urg_pain.status == "urgent", f"Expected urgent, got {res_urg_pain.status}"
    assert res_urg_pain.alert.level == "urgent"
    assert "call_emergency" in res_urg_pain.alert.actions
    print(f"PASS: Urgent acute pain alert detected: {res_urg_pain.alert.title}")

    print("\n=== TEST 4B: Urgent Safety Guidance - Severe Prolonged Migraine (>= 24h) ===")
    db.query(SymptomLog).delete()
    db.add(MigraineLog(
        id="urgent_mig_1", user_id="usr_101", date=today_str,
        duration_hours=26, severity="Severe", has_aura=True,
        triggers="Hormonal", notes="Severe continuous headache > 24 hours"
    ))
    db.commit()
    res_urg_mig = get_smart_health_alerts(db)
    assert res_urg_mig.status == "urgent", f"Expected urgent, got {res_urg_mig.status}"
    assert res_urg_mig.alert.level == "urgent"
    print(f"PASS: Urgent prolonged migraine alert detected: {res_urg_mig.alert.title}")

    print("\n=== TEST 4C: Urgent Safety Guidance - Severe Hemorrhagic Bleeding ===")
    db.query(MigraineLog).delete()
    db.add(SymptomLog(
        id="urgent_bleed_1", user_id="usr_101", date=today_str,
        symptom_id="heavy_bleeding", symptom_name="Heavy Bleeding", category="Bleeding",
        severity="Severe", time_logged="20:00", notes="Passing large clots, soaking pads every 45 mins, feeling faint"
    ))
    db.commit()
    res_urg_bleed = get_smart_health_alerts(db)
    assert res_urg_bleed.status == "urgent", f"Expected urgent, got {res_urg_bleed.status}"
    assert res_urg_bleed.alert.level == "urgent"
    assert "emergency" in res_urg_bleed.alert.recommendation.lower()
    print(f"PASS: Urgent bleeding alert detected: {res_urg_bleed.alert.title}")

    print("\n=== ALL SCENARIOS VERIFIED SUCCESSFULLY! ===")

if __name__ == "__main__":
    run_tests()
