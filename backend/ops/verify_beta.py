import requests
import json
import time
import os
import sys

# Configuration
# Assuming local dev server or deployed URL.
# For local verification, we target the Cloud Run service or local proxy.
# Allow override via env var.
API_URL = os.environ.get("API_URL", "http://localhost:8080")
TEST_USER_ID = "beta_tester_001"

def print_result(step, success, message=""):
    icon = "✅" if success else "❌"
    print(f"{icon} {step}: {message}")
    if not success:
        sys.exit(1)

def main():
    print(f"🚀 Starting Beta Verification against {API_URL}...\n")

    # 1. Health Check
    try:
        r = requests.get(f"{API_URL}/")
        if r.status_code == 200:
            print_result("Health Check", True, "Service is reachable")
        else:
            print_result("Health Check", False, f"Status {r.status_code}")
    except Exception as e:
        print_result("Health Check", False, f"Connection failed: {e}")

    # 2. Simulate Data Upload & Processing Trigger
    # In a real scenario, Eventarc triggers this. We can manually invoke the /process endpoint.
    print(f"\n📝 Simulating data processing for user: {TEST_USER_ID}...")
    
    payload = {
        "userId": TEST_USER_ID,
        "data": "Caption: Spent the summer hiking the Appalachian trial. Text: I love nature and quiet moments. Bio: Adventurer at heart. Title: My Journey.",
        # Mocking a direct payload for simplicity, as we don't want to create real GCS objects in this script without auth
    }

    try:
        start_time = time.time()
        r = requests.post(f"{API_URL}/process", json=payload)
        
        if r.status_code == 200:
            resp_data = r.json()
            # Verify AI Profile structure
            ai_profile = resp_data.get("aiProfile", {})
            bio = ai_profile.get("generatedBio")
            traits = ai_profile.get("keyTraits")

            if bio and traits and len(traits) > 0:
                print_result("AI Profile Generation", True, f"Bio: {bio[:50]}...")
            else:
                print_result("AI Profile Generation", False, "Missing bio or traits in response")

            # Verify Vector
            vector = resp_data.get("embedding_vector")
            if vector and len(vector) > 0:
                print_result("Vector Embedding", True, f"Vector length: {len(vector)}")
            else:
                print_result("Vector Embedding", False, "Missing embedding vector")
            
            elapsed = time.time() - start_time
            print(f"   ⏱️  Processing time: {elapsed:.2f}s")
            
        else:
            print_result("Data Processing", False, f"Failed with status {r.status_code}: {r.text}")

    except Exception as e:
        print_result("Data Processing", False, f"Error: {e}")

    # 3. Simulate Matching
    print("\n💞 Verifying Matching Engine...")
    
    # We use the vector from the previous step, or a mock one if that failed (but we exited so we assume success)
    # Re-using the logic from the response to be safe, or just mocking a vector for the query test
    test_vector = [0.1] * 768 

    try:
        match_payload = {"vector": test_vector}
        r = requests.post(f"{API_URL}/match", json=match_payload)
        
        if r.status_code == 200:
            matches = r.json().get("matches", [])
            print_result("Match Query", True, f"Found {len(matches)} matches")
            
            if len(matches) > 0:
                first_match = matches[0]
                print(f"   👤 Top Match: {first_match.get('aiProfile', {}).get('generatedBio', 'Unknown')[:50]}...")
        else:
            print_result("Match Query", False, f"Failed status {r.status_code}")

    except Exception as e:
         print_result("Match Query", False, f"Error: {e}")


    print("\n✨ Beta Verification Complete! System is GO for launch.")

if __name__ == "__main__":
    main()
