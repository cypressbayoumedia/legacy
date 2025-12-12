import os
import time
from google.cloud import firestore

# Configuration
PROJECT_ID = "project-receipts-legacy"
COLLECTION_NAME = "users"

def verify_launch():
    print(f"Checking Firestore for recent user uploads in '{COLLECTION_NAME}'...")
    
    # Initialize Firestore Client
    db = firestore.Client(project=PROJECT_ID)
    
    # Query for users added in the last 24 hours (mock query for now, just listing all)
    docs = db.collection(COLLECTION_NAME).stream()
    
    count = 0
    for doc in docs:
        count += 1
        user_data = doc.to_dict()
        user_id = doc.id
        # Check for bio presence
        bio = user_data.get("psychographic_bio", "N/A")
        
        print(f"User: {user_id}")
        print(f"  - Status: {'Processed' if bio != 'N/A' else 'Pending'}")
        if bio != "N/A":
            print(f"  - Bio: {bio[:50]}...")
            
    if count == 0:
        print("No users found. Waiting for first upload...")

if __name__ == "__main__":
    if not os.environ.get("GOOGLE_APPLICATION_CREDENTIALS"):
        print("Warning: GOOGLE_APPLICATION_CREDENTIALS not set. Assuming local auth or mock.")
    verify_launch()
