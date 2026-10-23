import urllib.request
import urllib.error
import json
import time

BASE_URL = "http://localhost:8000/api"

def request(endpoint, method="GET", data=None, token=None):
    url = f"{BASE_URL}{endpoint}"
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    body = json.dumps(data).encode("utf-8") if data else None
    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            content = resp.read().decode("utf-8")
            return resp.status, json.loads(content) if content else {}
    except urllib.error.HTTPError as e:
        error_content = e.read().decode("utf-8")
        try:
            return e.code, json.loads(error_content)
        except Exception:
            return e.code, {"error": error_content}
    except Exception as e:
        return 500, {"error": str(e)}

def main():
    print("--- 1. Testing Demo Account ---")
    status, res = request("/auth/login", method="POST", data={
        "email": "shreya.patel@example.com",
        "password": "password123"
    })
    assert status == 200, f"Demo login failed: {status} {res}"
    demo_token = res["token"]
    demo_user = res["user"]
    print(f"Demo login successful: user_id={demo_user['id']}, name={demo_user['name']}")

    # Check demo records exist
    status, demo_cycles = request("/cycles", token=demo_token)
    assert status == 200 and len(demo_cycles) > 0, f"Demo cycles missing: {demo_cycles}"
    print(f"Demo user has {len(demo_cycles)} cycles in database")

    status, demo_symptoms = request("/symptoms", token=demo_token)
    assert status == 200 and len(demo_symptoms) > 0, f"Demo symptoms missing: {demo_symptoms}"
    print(f"Demo user has {len(demo_symptoms)} symptoms in database")

    status, demo_sleep = request("/sleep", token=demo_token)
    assert status == 200 and len(demo_sleep) > 0, f"Demo sleep logs missing: {demo_sleep}"
    print(f"Demo user has {len(demo_sleep)} sleep logs in database")

    status, demo_meds = request("/medications", token=demo_token)
    assert status == 200 and len(demo_meds) > 0, f"Demo meds missing: {demo_meds}"
    print(f"Demo user has {len(demo_meds)} medications in database")

    print("\n--- 2. Testing New User 1 (Zero-State & Input Persistence) ---")
    ts = int(time.time())
    u1_email = f"user1_{ts}@test.com"
    status, res1 = request("/auth/signup", method="POST", data={
        "name": "Alice Tester",
        "email": u1_email,
        "password": "password123"
    })
    assert status == 200, f"User 1 signup failed: {status} {res1}"
    u1_token = res1["token"]
    u1_id = res1["user"]["id"]
    print(f"User 1 created: user_id={u1_id}")

    # Verify User 1 starts with 0 cycles, 0 symptoms, 0 sleep, 0 meds, 0 predictions
    status, u1_cycles = request("/cycles", token=u1_token)
    assert status == 200 and len(u1_cycles) == 0, f"User 1 should have 0 cycles, got: {u1_cycles}"
    print("User 1 has 0 cycles (verified empty dashboard)")

    status, u1_symptoms = request("/symptoms", token=u1_token)
    assert status == 200 and len(u1_symptoms) == 0, f"User 1 should have 0 symptoms, got: {u1_symptoms}"
    print("User 1 has 0 symptoms (verified)")

    status, u1_sleep = request("/sleep", token=u1_token)
    assert status == 200 and len(u1_sleep) == 0, f"User 1 should have 0 sleep logs, got: {u1_sleep}"
    print("User 1 has 0 sleep logs (verified)")

    status, u1_meds = request("/medications", token=u1_token)
    assert status == 200 and len(u1_meds) == 0, f"User 1 should have 0 medications, got: {u1_meds}"
    print("User 1 has 0 medications (verified)")

    status, u1_pred = request("/predictions/insights", token=u1_token)
    assert status == 200 and not u1_pred.get("isSufficientData", True), f"User 1 predictions should be uncalibrated: {u1_pred}"
    print(f"User 1 predictions: isSufficientData={u1_pred.get('isSufficientData')} (no fabricated stats)")

    # Now User 1 logs a cycle and flow
    status, new_cycle = request("/cycles/flow", method="POST", data={
        "startDate": "2026-10-20",
        "flow": "Medium"
    }, token=u1_token)
    assert status == 200, f"User 1 log cycle flow failed: {status} {new_cycle}"
    u1_cycle_id = new_cycle["id"]
    print(f"User 1 logged period flow: cycle_id={u1_cycle_id}")

    # User 1 logs a symptom
    status, new_sym = request("/symptoms", method="POST", data={
        "symptomName": "Lower Back Pain",
        "category": "Pain",
        "severity": "Moderate",
        "notes": "Felt upon waking"
    }, token=u1_token)
    assert status == 200, f"User 1 log symptom failed: {status} {new_sym}"
    u1_sym_id = new_sym["id"]
    print(f"User 1 logged symptom: sym_id={u1_sym_id}")

    # User 1 logs sleep
    status, new_slp = request("/sleep", method="POST", data={
        "date": "2026-10-20",
        "hours": 8,
        "minutes": 15,
        "quality": "Good",
        "qualityEmoji": "😴",
        "notes": "Restful sleep"
    }, token=u1_token)
    assert status == 200, f"User 1 log sleep failed: {status} {new_slp}"
    u1_sleep_id = new_slp["id"]
    print(f"User 1 logged sleep: sleep_id={u1_sleep_id}")

    # User 1 logs medication
    status, new_med = request("/medications", method="POST", data={
        "name": "Ibuprofen",
        "dosage": "200mg",
        "scheduleTime": "09:00 AM",
        "reminderEnabled": True,
        "notes": "For cramps"
    }, token=u1_token)
    assert status == 200, f"User 1 log medication failed: {status} {new_med}"
    u1_med_id = new_med["id"]
    print(f"User 1 logged medication: med_id={u1_med_id}")

    # User 1 adds hydration
    status, new_hyd = request("/hydration/add", method="POST", data={
        "amountMl": 500
    }, token=u1_token)
    assert status == 200 and new_hyd.get("currentMl") == 500, f"User 1 hydration failed: {status} {new_hyd}"
    print(f"User 1 logged hydration: currentMl={new_hyd.get('currentMl')}")

    print("\n--- 3. Testing New User 2 (Isolation & Authorization Attacks) ---")
    u2_email = f"user2_{ts}@test.com"
    status, res2 = request("/auth/signup", method="POST", data={
        "name": "Bob Tester",
        "email": u2_email,
        "password": "password123"
    })
    assert status == 200, f"User 2 signup failed: {status} {res2}"
    u2_token = res2["token"]
    u2_id = res2["user"]["id"]
    print(f"User 2 created: user_id={u2_id}")

    # Verify User 2 sees 0 records
    status, u2_cycles = request("/cycles", token=u2_token)
    assert status == 200 and len(u2_cycles) == 0, f"User 2 leaked User 1's cycles: {u2_cycles}"
    status, u2_syms = request("/symptoms", token=u2_token)
    assert status == 200 and len(u2_syms) == 0, f"User 2 leaked User 1's symptoms: {u2_syms}"
    status, u2_sleeps = request("/sleep", token=u2_token)
    assert status == 200 and len(u2_sleeps) == 0, f"User 2 leaked User 1's sleep logs: {u2_sleeps}"
    status, u2_meds = request("/medications", token=u2_token)
    assert status == 200 and len(u2_meds) == 0, f"User 2 leaked User 1's medications: {u2_meds}"
    print("User 2 confirmed: 0 records leaked from User 1 or Demo user!")

    # Attempt Authorization attack: User 2 tries to delete User 1's cycle
    status, res = request(f"/cycles/{u1_cycle_id}", method="DELETE", token=u2_token)
    assert status in (404, 403), f"Security hole! User 2 should NOT delete User 1's cycle, got: {status} {res}"
    print(f"Security passed: User 2 cycle deletion rejected with status {status}")

    # User 2 tries to delete User 1's symptom
    status, res = request(f"/symptoms/{u1_sym_id}", method="DELETE", token=u2_token)
    assert status in (404, 403), f"Security hole! User 2 should NOT delete User 1's symptom, got: {status} {res}"
    print(f"Security passed: User 2 symptom deletion rejected with status {status}")

    # User 2 tries to delete User 1's sleep log
    status, res = request(f"/sleep/{u1_sleep_id}", method="DELETE", token=u2_token)
    assert status in (404, 403), f"Security hole! User 2 should NOT delete User 1's sleep log, got: {status} {res}"
    print(f"Security passed: User 2 sleep log deletion rejected with status {status}")

    # User 2 tries to delete User 1's medication
    status, res = request(f"/medications/{u1_med_id}", method="DELETE", token=u2_token)
    assert status in (404, 403), f"Security hole! User 2 should NOT delete User 1's medication, got: {status} {res}"
    print(f"Security passed: User 2 medication deletion rejected with status {status}")

    print("\n--- 4. Testing User 1 Relogin & Persistence ---")
    status, res1_relogin = request("/auth/login", method="POST", data={
        "email": u1_email,
        "password": "password123"
    })
    assert status == 200, f"User 1 relogin failed: {status}"
    u1_relogin_token = res1_relogin["token"]

    status, u1_saved_cycles = request("/cycles", token=u1_relogin_token)
    assert status == 200 and len(u1_saved_cycles) == 1, f"User 1 cycle not persisted: {u1_saved_cycles}"
    assert u1_saved_cycles[0]["id"] == u1_cycle_id
    assert len(u1_saved_cycles[0].get("flowLogs", [])) == 1
    print(f"User 1 cycles intact on relogin: {len(u1_saved_cycles)} cycle with flowLogs persisted!")

    status, u1_saved_syms = request("/symptoms", token=u1_relogin_token)
    assert status == 200 and len(u1_saved_syms) == 1
    assert u1_saved_syms[0]["symptomName"] == "Lower Back Pain"
    print("User 1 symptoms intact on relogin!")

    status, u1_saved_sleep = request("/sleep", token=u1_relogin_token)
    assert status == 200 and len(u1_saved_sleep) == 1
    assert u1_saved_sleep[0]["hours"] == 8
    print("User 1 sleep logs intact on relogin!")

    status, u1_saved_meds = request("/medications", token=u1_relogin_token)
    assert status == 200 and len(u1_saved_meds) == 1
    assert u1_saved_meds[0]["name"] == "Ibuprofen"
    print("User 1 medications intact on relogin!")

    print("\nALL BACKEND TESTS PASSED WITH 100% SUCCESS!")

if __name__ == "__main__":
    main()
