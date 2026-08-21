import requests
import json

base_url = "http://127.0.0.1:8000"
patient_id = "P1005"

print(f"--- Initializing Phase 4 Multi-Agent Coordination Verification ---")
print(f"Requesting multi-agent analysis for patient {patient_id}...")

try:
    resp = requests.get(f"{base_url}/patient/{patient_id}/coordination/analyze", timeout=120)
    print("Response Status:", resp.status_code)
    if resp.status_code == 200:
        data = resp.json()
        print("\n--- Consolidated Coordination Package ---")
        print("Patient Name:", data["patient_name"])
        
        print("\n[SUMMARY AGENT]")
        print("FACTS:", data["summary"].get("FACTS"))
        print("REASON:", data["summary"].get("REASON"))
        print("PROPOSED_ACTION:", data["summary"].get("PROPOSED_ACTION"))
        
        print("\n[APPOINTMENT AGENT]")
        print("FACTS:", data["appointments"].get("FACTS"))
        print("REASON:", data["appointments"].get("REASON"))
        print("PROPOSED_ACTION:", data["appointments"].get("PROPOSED_ACTION"))
        print("REQUIRES_HUMAN_REVIEW:", data["appointments"].get("REQUIRES_HUMAN_REVIEW"))

        print("\n[REFERRAL AGENT]")
        print("FACTS:", data["referrals"].get("FACTS"))
        print("REASON:", data["referrals"].get("REASON"))
        print("PROPOSED_ACTION:", data["referrals"].get("PROPOSED_ACTION"))
        print("REQUIRES_HUMAN_REVIEW:", data["referrals"].get("REQUIRES_HUMAN_REVIEW"))
        
        print("\n[INVESTIGATION AGENT]")
        print("FACTS:", data["investigations"].get("FACTS"))
        print("REASON:", data["investigations"].get("REASON"))
        print("PROPOSED_ACTION:", data["investigations"].get("PROPOSED_ACTION"))
        print("REQUIRES_HUMAN_REVIEW:", data["investigations"].get("REQUIRES_HUMAN_REVIEW"))
        
        print("\n[FOLLOWUP AGENT]")
        print("FACTS:", data["followups"].get("FACTS"))
        print("REASON:", data["followups"].get("REASON"))
        print("PROPOSED_ACTION:", data["followups"].get("PROPOSED_ACTION"))
        print("REQUIRES_HUMAN_REVIEW:", data["followups"].get("REQUIRES_HUMAN_REVIEW"))
    else:
        print("Error Response:", resp.text)
except Exception as e:
    print("Execution Error:", e)
