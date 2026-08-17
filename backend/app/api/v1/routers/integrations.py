from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.pg_models import ThreatIntelFeed, PlatformSetting, User, AuditLog
from app.models.schemas import ThreatIntelFeedResponse, PlatformSettingResponse, PlatformSettingUpdate
from app.services.virustotal import query_virustotal
from app.services.alerting import dispatch_siem_webhook
from app.core.rbac import require_admin, require_analyst_or_above, get_current_user

router = APIRouter(prefix="/integrations", tags=["Integrations & Threat Intel"])

@router.get("/virustotal/{file_hash}")
def virustotal_lookup(
    file_hash: str,
    current_user: User = Depends(require_analyst_or_above)
):
    return query_virustotal(file_hash)

@router.get("/threat-intel", response_model=List[ThreatIntelFeedResponse])
@router.get("/intel-feeds")
def list_threat_intel_feeds(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_analyst_or_above)
):
    return db.query(ThreatIntelFeed).order_by(ThreatIntelFeed.created_at.desc()).all()

@router.post("/threat-intel", response_model=ThreatIntelFeedResponse)
@router.post("/intel-feeds")
def add_threat_intel_indicator(
    feed_name: str,
    indicator_type: str,
    indicator_value: str,
    threat_category: str,
    source: str = "Analyst Submission",
    db: Session = Depends(get_db),
    current_user: User = Depends(require_analyst_or_above)
):
    item = ThreatIntelFeed(
        feed_name=feed_name,
        indicator_type=indicator_type,
        indicator_value=indicator_value,
        threat_category=threat_category,
        source=source
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return item

@router.get("/settings", response_model=List[PlatformSettingResponse])
def list_settings(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    return db.query(PlatformSetting).all()

@router.put("/settings/{setting_key}", response_model=PlatformSettingResponse)
def update_setting(
    setting_key: str,
    setting_in: PlatformSettingUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    setting = db.query(PlatformSetting).filter(PlatformSetting.setting_key == setting_key).first()
    if not setting:
        raise HTTPException(status_code=404, detail="Platform setting key not found.")
    
    setting.setting_value = setting_in.setting_value
    db.commit()
    db.refresh(setting)
    return setting

@router.post("/siem-test")
def test_siem_webhook(
    current_user: User = Depends(require_admin)
):
    class MockFile:
        original_name = "test_payload_sample.exe"
        md5_hash = "d41d8cd98f00b204e9800998ecf8427e"
        sha256_hash = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"

    class MockAlert:
        id = 999
        severity = "High"
        risk_score = 85
        created_at = type("DT", (), {"isoformat": lambda self: "2026-08-05T09:00:00Z"})()

    dispatch_siem_webhook(MockAlert(), MockFile())
    return {"message": "Test SIEM Webhook payload dispatched successfully."}

from pydantic import BaseModel
from app.services.threat_intel_stream import threat_intel_stream

class WatchlistAddRequest(BaseModel):
    indicator: str
    indicator_type: str = "IPv4 Address"
    threat_family: str = "Suspicious Indicator"
    severity: str = "HIGH"

@router.get("/live-feeds")
def get_live_threat_feeds():
    """
    Returns live auto-refreshing global threat intelligence feeds.
    """
    return threat_intel_stream.get_live_feeds()

@router.get("/watchlist")
def get_ioc_watchlist():
    """
    Returns active automated IOC watchlist.
    """
    return threat_intel_stream.get_watchlist()

@router.post("/watchlist")
def add_ioc_watchlist_item(req: WatchlistAddRequest):
    """
    Adds an indicator to the automated background watcher.
    """
    return threat_intel_stream.add_to_watchlist(
        indicator=req.indicator,
        indicator_type=req.indicator_type,
        threat_family=req.threat_family,
        severity=req.severity
    )

@router.delete("/watchlist/{item_id}")
def remove_ioc_watchlist_item(item_id: str):
    """
    Removes an item from the automated background watcher.
    """
    success = threat_intel_stream.remove_from_watchlist(item_id)
    return {"success": success, "item_id": item_id}

