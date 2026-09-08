from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config.database import Base, engine

from models.user import User
from models.file import UploadedFile
from models.report import MalwareReport
from models.alert import Alert

from routes.analysis import router as analysis_router


app = FastAPI(
    title="ThreatLens AI",
    description="Malware Classification & Threat Detection System",
    version="1.0.0"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


Base.metadata.create_all(bind=engine)


app.include_router(analysis_router)


@app.get("/")
def home():
    return {
        "message": "ThreatLens AI Backend Running"
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "ThreatLens AI API"
    }