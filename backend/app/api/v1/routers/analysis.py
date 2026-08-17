import os
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.mongo import save_mongo_report, get_mongo_report
from app.models.pg_models import FileItem, AnalysisSummary, Classification, User, AuditLog
from app.models.schemas import FileAnalysisDetailResponse, AnalysisSummaryResponse
from app.services.static_analysis import run_static_analysis
from app.services.ml_engine import ml_engine
from app.services.alerting import check_and_trigger_alert
from app.services.virustotal import query_virustotal
from app.core.config import settings
from app.core.rbac import require_analyst_or_above, get_current_user

router = APIRouter(prefix="/analysis", tags=["Analysis Engine"])

@router.post("/scan/{file_id}", response_model=FileAnalysisDetailResponse)
@router.post("/static/{file_id}")
def trigger_analysis_scan(
    file_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_analyst_or_above)
):
    file_item = db.query(FileItem).filter(FileItem.id == file_id).first()
    if not file_item:
        raise HTTPException(status_code=404, detail="File item not found.")

    file_path = os.path.join(settings.UPLOAD_DIR, file_item.filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Uploaded file content missing from disk.")

    file_item.status = "analyzing"
    db.commit()

    with open(file_path, "rb") as f:
        file_bytes = f.read()

    # 1. Run Static Analysis
    static_report = run_static_analysis(file_bytes, file_item.original_name, settings.YARA_RULES_DIR)

    # 2. Save full detail to MongoDB
    mongo_doc = {
        "file_id": file_item.id,
        "md5": file_item.md5_hash,
        "sha256": file_item.sha256_hash,
        "static_analysis": static_report,
        "uploaded_by": current_user.email
    }
    mongo_report_id = save_mongo_report(mongo_doc)

    # 3. Create or Update PostgreSQL AnalysisSummary
    pe_header = static_report.get("pe_header", {})
    summary = db.query(AnalysisSummary).filter(AnalysisSummary.file_id == file_id).first()
    if not summary:
        summary = AnalysisSummary(file_id=file_id, mongo_report_id=mongo_report_id)
        db.add(summary)

    summary.mongo_report_id = mongo_report_id
    summary.pe_sections_count = len(pe_header.get("sections", []))
    summary.suspicious_imports_count = len(pe_header.get("suspicious_imports", []))
    summary.urls_found_count = len(static_report.get("iocs", {}).get("urls", []))
    summary.ips_found_count = len(static_report.get("iocs", {}).get("ips", []))
    summary.yara_matches_count = len(static_report.get("yara_matches", []))

    # 4. ML Classification & Risk Scoring
    pred_label, family, confidence, exec_time = ml_engine.predict(static_report)
    risk_score = ml_engine.calculate_risk_score(static_report, pred_label, confidence)

    classification = db.query(Classification).filter(Classification.file_id == file_id).first()
    if not classification:
        classification = Classification(file_id=file_id, predicted_label=pred_label, malware_family=family, confidence_score=confidence, risk_score=risk_score)
        db.add(classification)

    classification.predicted_label = pred_label
    classification.malware_family = family
    classification.confidence_score = confidence
    classification.risk_score = risk_score
    classification.execution_time_ms = exec_time

    file_item.status = "analyzed"

    # 5. Check Risk & Trigger Alerts if needed
    check_and_trigger_alert(db, file_item, risk_score, pred_label, family)

    # Audit log
    audit = AuditLog(
        user_id=current_user.id,
        action="SCAN_COMPLETED",
        resource=f"File:{file_item.original_name}",
        details=f"Classified as {pred_label} ({family}), Risk Score: {risk_score}"
    )
    db.add(audit)

    db.commit()
    db.refresh(file_item)
    db.refresh(summary)
    db.refresh(classification)

    vt_result = query_virustotal(file_item.sha256_hash)

    yara_rule_names = [m["rule"] for m in static_report.get("yara_matches", [])]

    return {
        "file": file_item,
        "summary": summary,
        "classification": classification,
        "mongo_detail": mongo_doc,
        "virustotal": vt_result,
        "risk_score": risk_score,
        "yara_matches": yara_rule_names,
        "entropy": static_report.get("entropy", 6.5)
    }

@router.get("/report/{file_id}", response_model=FileAnalysisDetailResponse)
def get_full_analysis_report(
    file_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_analyst_or_above)
):
    file_item = db.query(FileItem).filter(FileItem.id == file_id).first()
    if not file_item:
        raise HTTPException(status_code=404, detail="File not found.")

    summary = db.query(AnalysisSummary).filter(AnalysisSummary.file_id == file_id).first()
    classification = db.query(Classification).filter(Classification.file_id == file_id).first()
    
    mongo_detail = {}
    if summary and summary.mongo_report_id:
        mongo_detail = get_mongo_report(summary.mongo_report_id)

    vt_result = query_virustotal(file_item.sha256_hash)

    return {
        "file": file_item,
        "summary": summary,
        "classification": classification,
        "mongo_detail": mongo_detail,
        "virustotal": vt_result
    }

from pydantic import BaseModel
from app.services.multimodal_analysis import (
    analyze_audio_threat,
    analyze_video_threat,
    analyze_website_threat,
    analyze_document_or_script,
    get_demo_samples_library
)

class WebsiteScanRequest(BaseModel):
    url: str

@router.get("/demo-samples")
def get_demo_samples():
    """
    Returns pre-configured rich multi-modal demo samples (Audio, Video, Website, PDF, Ransomware).
    """
    return get_demo_samples_library()

@router.post("/website/scan")
def scan_website_endpoint(req: WebsiteScanRequest):
    """
    Live Website / URL DOM Phishing & Cyber Threat Scanner.
    """
    if not req.url:
        raise HTTPException(status_code=400, detail="URL is required.")
    return analyze_website_threat(req.url)

@router.post("/multimodal/scan/{file_id}")
def scan_multimodal_file(file_id: int, db: Session = Depends(get_db)):
    """
    Analyzes multi-modal files (Audio, Video, PDF, Scripts) for hidden payloads, deepfakes, and exploits.
    """
    file_item = db.query(FileItem).filter(FileItem.id == file_id).first()
    if not file_item:
        raise HTTPException(status_code=404, detail="File not found.")

    file_path = os.path.join(settings.UPLOAD_DIR, file_item.filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Uploaded file missing.")

    with open(file_path, "rb") as f:
        file_bytes = f.read()

    filename = file_item.original_name.lower()
    if any(filename.endswith(ext) for ext in [".wav", ".mp3", ".ogg", ".flac", ".m4a"]):
        return analyze_audio_threat(file_bytes, file_item.original_name)
    elif any(filename.endswith(ext) for ext in [".mp4", ".mkv", ".avi", ".webm", ".mov"]):
        return analyze_video_threat(file_bytes, file_item.original_name)
    elif any(filename.endswith(ext) for ext in [".pdf", ".ps1", ".sh", ".bat", ".vbs", ".php", ".py"]):
        return analyze_document_or_script(file_bytes, file_item.original_name)
    else:
        # Fallback to standard static analysis
        return run_static_analysis(file_bytes, file_item.original_name, settings.YARA_RULES_DIR)

