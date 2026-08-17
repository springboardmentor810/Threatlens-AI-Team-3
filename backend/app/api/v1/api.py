from fastapi import APIRouter
from app.api.v1.routers import (
    auth,
    users,
    files,
    analysis,
    classification,
    alerts,
    dashboard,
    integrations,
    reports,
    ai
)

api_router = APIRouter()

api_router.include_router(auth.router)
api_router.include_router(users.router)
api_router.include_router(files.router)
api_router.include_router(analysis.router)
api_router.include_router(classification.router)
api_router.include_router(alerts.router)
api_router.include_router(dashboard.router)
api_router.include_router(integrations.router)
api_router.include_router(reports.router)
api_router.include_router(ai.router)

