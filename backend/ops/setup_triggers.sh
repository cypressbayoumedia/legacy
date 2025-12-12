#!/bin/bash

# Configuration
PROJECT_ID="project-receipts-legacy"
SERVICE_NAME="legacy-engine"
REGION="us-central1"
BUCKET_NAME="${PROJECT_ID}.firebasestorage.app" # Default Firebase bucket
TRIGGER_NAME="legacy-upload-trigger"

echo "Setting up Eventarc Triggers for Project: $PROJECT_ID"

# 1. Enable Required Services
echo "Enabling Eventarc and Pub/Sub APIs..."
gcloud services enable eventarc.googleapis.com \
    pubsub.googleapis.com \
    run.googleapis.com \
    storage.googleapis.com \
    --project=$PROJECT_ID

# 2. Grant Permissions
# The storage service account needs to be able to publish events
STORAGE_SA="$(gcloud storage service-agent --project=$PROJECT_ID)"

echo "Granting Pub/Sub Publisher role to Storage Service Agent: $STORAGE_SA"
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$STORAGE_SA" \
    --role="roles/pubsub.publisher"

# 3. Create the Trigger
# This triggers on google.cloud.storage.object.v1.finalized
echo "Creating Eventarc Trigger: $TRIGGER_NAME"

# Get Project Number for default service account construction
PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format="value(projectNumber)")
COMPUTE_SA="${PROJECT_NUMBER}-compute@developer.gserviceaccount.com"

echo "Using Service Account: $COMPUTE_SA"

gcloud eventarc triggers create $TRIGGER_NAME \
    --location=$REGION \
    --destination-run-service=$SERVICE_NAME \
    --destination-run-region=$REGION \
    --event-filters="type=google.cloud.storage.object.v1.finalized" \
    --event-filters="bucket=$BUCKET_NAME" \
    --service-account=$COMPUTE_SA \
    --project=$PROJECT_ID

echo "Trigger setup complete!"
echo "Note: It may take a few minutes for the trigger to be active."
