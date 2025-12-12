import os
import logging
from flask import Flask, request, jsonify
from processor import process_user_data

app = Flask(__name__)
from flask_cors import CORS
CORS(app)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@app.route("/", methods=["GET", "POST"])
def health_check():
    if request.method == "POST":
        return process_data()
    return jsonify({"status": "ok", "service": "legacy-engine"}), 200

@app.route("/process", methods=["POST"])
def process_data():
    """
    Endpoint to process user data.
    Handles both direct JSON and Eventarc CloudEvents.
    """
    try:
        # Check for CloudEvent headers
        ce_type = request.headers.get('ce-type')
        
        if ce_type:
            # It's a CloudEvent!
            # For Storage events, the body IS the GCS object metadata
            content = request.json
            logger.info(f"Received CloudEvent of type: {ce_type}")
        else:
            # Direct invocation
            content = request.json

        if not content:
            return jsonify({"error": "No JSON payload provided"}), 400
        
        result = process_user_data(content)
        return jsonify(result), 200

    except Exception as e:
        logger.error(f"Error processing request: {e}", exc_info=True)
        return jsonify({"error": str(e)}), 500

@app.route("/match", methods=["POST"])
def get_matches():
    """
    Endpoint to find matches for a user.
    Expected JSON payload:
    {
        "vector": [0.1, 0.2, ...]
    }
    """
    try:
        from matcher import find_matches
        content = request.json
        vector = content.get("vector")
        preferred_genders = content.get("preferred_genders") # Expecting a list or None
        
        # Allow empty vector for "browse" mode
        # if not vector:
        #    return jsonify({"error": "No vector provided"}), 400
            
        matches = find_matches(vector, preferred_genders=preferred_genders)
        return jsonify({"matches": matches}), 200
        
    except Exception as e:
        logger.error(f"Error finding matches: {e}", exc_info=True)
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8080))
    app.run(host="0.0.0.0", port=port)
