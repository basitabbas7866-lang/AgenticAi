import requests
import json

base_url = "http://127.0.0.1:8000"

print("--- Initializing Phase 6 Human-in-the-Loop Coordination Review Verification ---")

# Step 1: Trigger a sync to make sure any active alerts are populated in the reviews DB table
print("\n[STEP 1] Syncing active clinical issues into review queue...")
try:
    resp_sync = requests.post(f"{base_url}/coordination/reviews/sync", timeout=30)
    print("Sync Status:", resp_sync.status_code)
    if resp_sync.status_code == 200:
        print("Sync Response:", resp_sync.json())
    else:
        print("Sync Error:", resp_sync.text)
except Exception as e:
    print("Sync failed:", e)

# Step 2: Fetch the queue list
print("\n[STEP 2] Fetching list of all coordination reviews...")
try:
    resp_list = requests.get(f"{base_url}/coordination/reviews", timeout=30)
    print("Fetch Status:", resp_list.status_code)
    if resp_list.status_code == 200:
        reviews = resp_list.json()
        print(f"Total reviews in system: {len(reviews)}")
        
        pending = [r for r in reviews if r["status"] == "PENDING"]
        print(f"Pending reviews: {len(pending)}")
        
        # If there are no pending reviews, let's insert a mock one manually using SQL or just report it
        # Actually, let's continue with testing decision action if a pending item exists
        if len(pending) > 0:
            target = pending[0]
            review_id = target["id"]
            patient_name = target["patient_name"]
            original_proposal = target["proposed_action"]
            
            print(f"\nTargeting review ID {review_id} for Patient: {patient_name}")
            print(f"Original AI Proposal: '{original_proposal}'")
            
            # Step 3: Approve the review
            print("\n[STEP 3] Testing APPROVE action...")
            action_payload = {
                "decision": "APPROVED",
                "reviewer": "Dr. Sarah Jenkins",
                "comment": "Patient requires immediate follow-up. Action approved."
            }
            resp_action = requests.post(
                f"{base_url}/coordination/reviews/{review_id}/action", 
                json=action_payload, 
                timeout=30
            )
            print("Action Status:", resp_action.status_code)
            if resp_action.status_code == 200:
                result = resp_action.json()
                print("Approve Result Status:", result["status"])
                print("Reviewer:", result["reviewer"])
                print("Comment:", result["reviewer_comment"])
                print("Timestamp:", result["decision_timestamp"])
            else:
                print("Action Error:", resp_action.text)
                
            # If there's another pending review, let's reject it for coverage
            if len(pending) > 1:
                target_2 = pending[1]
                review_id_2 = target_2["id"]
                print(f"\n[STEP 4] Testing REJECT action on review ID {review_id_2}...")
                action_payload_2 = {
                    "decision": "REJECTED",
                    "reviewer": "Dr. Sarah Jenkins",
                    "comment": "Rescheduling not needed as patient has already confirmed attendance via portal."
                }
                resp_action_2 = requests.post(
                    f"{base_url}/coordination/reviews/{review_id_2}/action", 
                    json=action_payload_2, 
                    timeout=30
                )
                print("Action Status:", resp_action_2.status_code)
                if resp_action_2.status_code == 200:
                    result_2 = resp_action_2.json()
                    print("Reject Result Status:", result_2["status"])
                    print("Reviewer:", result_2["reviewer"])
                    print("Comment:", result_2["reviewer_comment"])
                else:
                    print("Action Error:", resp_action_2.text)
            else:
                print("\n[STEP 4] Skipping Reject action (only 1 pending review in system).")
        else:
            # Let's write a mock insert in case database is empty so test runs successfully
            print("\nNo pending reviews found in database alerts sync. Creating a mock reviews table entry directly is recommended for manual/UI validation.")
    else:
        print("Fetch Error:", resp_list.text)
except Exception as e:
    print("Action workflow failed:", e)
