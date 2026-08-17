from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.pg_models import FileItem, Classification, User
from app.models.schemas import ClassificationResponse
from app.db.mongo import get_mongo_report
from app.services.ml_engine import ml_engine
from app.core.rbac import require_analyst_or_above, get_current_user

router = APIRouter(prefix="/classification", tags=["Classification Engine"])

@router.get("/{file_id}", response_model=ClassificationResponse)
def get_classification(
    file_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_analyst_or_above)
):
    classification = db.query(Classification).filter(Classification.file_id == file_id).first()
    if not classification:
        raise HTTPException(status_code=404, detail="Classification result not found for this file.")
    return classification

@router.post("/reclassify/{file_id}")
@router.post("/predict/{file_id}")
def reclassify_file(
    file_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_analyst_or_above)
):
    file_item = db.query(FileItem).filter(FileItem.id == file_id).first()
    if not file_item or not file_item.summary:
        raise HTTPException(status_code=400, detail="File has not undergone static analysis scan yet.")

    mongo_report = get_mongo_report(file_item.summary.mongo_report_id)
    static_report = mongo_report.get("static_analysis", {})
    if not static_report:
        raise HTTPException(status_code=400, detail="Static analysis report detail missing.")

    pred_label, family, confidence, exec_time = ml_engine.predict(static_report)
    risk_score = ml_engine.calculate_risk_score(static_report, pred_label, confidence)

    classification = db.query(Classification).filter(Classification.file_id == file_id).first()
    if not classification:
        classification = Classification(file_id=file_id)
        db.add(classification)

    classification.predicted_label = pred_label
    classification.malware_family = family
    classification.confidence_score = confidence
    classification.risk_score = risk_score
    classification.execution_time_ms = exec_time

    db.commit()
    db.refresh(classification)
    return {
        "id": classification.id,
        "file_id": classification.file_id,
        "predicted_label": classification.predicted_label,
        "prediction": f"{classification.predicted_label}.{classification.malware_family}",
        "malware_family": classification.malware_family,
        "confidence_score": classification.confidence_score,
        "confidence": classification.confidence_score,
        "risk_score": classification.risk_score,
        "execution_time_ms": classification.execution_time_ms
    }
