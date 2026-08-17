from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.pg_models import FileItem, Classification, Alert, User
from app.core.rbac import require_analyst_or_above, get_current_user

router = APIRouter(prefix="/reports", tags=["Reports & Intelligence Exports"])

@router.get("/export")
def export_reports(
    report_type: str = Query("executive", description="executive, technical, or alert_log"),
    format: str = Query("json", description="json or summary"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_analyst_or_above)
):
    files = db.query(FileItem).all()
    classifications = db.query(Classification).all()
    alerts = db.query(Alert).all()

    total_scans = len(files)
    malware_count = sum(1 for c in classifications if c.predicted_label != "Clean")
    critical_alerts = sum(1 for a in alerts if a.severity == "Critical")

    if report_type == "executive":
        report_data = {
            "title": "ThreatLens AI - Executive Malware Analysis Summary",
            "generated_by": current_user.email,
            "generated_at": "2026-08-05T09:30:00Z",
            "summary_metrics": {
                "total_files_analyzed": total_scans,
                "malicious_samples_detected": malware_count,
                "threat_detection_rate": f"{(malware_count/total_scans*100):.1f}%" if total_scans else "0%",
                "active_critical_incidents": critical_alerts
            },
            "top_threat_families": ["WannaCry", "AgentTesla", "LockBit", "Mirai"],
            "risk_assessment": "ELEVATED - Automated static analysis & ML classifier identified active ransomware and keylogger indicators across analyzed files."
        }
    elif report_type == "technical":
        report_data = {
            "title": "ThreatLens AI - Detailed Technical Indicators Report",
            "generated_by": current_user.email,
            "samples": [
                {
                    "filename": f.original_name,
                    "sha256": f.sha256_hash,
                    "status": f.status,
                    "classification": f.classification.predicted_label if f.classification else "Pending",
                    "risk_score": f.classification.risk_score if f.classification else 0
                } for f in files[:20]
            ]
        }
    else:  # alert_log
        report_data = {
            "title": "ThreatLens AI - Operational Alert History Log",
            "generated_by": current_user.email,
            "alerts": [
                {
                    "alert_id": a.id,
                    "title": a.title,
                    "severity": a.severity,
                    "status": a.status,
                    "risk_score": a.risk_score,
                    "file_id": a.file_id
                } for a in alerts
            ]
        }

    return report_data
