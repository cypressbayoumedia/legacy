import logging
import json
import re
import os
import zipfile
from io import BytesIO
from datetime import datetime
from google.cloud import storage
from google.cloud import firestore

logger = logging.getLogger(__name__)

# Basic Regex for PII (Phone numbers, Emails) - Phase 1 MVP
EMAIL_REGEX = r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+"
PHONE_REGEX = r"\+?[0-9]{10,15}" # Very basic international phone check

def sanitize_pii(text: str) -> str:
    """
    Scrubs emails and phone numbers from the text.
    """
    text = re.sub(EMAIL_REGEX, "[EMAIL_REDACTED]", text)
    text = re.sub(PHONE_REGEX, "[PHONE_REDACTED]", text)
    return text

def update_status(user_id, status, message=None, data=None):
    """
    Updates the processing status in Firestore.
    Optionally merges in additional data (like the profile).
    """
    try:
        project_id = os.environ.get("GOOGLE_CLOUD_PROJECT")
        if not project_id:
            logger.warning(f"Mock Firestore Update: User={user_id}, Status={status}, Message={message}")
            return

        db = firestore.Client(project=project_id)
        doc_ref = db.collection("users").document(user_id)
        
        update_data = {
            "processingStatus": status,
            "lastUpdated": firestore.SERVER_TIMESTAMP
        }
        if message:
            update_data["processingMessage"] = message
            
        if data:
            update_data.update(data)
            
        doc_ref.set(update_data, merge=True)
        logger.info(f"Updated Firestore status for {user_id}: {status}")

    except Exception as e:
        logger.error(f"Failed to update Firestore status: {e}")

def extract_timestamps(data):
    """
    recursively find timestamps in a json object
    """
    timestamps = []
    if isinstance(data, dict):
        for k, v in data.items():
            if isinstance(v, (dict, list)):
                timestamps.extend(extract_timestamps(v))
            elif isinstance(v, (int, float, str)):
                # Key matching logical
                lower_k = k.lower()
                is_timestamp_key = any(key_part in lower_k for key_part in ["timestamp", "date", "taken_at", "created"])
                
                if is_timestamp_key:
                     # Try to interpret v as a timestamp
                     try:
                         # 1. Check for numeric timestamp
                         if isinstance(v, (int, float)):
                             # heuristic: if > 3000000000, probably millis, else seconds
                             ts = v if v < 3000000000 else v / 1000.0
                             if ts > 0: # Filter out 0 or negative timestamps
                                timestamps.append(ts)
                                
                         # 2. Check for String ISO format OR numeric string
                         elif isinstance(v, str):
                             # Case A: Numeric string (e.g. "167234234")
                             if v.replace('.', '', 1).isdigit():
                                 try:
                                     val = float(v)
                                     # Same heuristic as above
                                     ts = val if val < 3000000000 else val / 1000.0
                                     if ts > 0:
                                        timestamps.append(ts)
                                 except:
                                     pass
                             # Case B: Standard ISO
                             else:
                                 try:
                                     dt = datetime.fromisoformat(v.replace("Z", "+00:00"))
                                     timestamps.append(dt.timestamp())
                                 except ValueError:
                                     pass
                     except:
                         pass
    elif isinstance(data, list):
        for item in data:
            timestamps.extend(extract_timestamps(item))
            
    return timestamps

def validate_archive_age(bucket_name, file_path):
    """
    Downloads ZIP from Storage and checks if it contains CONTENT older than 3 years.
    Returns True if valid, False otherwise.
    """
    try:
        # Check if running in mock mode (no GCP creds)
        if not os.environ.get("GOOGLE_CLOUD_PROJECT"):
            logger.warning("No GCP Project set, skipping validation (Mock Mode)")
            return True

        storage_client = storage.Client()
        bucket = storage_client.bucket(bucket_name)
        blob = bucket.blob(file_path)
        
        # Download as bytes
        zip_bytes = blob.download_as_bytes()
        
        oldest_content_timestamp = None
        current_year = datetime.now().year
        
        with zipfile.ZipFile(BytesIO(zip_bytes)) as z:
            for filename in z.namelist():
                if filename.lower().endswith(".json"):
                    try:
                        with z.open(filename) as f:
                            data = json.load(f)
                            found_timestamps = extract_timestamps(data)
                            
                            for ts in found_timestamps:
                                if oldest_content_timestamp is None or ts < oldest_content_timestamp:
                                    oldest_content_timestamp = ts
                    except Exception as json_err:
                        # process other files if one fails
                        logger.warning(f"Could not parse {filename}: {json_err}")
                        continue

        if oldest_content_timestamp:
            oldest_year = datetime.fromtimestamp(oldest_content_timestamp).year
            logger.info(f"Oldest content year found: {oldest_year}")
            
            if (current_year - oldest_year) >= 3:
                return True
            else:
                logger.warning(f"Validation Failed: Oldest content is from {oldest_year}, less than 3 years ago.")
                return False
        else:
             logger.warning("Validation Failed: No timestamped content found in archive.")
             return False

    except Exception as e:
        logger.error(f"Error validating archive: {e}")
        # Fail safe: don't process if validation errors out (unless it's a critical bug)
        return False

