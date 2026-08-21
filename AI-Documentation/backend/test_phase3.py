import requests
from datetime import datetime, timedelta

base_url = "http://127.0.0.1:8000"

print("--- Initializing Phase 3 Coordination Monitoring Verification ---")

# 1. Create temporary patient David Miller
print("\nCreating patient David Miller...")
pat_data = {
    "name": "David Miller",
    "age": 45,
    "gender": "Male",
    "phone": "+1-555-0987"
}
resp = requests.post(f"{base_url}/patient/create", json=pat_data)
print("Create Patient Status:", resp.status_code, resp.json())
patient_id = resp.json().get("patient_id")

if not patient_id:
    print("Could not obtain patient_id. Aborting.")
    exit(1)

# 2. Add an appointment in the past (SCHEDULED but expired -> missed)
print(f"\nCreating expired scheduled appointment for {patient_id}...")
past_date = (datetime.utcnow() - timedelta(days=2)).isoformat()
appt_data = {
    "department_service": "Orthopedics Department",
    "appointment_type": "Initial Consultation",
    "appointment_date": past_date,
    "notes": "Spine analysis evaluation."
}
resp = requests.post(f"{base_url}/patient/{patient_id}/appointments", json=appt_data)
print("Create Past Appointment:", resp.json())

# 3. Add an unscheduled referral
print(f"\nCreating unscheduled referral for {patient_id}...")
ref_data = {
    "referring_department": "Outpatient Clinic",
    "referred_department_specialist": "Rheumatology Specialist",
    "referral_reason": "Suspected rheumatoid arthritis following joint pain reports.",
    "priority": "Routine"
}
resp = requests.post(f"{base_url}/patient/{patient_id}/referrals", json=ref_data)
print("Create Unscheduled Referral:", resp.json())

# 4. Trigger global coordination scanner
print("\nRunning global coordination scanner...")
resp = requests.get(f"{base_url}/coordination/alerts")
alerts = resp.json()

print(f"\nScan complete! Detected {len(alerts)} alerts. Showing alerts for David Miller ({patient_id}):")
for a in alerts:
    if a["patient_id"] == patient_id:
        print(f"\n- [ALERT] Severity: {a['severity']} | Type: {a['issue_type']}")
        print(f"  Explanation: {a['explanation']}")
        print(f"  Action: {a['recommended_action']}")
        print(f"  Requires Human Review: {a['requires_human_review']}")
