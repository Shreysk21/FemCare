import os
import sys
import json
from datetime import datetime, date
from fastapi.testclient import TestClient

# Ensure backend directory is in path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from passlib.hash import pbkdf2_sha256
from main import app
from database import SessionLocal, UserProfile, CircleMember, InAppNotification, MoodLog, SymptomLog
from routes.auth import create_access_token


client = TestClient(app)

def run_tests():
    print("=" * 65)
    print(" FemCare End-to-End Test: Data Sharing & Nearby Clinics")
    print("=" * 65)

    db = SessionLocal()
    try:
        # Setup Test User A (Sender) and Test User B (Recipient)
        user_a_id = "test_user_a_101"
        user_b_id = "test_user_b_202"

        # Cleanup prior test data
        db.query(InAppNotification).filter(InAppNotification.user_id.in_([user_a_id, user_b_id])).delete()
        db.query(CircleMember).filter(CircleMember.user_id.in_([user_a_id, user_b_id])).delete()
        db.query(CircleMember).filter(CircleMember.recipient_id.in_([user_a_id, user_b_id])).delete()
        db.query(MoodLog).filter(MoodLog.user_id == user_a_id).delete()
        db.query(SymptomLog).filter(SymptomLog.user_id == user_a_id).delete()
        db.query(UserProfile).filter(UserProfile.id.in_([user_a_id, user_b_id])).delete()
        db.commit()

        # Create User A
        user_a = UserProfile(
            id=user_a_id,
            name="Alice Test",
            email="alice@testfemcare.com",
            password_hash=pbkdf2_sha256.hash("password123"),
            avg_cycle_length=28,
            avg_period_duration=5,
            last_period_start_date=date.today(),
            city="Bengaluru"
        )
        # Create User B
        user_b = UserProfile(
            id=user_b_id,
            name="Bob Test",
            email="bob@testfemcare.com",
            password_hash=pbkdf2_sha256.hash("password123"),
            avg_cycle_length=28,
            city="Bengaluru"
        )
        db.add(user_a)
        db.add(user_b)

        # Add Mood and Symptom for User A
        mood_a = MoodLog(
            id="mood_test_a",
            user_id=user_a_id,
            date=date.today(),
            mood_id="calm",
            label="Rest & Comfort Preferred",
            emoji="🛋️",
            time="10:00 AM",
            note="Secret private diary thought that should not leak unless allowed"
        )
        symptom_a = SymptomLog(
            id="symp_test_a",
            user_id=user_a_id,
            date=date.today(),
            symptom_id="cramps",
            symptom_name="Abdominal Cramps",
            category="Pain & Discomfort",
            severity="Moderate",
            time_logged="10:30 AM",
            notes="Private symptom note"
        )
        db.add(mood_a)
        db.add(symptom_a)
        db.commit()

        token_a = create_access_token({"sub": user_a_id})
        token_b = create_access_token({"sub": user_b_id})
        headers_a = {"Authorization": f"Bearer {token_a}"}
        headers_b = {"Authorization": f"Bearer {token_b}"}

        print("[OK] Test Users Alice (A) and Bob (B) prepared.")

        # -------------------------------------------------------------
        # 1. Non-existent recipient email verification
        # -------------------------------------------------------------
        res_nonexistent = client.post(
            "/api/circle-care/invite",
            json={
                "name": "Ghost",
                "role": "Partner",
                "email": "nonexistent_ghost_999@example.com",
                "permissions": {"phaseAndWindow": True, "emotionalState": True}
            },
            headers=headers_a
        )
        assert res_nonexistent.status_code == 400, f"Expected 400 for unregistered email, got {res_nonexistent.status_code}"
        assert "No registered FemCare account found" in res_nonexistent.json()["detail"]
        print("[PASS] 1. Sharing with unregistered email properly fails with 400 error.")

        # -------------------------------------------------------------
        # 2. Self-sharing disallowed
        # -------------------------------------------------------------
        res_self = client.post(
            "/api/circle-care/invite",
            json={
                "name": "Self",
                "role": "Partner",
                "email": "alice@testfemcare.com",
                "permissions": {"phaseAndWindow": True}
            },
            headers=headers_a
        )
        assert res_self.status_code == 400, f"Expected 400 for self-invite, got {res_self.status_code}"
        print("[PASS] 2. Self-sharing disallowed.")

        # -------------------------------------------------------------
        # 3. Successful share request to registered User B
        # -------------------------------------------------------------
        res_invite = client.post(
            "/api/circle-care/invite",
            json={
                "name": "Bob",
                "role": "Partner",
                "email": "bob@testfemcare.com",
                "permissions": {
                    "phaseAndWindow": True,
                    "emotionalState": True,
                    "specificSymptoms": True,
                    "privateNotes": False  # Explicitly private
                }
            },
            headers=headers_a
        )
        assert res_invite.status_code == 200, f"Invite failed: {res_invite.text}"
        invite_data = res_invite.json()
        share_id = invite_data["id"]
        assert invite_data["status"] == "pending", f"Expected pending status, got {invite_data['status']}"
        assert invite_data["recipientId"] == user_b_id
        print(f"[PASS] 3. Sharing request created in Supabase (ID: {share_id}, status: pending).")

        # -------------------------------------------------------------
        # 4. In-App Notification received by User B
        # -------------------------------------------------------------
        res_notifs_b = client.get("/api/notifications", headers=headers_b)
        assert res_notifs_b.status_code == 200
        notifs_b = res_notifs_b.json()
        assert len(notifs_b) > 0, "Recipient Bob should have received an in-app notification"
        partner_notif = next((n for n in notifs_b if n["referenceId"] == share_id), None)
        assert partner_notif is not None, f"Could not find notification referencing share {share_id}"
        assert partner_notif["type"] == "partner_share_request"
        assert partner_notif["senderName"] == "Alice Test"
        assert partner_notif["status"] == "unread"
        print(f"[PASS] 4. Recipient Bob received in-app notification: '{partner_notif['title']}'.")

        # Prior to acceptance, Bob calling shared-with-me returns NO data
        res_shared_before = client.get("/api/circle-care/shared-with-me", headers=headers_b)
        assert len(res_shared_before.json()) == 0, "Pending share must NOT reveal data before acceptance!"
        print("[PASS] 5. Data isolation verified: pending share reveals zero health data.")

        # -------------------------------------------------------------
        # 5. User B accepts the sharing request
        # -------------------------------------------------------------
        res_respond = client.post(
            f"/api/circle-care/{share_id}/respond",
            json={"action": "accept"},
            headers=headers_b
        )
        assert res_respond.status_code == 200
        assert res_respond.json()["status"] == "accepted"

        # Check that notification for Bob was marked as read
        res_notifs_b_after = client.get("/api/notifications", headers=headers_b)
        b_notif_after = next((n for n in res_notifs_b_after.json() if n["id"] == partner_notif["id"]), None)
        assert b_notif_after["status"] == "read"
        print("[PASS] 6. Recipient Bob accepted request; inbound notification marked as read.")

        # Check that Alice (Sender) received notification of Bob's acceptance
        res_notifs_a = client.get("/api/notifications", headers=headers_a)
        accepted_notif_a = next((n for n in res_notifs_a.json() if n["referenceId"] == share_id), None)
        assert accepted_notif_a is not None
        assert "accepted" in accepted_notif_a["title"].lower()
        print("[PASS] 7. Sender Alice received notification of Bob's acceptance.")

        # -------------------------------------------------------------
        # 6. User B views authorized health data
        # -------------------------------------------------------------
        res_shared = client.get("/api/circle-care/shared-with-me", headers=headers_b)
        assert res_shared.status_code == 200
        shared_list = res_shared.json()
        assert len(shared_list) == 1
        item = shared_list[0]

        assert item["senderName"] == "Alice Test"
        assert item["status"] == "accepted"
        assert item["currentPhase"] is not None
        assert item["currentPhase"]["phaseName"] == "Menstrual Phase"
        assert item["emotionalState"] is not None
        assert item["emotionalState"]["label"] == "Rest & Comfort Preferred"
        assert item["emotionalState"]["note"] is None, "Private notes were NOT permitted, must be None!"
        assert item["recentSymptoms"] is not None
        assert len(item["recentSymptoms"]) == 1
        assert item["recentSymptoms"][0]["notes"] is None, "Symptom private note must be redacted!"
        assert item["privateNotes"] is None, "Private notes array must be None!"
        assert len(item["recommendedPartnerActions"]) > 0
        print("[PASS] 8. Authorized data displayed with strict redaction of private notes.")

        # -------------------------------------------------------------
        # 7. Sender User A revokes access
        # -------------------------------------------------------------
        res_revoke = client.post(f"/api/circle-care/{share_id}/revoke", headers=headers_a)
        assert res_revoke.status_code == 200
        assert res_revoke.json()["status"] == "revoked"

        # Shared data is immediately cut off
        res_shared_revoked = client.get("/api/circle-care/shared-with-me", headers=headers_b)
        assert len(res_shared_revoked.json()) == 0, "Revoked share must immediately stop showing health data!"
        print("[PASS] 9. Access revoked; shared health data immediately cut off for recipient.")

        # -------------------------------------------------------------
        # 8. Nearby Clinics & Doctors Tests
        # -------------------------------------------------------------
        # A. GPS Coordinates (Bengaluru)
        res_clinics_gps = client.get("/api/clinics/nearby?latitude=12.9716&longitude=77.5946&radius_km=15")
        assert res_clinics_gps.status_code == 200
        clinics_gps = res_clinics_gps.json()
        assert len(clinics_gps) > 0, "Expected clinics for Bengaluru GPS coordinates"
        # Check sort order by distance
        distances = [c["distanceNumericKm"] for c in clinics_gps]
        assert distances == sorted(distances), "Results must be sorted by distance ascending!"
        # Check required fields
        c0 = clinics_gps[0]
        assert "name" in c0 and "address" in c0 and "directionsUrl" in c0
        assert "doctors" in c0
        print(f"[PASS] 10. GPS Nearby Clinics found: {len(clinics_gps)} facilities, sorted by distance.")

        # B. Manual City / PIN search (Delhi)
        res_clinics_delhi = client.get("/api/clinics/nearby?query=Delhi")
        assert res_clinics_delhi.status_code == 200
        clinics_delhi = res_clinics_delhi.json()
        assert len(clinics_delhi) > 0
        delhi_names = [c["name"] for c in clinics_delhi]
        assert any("Fortis" in c["name"] or "Max" in c["name"] or "Delhi" in c["city"] for c in clinics_delhi)
        print(f"[PASS] 11. Manual City search ('Delhi') found location-specific clinics: {len(clinics_delhi)} providers.")

        # C. Specialized Search by Gynecologist / Keyword
        res_search = client.get("/api/clinics/nearby?query=Motherhood")
        assert res_search.status_code == 200
        clinics_search = res_search.json()
        assert any("Motherhood" in c["name"] for c in clinics_search)
        print("[PASS] 12. Search by facility/specialty keyword ('Motherhood') succeeded.")

        # D. Verify no fake doctor names fabricated
        for c in clinics_gps:
            if not c["doctorDataAvailable"]:
                assert len(c["doctors"]) == 0
                assert c["doctorUnavailableNotice"] is not None
        print("[PASS] 13. Verified provider information integrity confirmed: no fake doctors fabricated.")

        # Clean up test users
        db.query(InAppNotification).filter(InAppNotification.user_id.in_([user_a_id, user_b_id])).delete()
        db.query(CircleMember).filter(CircleMember.user_id.in_([user_a_id, user_b_id])).delete()
        db.query(CircleMember).filter(CircleMember.recipient_id.in_([user_a_id, user_b_id])).delete()
        db.query(MoodLog).filter(MoodLog.user_id == user_a_id).delete()
        db.query(SymptomLog).filter(SymptomLog.user_id == user_a_id).delete()
        db.query(UserProfile).filter(UserProfile.id.in_([user_a_id, user_b_id])).delete()
        db.commit()

        print("=" * 65)
        print(" ALL 13 BACKEND TEST CASES PASSED SUCCESSFULLY! ")
        print("=" * 65)

    finally:
        db.close()

if __name__ == "__main__":
    run_tests()
