from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.pg_models import User, Role, PlatformSetting, AuditLog
from app.models.schemas import UserResponse, UserCreate, UserUpdate, RoleResponse, PlatformSettingResponse, PlatformSettingUpdate
from app.core.security import get_password_hash
from app.core.rbac import require_admin, get_current_user

router = APIRouter(prefix="/users", tags=["Users"])

@router.get("/", response_model=List[UserResponse])
def list_users(db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    return db.query(User).all()

@router.get("/roles", response_model=List[RoleResponse])
def list_roles(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Role).all()

@router.get("/settings", response_model=List[PlatformSettingResponse])
def list_settings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
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

@router.post("/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_user(user_in: UserCreate, db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    existing = db.query(User).filter(User.email == user_in.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="User email already exists.")
    
    role = db.query(Role).filter(Role.id == user_in.role_id).first()
    if not role:
        raise HTTPException(status_code=400, detail="Invalid role_id.")

    user = User(
        email=user_in.email,
        password_hash=get_password_hash(user_in.password),
        full_name=user_in.full_name,
        role_id=user_in.role_id,
        is_active=True
    )
    db.add(user)
    
    # Audit log
    audit = AuditLog(
        user_id=current_user.id,
        action="USER_CREATED",
        resource=f"User:{user_in.email}",
        details=f"Created user with role {role.name}"
    )
    db.add(audit)

    db.commit()
    db.refresh(user)
    return user

@router.put("/{user_id}", response_model=UserResponse)
def update_user(user_id: int, user_in: UserUpdate, db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    if user_in.full_name is not None:
        user.full_name = user_in.full_name
    if user_in.email is not None:
        user.email = user_in.email
    if user_in.role_id is not None:
        user.role_id = user_in.role_id
    if user_in.is_active is not None:
        user.is_active = user_in.is_active

    db.commit()
    db.refresh(user)
    return user

@router.delete("/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot delete your own admin account.")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    
    db.delete(user)
    db.commit()
    return {"message": "User deleted successfully."}
