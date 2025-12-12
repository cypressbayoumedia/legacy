import logging
import os
from google.cloud import firestore
from google.cloud.firestore_v1.vector import Vector
from google.cloud.firestore_v1.base_vector_query import DistanceMeasure

logger = logging.getLogger(__name__)

def find_matches(user_vector: list, limit: int = 5, preferred_genders: list = None):
    """
    Finds nearest neighbors for the given vector using Firestore Vector Search.
    
    Args:
        user_vector (list): The embedding vector of the current user.
        limit (int): Number of matches to return.
        preferred_genders (list): List of genders to include (e.g. ['Female', 'Non-binary']). 
                                  If None or empty, assumes 'Everyone'.
        
    Returns:
        list: List of matching user profiles.
    """
    project_id = os.environ.get("GOOGLE_CLOUD_PROJECT")
    if not project_id:
        logger.warning("GOOGLE_CLOUD_PROJECT not set. Returning empty matches.")
        return []

    try:
        db = firestore.Client(project=project_id)
        collection_ref = db.collection("users")
        
        # Prepare Base Query
        # Note: Vector Search with filters requires a composite index. 
        # For Beta, we might hit index missing errors.
        # If preferred_genders is "Everyone" or empty, we don't filter.
        
        query = collection_ref
        
        if preferred_genders and "Everyone" not in preferred_genders:
             # Basic "in" filter for genders
             query = query.where("gender", "in", preferred_genders)

        if not user_vector:
            # Fallback: Return recent users if no vector provided
            docs = query.limit(limit).stream()
            matches = []
            for doc in docs:
                data = doc.to_dict()
                if data.get("processingStatus") == "completed":
                    data["_distance"] = 0.5 
                    matches.append(data)
            return matches

        # Create a vector object
        vector_query = query.find_nearest(
            vector_field="embedding_vector",
            query_vector=Vector(user_vector),
            distance_measure=DistanceMeasure.COSINE,
            limit=limit
        )

        # Execute query
        docs = vector_query.get()
        
        matches = []
        for doc in docs:
            matches.append(doc.to_dict())
            
        return matches

    except Exception as e:
        logger.error(f"Error executing vector search: {e}", exc_info=True)
        return []
