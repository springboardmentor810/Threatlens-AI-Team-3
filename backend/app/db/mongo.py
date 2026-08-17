from pymongo import MongoClient
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

class MongoDatabase:
    client: MongoClient = None
    db = None

    def connect(self):
        try:
            self.client = MongoClient(settings.MONGODB_URL, serverSelectionTimeoutMS=2000)
            self.db = self.client[settings.MONGODB_DB_NAME]
            # Ping to test connection
            self.client.admin.command('ping')
            logger.info("Connected to MongoDB successfully.")
        except Exception as e:
            logger.warning(f"MongoDB connection failed: {e}. In-memory MongoDB mock fallback will be used if needed.")
            self.db = None

    def get_collection(self, collection_name: str):
        if self.db is not None:
            return self.db[collection_name]
        return None

mongo_db = MongoDatabase()

# Simple In-Memory MongoDB Store for environment fallback
in_memory_mongo_store = {
    "analysis_reports": {},
    "threat_intel_feeds": {}
}

def save_mongo_report(report_data: dict) -> str:
    """Save analysis report to MongoDB or in-memory fallback, return ID string."""
    collection = mongo_db.get_collection("analysis_reports")
    if collection is not None:
        try:
            result = collection.insert_one(report_data)
            return str(result.inserted_id)
        except Exception as e:
            logger.error(f"Error inserting into Mongo: {e}")
    
    # In-memory fallback
    report_id = f"mem_rpt_{len(in_memory_mongo_store['analysis_reports']) + 1}"
    report_data["_id"] = report_id
    in_memory_mongo_store["analysis_reports"][report_id] = report_data
    return report_id

def get_mongo_report(report_id: str) -> dict:
    """Retrieve full analysis report by ID."""
    collection = mongo_db.get_collection("analysis_reports")
    if collection is not None:
        try:
            from bson.objectid import ObjectId
            if ObjectId.is_valid(report_id):
                doc = collection.find_one({"_id": ObjectId(report_id)})
                if doc:
                    doc["_id"] = str(doc["_id"])
                    return doc
        except Exception:
            pass
        doc = collection.find_one({"_id": report_id})
        if doc:
            doc["_id"] = str(doc["_id"])
            return doc

    return in_memory_mongo_store["analysis_reports"].get(report_id, {})
