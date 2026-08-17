from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.pg_models import Alert, FileItem, User, AuditLog
from app.models.schemas import AlertResponse, AlertUpdate
from app.core.rbac import require_soc_or_above, get_current_user

router = APIRouter(prefix="/alerts", tags=["Alerting & Incidents"])

@router.get("/", response_model=List[AlertResponse])
def list_alerts(
    status: Optional[str] = Query(None),
    severity: Optional[str] = Query(None),
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_soc_or_above)
):
    query = db.query(Alert)
    if status:
        query = query.filter(Alert.status == status)
    if severity:
        query = query.filter(Alert.severity == severity)
    
    alerts = query.order_by(Alert.created_at.desc()).offset(skip).limit(limit).all()

    # Format response with file name and assignee name
    result = []
    for a in alerts:
        res_dict = AlertResponse.from_orm(a)
        if a.file:
            res_dict.file_name = a.file.original_name
        if a.assignee:
            res_dict.assignee_name = a.assignee.full_name
        result.append(res_dict)
    return result

@router.get("/{alert_id}", response_model=AlertResponse)
def get_alert(
    alert_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_soc_or_above)
):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found.")

    res_dict = AlertResponse.from_orm(alert)
    if alert.file:
        res_dict.file_name = alert.file.original_name
    if alert.assignee:
        res_dict.assignee_name = alert.assignee.full_name
    return res_dict

@router.patch("/{alert_id}", response_model=AlertResponse)
def update_alert(
    alert_id: int,
    alert_in: AlertUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_soc_or_above)
):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found.")

    if alert_in.status is not None:
        alert.status = alert_in.status
    if alert_in.assigned_to_user_id is not None:
        alert.assigned_to_user_id = alert_in.assigned_to_user_id

    # Audit log
    audit = AuditLog(
        user_id=current_user.id,
        action="ALERT_UPDATED",
        resource=f"Alert:{alert_id}",
        details=f"Status set to {alert.status}, assigned to user {alert.assigned_to_user_id}"
    )
    db.add(audit)

    db.commit()
    db.refresh(alert)

    res_dict = AlertResponse.from_orm(alert)
    if alert.file:
        res_dict.file_name = alert.file.original_name
    if alert.assignee:
        res_dict.assignee_name = alert.assignee.full_name
    return res_dict
