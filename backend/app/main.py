import os
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.api.v1.api import api_router
from app.db.session import engine
from app.db.mongo import mongo_db
from app.models.pg_models import Base

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger("threatlens")

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting ThreatLens AI Backend...")
    # Initialize PostgreSQL Tables (if not using alembic direct CLI)
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("PostgreSQL tables checked/created.")
    except Exception as e:
        logger.warning(f"Database table auto-creation skipped or failed: {e}")

    # Connect MongoDB
    mongo_db.connect()

    yield
    logger.info("Shutting down ThreatLens AI Backend...")

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan
)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/health")
@app.get(f"{settings.API_V1_STR}/health")
def health_check():
    return {
        "status": "online",
        "service": settings.PROJECT_NAME,
        "version": "1.0.0",
        "engines": {
            "static_analysis": "ready",
            "ml_classifier": "ready",
            "yara_matcher": "ready"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
