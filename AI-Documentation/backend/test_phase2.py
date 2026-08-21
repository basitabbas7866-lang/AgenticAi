import requests

base_url = "http://127.0.0.1:8000"
patient_id = "P1001"

print(f"Testing active patient {patient_id} endpoints...")

# 1. Test Appointments
print("\n--- Testing Appointments ---")
appt_data = {
    "department_service": "Cardiology Department",
    "appointment_type": "Consultation",
    "appointment_date": "2026-08-30T10:00:00",
    "notes": "Routine cardiogram follow-up."
}
resp = requests.post(f"{base_url}/patient/{patient_id}/appointments", json=appt_data)
print("Create Appointment:", resp.json())
if resp.json().get("success"):
    appt_id = resp.json().get("appointment_id")
    
    # Update appointment (complete it)
    resp_update = requests.patch(
        f"{base_url}/appointments/{appt_id}",
        json={"status": "COMPLETED", "notes": "Cardiogram showed optimal heart activity."}
    )
    print("Complete Appointment:", resp_update.json())

# 2. Test Referrals
print("\n--- Testing Referrals ---")
ref_data = {
    "referring_department": "Outpatient Clinic",
    "referred_department_specialist": "Nephrology Specialist",
    "referral_reason": "Persistent high creatinine readings in metabolic panels.",
    "priority": "Urgent"
}
resp = requests.post(f"{base_url}/patient/{patient_id}/referrals", json=ref_data)
print("Create Referral:", resp.json())
if resp.json().get("success"):
    ref_id = resp.json().get("referral_id")
    
    # Update referral (accept it)
    resp_update = requests.patch(
        f"{base_url}/referrals/{ref_id}",
        json={"status": "ACCEPTED", "appointment_info": "Scheduled with Dr. Miller on Sep 02."}
    )
    print("Accept Referral:", resp_update.json())

# 3. Test Investigations
print("\n--- Testing Investigations ---")
inv_data = {
    "test_name": "Kidney Ultrasound (Renal Scan)",
    "notes": "Order issued to rule out structural urinary tract obstruction."
}
resp = requests.post(f"{base_url}/patient/{patient_id}/investigations", json=inv_data)
print("Create Investigation:", resp.json())
if resp.json().get("success"):
    inv_id = resp.json().get("investigation_id")
    
    # Update investigation (result available - safe workflow check)
    resp_update = requests.patch(
        f"{base_url}/investigations/{inv_id}",
        json={
            "status": "RESULT_AVAILABLE",
            "result_reference": "renal_ultrasound_P1001_v1.pdf",
            "notes": "Results loaded in diagnostic catalog. Physician review required."
        }
    )
    print("Complete Investigation:", resp_update.json())

# 4. Check unified timeline updates
print("\n--- Testing Unified Care Journey Timeline ---")
resp = requests.get(f"{base_url}/patient/{patient_id}/journey")
for e in resp.json()[-5:]: # View last 5 events
    print(f"- [{e['event_type'].upper()}] {e['title']}: {e['description']} (Dept: {e['department_service']}, Status: {e['status']})")
