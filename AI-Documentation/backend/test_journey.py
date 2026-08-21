import requests

base_url = "http://127.0.0.1:8000"

patient_id = "P1001"
print(f"Checking patient {patient_id}...")
try:
    resp = requests.get(f"{base_url}/patient/{patient_id}")
    print("Patient Response:", resp.json())
except Exception as e:
    print("Error getting patient:", e)

print(f"\nFetching patient {patient_id} journey timeline (fallback synthesis test)...")
try:
    resp = requests.get(f"{base_url}/patient/{patient_id}/journey")
    print("Journey Response:")
    for event in resp.json():
        print(f"- [{event['event_type'].upper()}] {event['title']}: {event['description']} ({event['timestamp']}) - Status: {event['status']} - Dept: {event['department_service']}")
except Exception as e:
    print("Error getting journey:", e)

print("\nAdding a manual journey event (follow-up scheduling)...")
event_data = {
    "event_type": "followup",
    "title": "Cardiology Follow-Up Scheduled",
    "description": "Scheduled a follow-up consultation with Dr. Jenkins to review vitals and ECG findings.",
    "status": "Scheduled",
    "department_service": "Cardiology Outpatient Clinic",
    "related_entity_type": "appointment",
    "related_entity_id": "appt_cardio_101"
}
try:
    resp = requests.post(f"{base_url}/patient/{patient_id}/journey/event", json=event_data)
    print("Add Event Response:", resp.json())
except Exception as e:
    print("Error adding journey event:", e)

print(f"\nFetching patient {patient_id} journey timeline again...")
try:
    resp = requests.get(f"{base_url}/patient/{patient_id}/journey")
    print("Updated Journey Response:")
    for event in resp.json():
        print(f"- [{event['event_type'].upper()}] {event['title']}: {event['description']} ({event['timestamp']}) - Status: {event['status']} - Dept: {event['department_service']}")
except Exception as e:
    print("Error getting journey:", e)
