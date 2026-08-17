import os
import hashlib
from typing import List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.redis import redis_client
from app.models.pg_models import FileItem, User, AuditLog
from app.models.schemas import FileItemResponse
from app.core.config import settings
from app.core.rbac import require_analyst_or_above, require_researcher_or_above

router = APIRouter(prefix="/files", tags=["Files"])

@router.post("/upload", response_model=FileItemResponse, status_code=status.HTTP_201_CREATED)
async def upload_file(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_analyst_or_above)
):
    # Rate limiting check per user: max 20 uploads per minute
    rate_key = f"ratelimit:upload:{current_user.id}"
    attempts = redis_client.incr(rate_key, ex=60)
    if attempts > 20:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Rate limit exceeded. Maximum 20 file uploads per minute."
        )

    file_bytes = await file.read()
    if len(file_bytes) == 0:
        raise HTTPException(status_code=400, detail="Empty file uploaded.")
    if len(file_bytes) > 50 * 1024 * 1024:  # 50MB limit
        raise HTTPException(status_code=400, detail="File size exceeds maximum limit of 50MB.")

    md5_hash = hashlib.md5(file_bytes).hexdigest()
    sha256_hash = hashlib.sha256(file_bytes).hexdigest()

    # Create upload directory
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    safe_filename = f"{sha256_hash[:16]}_{file.filename}"
    file_path = os.path.join(settings.UPLOAD_DIR, safe_filename)

    with open(file_path, "wb") as f:
        f.write(file_bytes)

    # Detect basic MIME/type
    content_type = file.content_type or "application/octet-stream"

    db_file = FileItem(
        filename=safe_filename,
        original_name=file.filename,
        file_size=len(file_bytes),
        file_type=content_type,
        md5_hash=md5_hash,
        sha256_hash=sha256_hash,
        upload_user_id=current_user.id,
        status="uploaded"
    )
    db.add(db_file)

    # Audit log
    audit = AuditLog(
        user_id=current_user.id,
        action="FILE_UPLOAD",
        resource=f"File:{file.filename}",
        details=f"MD5: {md5_hash}, SHA256: {sha256_hash}"
    )
    db.add(audit)

    db.commit()
    db.refresh(db_file)
    return db_file

@router.get("/", response_model=List[FileItemResponse])
def list_files(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_analyst_or_above)
):
    return db.query(FileItem).order_by(FileItem.created_at.desc()).offset(skip).limit(limit).all()

@router.get("/{file_id}", response_model=FileItemResponse)
def get_file(
    file_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_analyst_or_above)
):
    file_item = db.query(FileItem).filter(FileItem.id == file_id).first()
    if not file_item:
        raise HTTPException(status_code=404, detail="File not found.")
    return file_item