def extract_text_from_zip(bucket_name, file_path):
    """
    Downloads ZIP and extracts text content from key fields in JSON files.
    Returns size-limited string of aggregated text.
    """
    try:
        if not os.environ.get("GOOGLE_CLOUD_PROJECT"):
            return "Mock content for local testing."

        storage_client = storage.Client()
        bucket = storage_client.bucket(bucket_name)
        blob = bucket.blob(file_path)
        zip_bytes = blob.download_as_bytes()
        
        aggregated_text = []
        max_chars = 200000 # Limit for Gemini context
        current_chars = 0
        
        with zipfile.ZipFile(BytesIO(zip_bytes)) as z:
            for filename in z.namelist():
                lower_name = filename.lower()
                # Skip ads and other irrelevant folders
                if any(x in lower_name for x in ["ads_information", "ads_interests", "autofill_information"]):
                    continue

                if filename.lower().endswith(".json"):
                    try:
                        with z.open(filename) as f:
                            data = json.load(f)
                            # Recursively extract text strings from specific keys
                            texts = extract_strings_from_json(data)
                            for t in texts:
                                if current_chars + len(t) < max_chars:
                                    aggregated_text.append(t)
                                    current_chars += len(t)
                                else:
                                    break
                    except Exception as e:
                        logger.warning(f"Error reading {filename}: {e}")
                if current_chars >= max_chars:
                    break
                    
        return "\n".join(aggregated_text)
    except Exception as e:
        logger.error(f"Failed to extract text from zip: {e}")
        return ""

def extract_strings_from_json(data):
    """
    Recursively extract values from 'caption', 'text', 'bio', 'title', 'comment' keys.
    """
    strings = []
    if isinstance(data, dict):
        for k, v in data.items():
            if isinstance(v, (dict, list)):
                strings.extend(extract_strings_from_json(v))
            # Added 'description' (TikTok/YouTube), 'content' (Generic), 'body' (Emails/Posts), 'tweet' (Twitter/X)
            elif isinstance(v, str) and any(key in k.lower() for key in ['caption', 'text', 'bio', 'title', 'comment', 'message', 'description', 'content', 'body', 'tweet']):
                if len(v.strip()) > 3: # Ignore tiny strings
                    strings.append(v.strip())
    elif isinstance(data, list):
        for item in data:
            strings.extend(extract_strings_from_json(item))
    return strings

def extract_profile_picture(source_bucket: str, source_blob_name: str, user_id: str) -> str:
    """
    Scans the zip file for a profile picture and uploads it to 'profile_pics/{user_id}.jpg'.
    Returns the public URL of the uploaded image or None.
    """
    try:
        storage_client = storage.Client()
        source_bucket_obj = storage_client.bucket(source_bucket)
        source_blob = source_bucket_obj.blob(source_blob_name)
        zip_bytes = source_blob.download_as_bytes()

        profile_pic_data = None
        
        with zipfile.ZipFile(BytesIO(zip_bytes)) as z:
            namelist = z.namelist()
            
            # Priority 1: explicitly look for personal_information/profile_photo.jpg (observed in user structure)
            # or in media/profile/
            candidates = []
            
            for filename in namelist:
                lower = filename.lower()
                if not (lower.endswith(".jpg") or lower.endswith(".png") or lower.endswith(".jpeg")):
                    continue
                    
                # High priority: "personal_information" or "profile" in path
                if "personal_information" in lower and "profile" in lower:
                    candidates.append((10, filename))
                elif "media/profile" in lower:
                    candidates.append((8, filename))
                elif "profile" in lower or "avatar" in lower:
                    candidates.append((5, filename))
            
            # Sort by score descending
            candidates.sort(key=lambda x: x[0], reverse=True)
            
            if candidates:
                best_match = candidates[0][1]
                logger.info(f"Found profile pic match: {best_match} (score {candidates[0][0]})")
                profile_pic_data = z.read(best_match)
        
        if profile_pic_data:
            # Upload to profile_pics/{user_id}.jpg
            target_bucket_name = source_bucket # Use same bucket for simplicity
            target_blob_name = f"profile_pics/{user_id}.jpg"
            target_bucket = storage_client.bucket(target_bucket_name)
            target_blob = target_bucket.blob(target_blob_name)
            
            target_blob.upload_from_string(profile_pic_data, content_type="image/jpeg")
            
            # Make public (or just generate a URL if bucket is public/uniform access)
            # Trying to set public ACL
            try:
                target_blob.make_public()
            except Exception as e:
                logger.warning(f"Could not make blob public, bucket might enforce uniform access: {e}")
            
            return target_blob.public_url
    
    except Exception as e:
        logger.error(f"Error extracting profile picture: {e}")
        return None

