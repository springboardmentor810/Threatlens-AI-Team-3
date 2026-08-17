import logging
import requests
from sqlalchemy.orm import Session
from app.core.config import settings
from app.models.pg_models import Alert, FileItem

logger = logging.getLogger(__name__)

def check_and_trigger_alert(db: Session, file_item: FileItem, risk_score: int, predicted_label: str, malware_family: str) -> Alert:
    """Evaluates risk score and creates an alert if threshold is exceeded."""
    threshold = settings.RISK_ALERT_THRESHOLD
    if risk_score < threshold:
        return None

    # Determine severity
    if risk_score >= 90:
        severity = "Critical"
    elif risk_score >= 75:
        severity = "High"
    else:
        severity = "Medium"

    title = f"Threat Detected: {predicted_label} ({malware_family}) in {file_item.original_name}"
    details = (
        f"File '{file_item.original_name}' (MD5: {file_item.md5_hash}) classified as {predicted_label} "
        f"[{malware_family}] with risk score {risk_score}/100. Immediate SOC investigation recommended."
    )

    alert = Alert(
        file_id=file_item.id,
        title=title,
        severity=severity,
        status="New",
        risk_score=risk_score,
        details=details
    )
    db.add(alert)
    db.commit()
    db.refresh(alert)

    # Trigger SMTP email simulation
    send_smtp_alert_notification(alert, file_item)

    # Trigger SIEM Webhook if configured
    if settings.SIEM_WEBHOOK_URL:
        dispatch_siem_webhook(alert, file_item)

    return alert

def send_smtp_alert_notification(alert: Alert, file_item: FileItem):
    logger.info(
        f"[SMTP NOTIFICATION SENT] To: soc-alerts@threatlens.ai | "
        f"Subject: [{alert.severity}] {alert.title} | File: {file_item.original_name} (SHA256: {file_item.sha256_hash})"
    )

def dispatch_siem_webhook(alert: Alert, file_item: FileItem):
    payload = {
        "event_type": "THREAT_ALERT",
        "alert_id": alert.id,
        "severity": alert.severity,
        "file_name": file_item.original_name,
        "md5": file_item.md5_hash,
        "sha256": file_item.sha256_hash,
        "risk_score": alert.risk_score,
        "timestamp": alert.created_at.isoformat()
    }
    try:
        response = requests.post(settings.SIEM_WEBHOOK_URL, json=payload, timeout=3)
        logger.info(f"[SIEM WEBHOOK DISPATCHED] Status: {response.status_code}")
    except Exception as e:
        logger.error(f"[SIEM WEBHOOK ERROR] Failed to push to SIEM: {e}")
