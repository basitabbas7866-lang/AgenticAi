import requests

base_url = "http://127.0.0.1:8000"

print("--- Initializing Multi-Role User Auth Verification ---")

# Test 1: Register Doctor Account
print("\n[TEST 1] Register Doctor Account...")
doctor_payload = {
    "name": "Dr. Sarah Jenkins",
    "email": "sarah@careweave.com",
    "password": "doctorpassword123",
    "role": "doctor",
    "specialty": "Cardiology"
}
try:
    resp = requests.post(f"{base_url}/auth/register", json=doctor_payload)
    print("Doctor Register Status:", resp.status_code)
    print("Response:", resp.json())
except Exception as e:
    print("Doctor Register failed:", e)

# Test 2: Log in Doctor Account
print("\n[TEST 2] Login Doctor Account...")
doctor_login = {
    "email": "sarah@careweave.com",
    "password": "doctorpassword123",
    "role": "doctor"
}
try:
    resp = requests.post(f"{base_url}/auth/login", json=doctor_login)
    print("Doctor Login Status:", resp.status_code)
    print("Response:", resp.json())
except Exception as e:
    print("Doctor Login failed:", e)

# Test 3: Register Patient Account
print("\n[TEST 3] Register Patient Account...")
patient_payload = {
    "name": "David Miller",
    "email": "david@patient.com",
    "password": "patientpassword456",
    "role": "patient"
}
try:
    resp = requests.post(f"{base_url}/auth/register", json=patient_payload)
    print("Patient Register Status:", resp.status_code)
    print("Response:", resp.json())
except Exception as e:
    print("Patient Register failed:", e)

# Test 4: Log in Patient Account
print("\n[TEST 4] Login Patient Account...")
patient_login = {
    "email": "david@patient.com",
    "password": "patientpassword456",
    "role": "patient"
}
try:
    resp = requests.post(f"{base_url}/auth/login", json=patient_login)
    print("Patient Login Status:", resp.status_code)
    print("Response:", resp.json())
except Exception as e:
    print("Patient Login failed:", e)

# Test 5: Verify login validation failure
print("\n[TEST 5] Login failure validation (wrong password)...")
fail_login = {
    "email": "david@patient.com",
    "password": "wrongpassword",
    "role": "patient"
}
try:
    resp = requests.post(f"{base_url}/auth/login", json=fail_login)
    print("Failed Login Status:", resp.status_code)
    print("Response:", resp.json())
except Exception as e:
    print("Failed Login test failed:", e)