def process_user_data(data: dict) -> dict:
    """
    Analyzes user data using Gemini to generate a psychographic bio and traits.
    Now handles CloudEvent data format (bucket/name) or direct payload.
    
    Args:
        data (dict): The input data, either a CloudEvent with bucket/name or a direct payload.
        
    Returns:
        dict: The structured profile including bio, traits, and vector.
    """
    user_id = data.get("userId", "unknown") # Default for direct payload
    raw_data = ""
    profile_pic_url = None

    bucket_name = data.get("bucket")
    file_path = data.get("name")
    
    if bucket_name and file_path:
        logger.info(f"Processing CloudEvent: gs://{bucket_name}/{file_path}")
        
        # FIX: Infinite Loop Prevention
        # If the file IS a profile pic we just uploaded, ignore it
        if file_path.startswith("profile_pics/") or "profile_pics" in file_path:
            logger.info("Ignoring profile_pics upload to prevent loop.")
            return {"status": "ignored", "reason": "profile_pics upload"}

        # FIX: Ignore non-zip files (prevents processing images as archives)
        if not file_path.lower().endswith(".zip"):
            logger.info(f"Ignoring non-zip file: {file_path}")
            return {"status": "ignored", "reason": "not a zip file"}

        # FIX: Extract userId from directory structure: uploads/USER_ID/timestamp_filename
        parts = file_path.split('/')
        if len(parts) >= 2:
            user_id = parts[-2]
        else:
             # Fallback if structure is unexpected
             filename = parts[-1]
             user_id = filename.split('_')[0]

        # FIX: Check if file still exists (handling Delete triggers)
        try:
            storage_client = storage.Client()
            blob = storage_client.bucket(bucket_name).blob(file_path)
            if not blob.exists():
                logger.info(f"File {file_path} no longer exists (likely deleted). Skipping.")
                return {"status": "ignored", "reason": "file deleted"}
        except Exception as e:
            logger.warning(f"Error checking file existence: {e}")
            # Continue and let validation fail if needed, or return? Safest to continue but be aware.
        
        # 1. Update Status: Processing
        update_status(user_id, "processing", "Validating archive...")

        # 2. Gatekeeper Validation
        if not validate_archive_age(bucket_name, file_path):
             reason = "Data does not meet the 3-year history requirement."
             update_status(user_id, "rejected", reason)
             return {"status": "rejected", "reason": reason}
        
        update_status(user_id, "processing", "Archive validated. Analyzing content...")
             
        # 3. Extract Real Content
        raw_data = extract_text_from_zip(bucket_name, file_path)
        if not raw_data:
            raw_data = "No readable text content found in archive."

        # 3.5 Extract Profile Picture
        profile_pic_url = extract_profile_picture(bucket_name, file_path, user_id)
        if profile_pic_url:
             logger.info(f"Profile picture set: {profile_pic_url}")
    
    else:
        # Legacy/Direct input path
        raw_data = data.get("data", "")
        user_id = data.get("userId", "unknown")

    logger.info(f"Processing data for user: {user_id}")
    
    # 4. Sanitize
    clean_text = sanitize_pii(raw_data)
    
    # 5. Call Gemini (Mocked if no project ID is set, or try/except)
    project_id = os.environ.get("GOOGLE_CLOUD_PROJECT")
    location = os.environ.get("GOOGLE_CLOUD_REGION", "us-central1")
    
    if not project_id:
        logger.warning("GOOGLE_CLOUD_PROJECT not set. Returning mock data.")
        return _get_mock_response(user_id)

    try:
        # Move imports here to avoid ModuleNotFoundError on local dev without SDK
        import vertexai
        from vertexai.generative_models import GenerativeModel, Part

        vertexai.init(project=project_id, location=location)
        # Using Gemini 2.5 Flash as per Technical Architecture (high token limit)
        model = GenerativeModel("gemini-2.5-flash")
        
        prompt = f"""
        You are a master storyteller and psychological profiler. Analyze the following social media data and craft a captivating profile that reads like poetry, not a clinical report.
        
        INSTRUCTIONS:
        - Write the bio like you're telling a story about someone fascinating you just met at a dim-lit bar
        - Use vivid imagery, metaphors, and emotional language
        - Avoid corporate speak, buzzwords, or anything that sounds "AI-generated"
        - Make it feel intimate, human, and real
        - Think: short story opening, song lyrics, or a perfectly crafted Instagram caption that stops the scroll
        - Capture contradictions and complexity - real people aren't one-dimensional
        
        EXAMPLES OF THE VIBE:
        - "Lives for Sunday mornings with black coffee and old vinyl. The type to debate philosophy at 2am but ghost you for a week when life gets loud."
        - "Equal parts chaos and calculated risk. Collects vintage cameras but never prints the photos. Laughs too loud in quiet spaces."
        - "Finds poetry in gas station receipts. Cries at dog videos but won't admit it. The friend who shows up at 3am, no questions asked."
        
        Data:
        {clean_text}
        
        Output must be JSON with the following schema:
        {{
            "generatedBio": "2-3 sentence narrative that captures their essence poetically and memorably",
            "keyTraits": ["Trait1", "Trait2", "Trait3", "Trait4", "Trait5"],
            "communicationStyle": "A short description of their style"
        }}
        """
        
        response = model.generate_content(prompt, generation_config={"response_mime_type": "application/json"})
        
        # Parse JSON from response
        try:
            profile_data = json.loads(response.text)
        except json.JSONDecodeError:
            logger.error("Failed to parse JSON from Gemini response")
            # Fallback or retry logic here
            profile_data = {
                "generatedBio": "Error generating profile.",
                "keyTraits": [],
                "communicationStyle": "Unknown"
            }

        # 6. Generate Embeddings
        try:
            from vertexai.language_models import TextEmbeddingModel
            embedding_model = TextEmbeddingModel.from_pretrained("text-embedding-004")
            
            # Create a rich text representation for the embedding
            # Combining bio and traits gives a better semantic signal than just bio
            text_to_embed = f"{profile_data.get('generatedBio', '')} Traits: {', '.join(profile_data.get('keyTraits', []))}"
            
            embeddings = embedding_model.get_embeddings([text_to_embed])
            embedding_vector = embeddings[0].values
        except Exception as e:
            logger.warning(f"Failed to generate real embeddings: {e}. Using mock vector.")
            embedding_vector = [0.1] * 768 # Fallback to mock

        # 7. Update Status: Completed (AND SAVE DATA)
        update_status(
            user_id, 
            "completed", 
            "Profile generated.",
            data={
                "aiProfile": profile_data,
                "embedding_vector": embedding_vector,
                "profilePictureUrl": profile_pic_url
            }
        )

        # 8. Cleanup: Delete the original uploaded archive
        if bucket_name and file_path:
             logger.info(f"Cleaning up upload: {file_path}")
             delete_blob(bucket_name, file_path)

        return {
            "userId": user_id,
            "aiProfile": profile_data,
            "embedding_vector": embedding_vector,
            "profilePictureUrl": profile_pic_url
        }

    except ImportError:
        logger.error("Vertex AI SDK not installed. Returning mock data.")
        return _get_mock_response(user_id)
    except Exception as e:
        logger.error(f"Error calling Vertex AI: {e}", exc_info=True)
        update_status(user_id, "failed", f"Error during AI processing: {str(e)}")
        return _get_mock_response(user_id)


def delete_blob(bucket_name, blob_name):
    """Deletes a blob from the bucket."""
    try:
        storage_client = storage.Client()
        bucket = storage_client.bucket(bucket_name)
        blob = bucket.blob(blob_name)
        blob.delete()
        logger.info(f"Deleted blob: {blob_name}")
    except Exception as e:
        logger.error(f"Failed to delete blob {blob_name}: {e}")

def _get_mock_response(user_id):
    return {
        "userId": user_id,
        "aiProfile": {
            "generatedBio": "A chaotic chef who hasn't missed a Sunday football game in 4 years. Loves high-stakes environments but values quiet mornings.",
            "keyTraits": ["Loyal", "Stubborn", "Foodie", "Chaotic", "Passionate"],
            "communicationStyle": "Direct and Verbose"
        },
        "embedding_vector": [0.1, 0.2, 0.3, 0.4, 0.5]
    }
