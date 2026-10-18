from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

print('--- 1. TESTING PCOD CRUD ---')
# GET PCOD
res = client.get('/api/conditions/pcod')
assert res.status_code == 200, f'GET PCOD failed: {res.text}'
pcod_list = res.json()
print(f'Initial PCOD logs count: {len(pcod_list)}')

# POST PCOD
new_pcod = {
    'date': '2026-10-17',
    'severity': 'Moderate',
    'symptoms': 'Acne & Skin Breakouts, Excessive Fatigue',
    'flowPattern': 'Irregular',
    'triggers': 'High Stress, Poor Sleep',
    'notes': 'Recorded in automated verification test'
}
res = client.post('/api/conditions/pcod', json=new_pcod)
assert res.status_code == 200, f'POST PCOD failed: {res.text}'
created_pcod = res.json()
pcod_id = created_pcod['id']
print(f"Created PCOD log: id={pcod_id}, severity={created_pcod['severity']}")

# PUT PCOD
update_pcod = {
    'severity': 'Mild',
    'notes': 'Updated note: symptoms improving'
}
res = client.put(f'/api/conditions/pcod/{pcod_id}', json=update_pcod)
assert res.status_code == 200, f'PUT PCOD failed: {res.text}'
updated_pcod = res.json()
assert updated_pcod['severity'] == 'Mild', f'Severity not updated: {updated_pcod}'
print(f"Updated PCOD log: id={pcod_id}, new severity={updated_pcod['severity']}")

# DELETE PCOD
res = client.delete(f'/api/conditions/pcod/{pcod_id}')
assert res.status_code == 200, f'DELETE PCOD failed: {res.text}'
print(f'Deleted PCOD log: {pcod_id}')

print('\n--- 2. TESTING MIGRAINE CRUD ---')
# GET Migraine
res = client.get('/api/conditions/migraine')
assert res.status_code == 200, f'GET Migraine failed: {res.text}'
mig_list = res.json()
print(f'Initial Migraine logs count: {len(mig_list)}')

# POST Migraine
new_mig = {
    'date': '2026-10-17',
    'durationHours': 4,
    'severity': 'Severe',
    'hasAura': True,
    'hasNausea': True,
    'sensitivityLight': True,
    'triggers': 'Screen glare, Dehydration',
    'medicationTaken': 'Ibuprofen 400mg',
    'notes': 'Test episode'
}
res = client.post('/api/conditions/migraine', json=new_mig)
assert res.status_code == 200, f'POST Migraine failed: {res.text}'
created_mig = res.json()
mig_id = created_mig['id']
print(f"Created Migraine log: id={mig_id}, duration={created_mig['durationHours']}h")

# PUT Migraine
update_mig = {
    'durationHours': 2,
    'severity': 'Moderate'
}
res = client.put(f'/api/conditions/migraine/{mig_id}', json=update_mig)
assert res.status_code == 200, f'PUT Migraine failed: {res.text}'
updated_mig = res.json()
assert updated_mig['severity'] == 'Moderate'
print(f"Updated Migraine log: id={mig_id}, new severity={updated_mig['severity']}")

# DELETE Migraine
res = client.delete(f'/api/conditions/migraine/{mig_id}')
assert res.status_code == 200, f'DELETE Migraine failed: {res.text}'
print(f'Deleted Migraine log: {mig_id}')

print('\n--- 3. TESTING PROFILE & MULTILINGUAL PERSISTENCE ---')
# Update language to Marathi ('mr')
res = client.put('/api/profile', json={'language': 'mr'})
assert res.status_code == 200
res = client.get('/api/profile')
assert res.status_code == 200
assert res.json()['language'] == 'mr', f'Language not persisted: {res.json()}'
print(f"Language updated to 'mr' and verified via GET: {res.json()['language']}")

# Update language to Hindi ('hi')
res = client.put('/api/profile', json={'language': 'hi'})
assert res.status_code == 200
res = client.get('/api/profile')
assert res.status_code == 200
assert res.json()['language'] == 'hi'
print(f"Language updated to 'hi' and verified via GET: {res.json()['language']}")

# Restore to English ('en')
res = client.put('/api/profile', json={'language': 'en'})
assert res.status_code == 200
print("Language restored to 'en'")

print('\n--- 4. TESTING CONDITIONS SUMMARY & PREDICTIONS ---')
res = client.get('/api/conditions/summary')
assert res.status_code == 200
sum_data = res.json()
print(f"Conditions summary keys: {list(sum_data.keys())}")
print(f"PCOD regularity status: {sum_data.get('pcod', {}).get('regularityStatus')}")
print(f"Migraine episodes count: {sum_data.get('migraine', {}).get('totalEpisodes')}")

res = client.get('/api/predictions/insights')
assert res.status_code == 200
pred = res.json()
print(f"Next estimated period: {pred.get('nextEstimatedPeriodDate') or pred.get('nextPeriodEstimatedDate')}")
print(f"Estimated cycle length: {pred.get('estimatedCycleLengthDays') or pred.get('estimatedCycleLength')} days")

print('\n--- 5. TESTING CYCLE & SYMPTOM APIS ---')
res = client.get('/api/cycles')
assert res.status_code == 200
print(f"Cycles count: {len(res.json())}")

res = client.get('/api/symptoms')
assert res.status_code == 200
print(f"Symptoms count: {len(res.json())}")

res = client.get('/api/feedback/my')
assert res.status_code == 200
print(f"Feedback submissions count: {len(res.json())}")

print('\n=========================================')
print('ALL VERIFICATION TESTS COMPLETED SUCCESSFULLY!')
print('=========================================')
