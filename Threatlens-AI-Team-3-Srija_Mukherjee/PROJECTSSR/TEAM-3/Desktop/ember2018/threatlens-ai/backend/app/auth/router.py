from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.auth.schemas import UserRegister, UserLogin
from app.database import get_db
from app.models import User
from app.security import create_access_token, get_current_user, hash_password, verify_password


router = APIRouter(
    prefix="/api/auth",
    tags=["User Authentication & Role Management"]
)


@router.post("/register")
def register(
    user_data: UserRegister,
    db: Session = Depends(get_db)
):
    """Register a new user account."""

    # Check whether email already exists
    existing_email = (
        db.query(User)
        .filter(User.email == user_data.email)
        .first()
    )

    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Email '{user_data.email}' is already registered."
        )

    # Create new user
    new_user = User(
        name=user_data.username,
        email=user_data.email,
        password=hash_password(user_data.password),
        role=user_data.role
    )

    # Add user to PostgreSQL session
    db.add(new_user)

    try:
        db.commit()
        db.refresh(new_user)

    except Exception as e:
        db.rollback()
        print("Database error:", e)

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to create user."
        )

    return {
        "status": "success",
        "message": f"User '{new_user.name}' registered successfully.",
        "user": {
            "id": new_user.user_id,
            "username": new_user.name,
            "email": new_user.email,
            "role": new_user.role
        }
    }


@router.post("/login")
def login(
    login_data: UserLogin,
    db: Session = Depends(get_db)
):
    """Authenticate user and return access token."""

    user = (
        db.query(User)
        .filter(
            User.name == login_data.username
        )
        .first()
    )

    if not user or not verify_password(login_data.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password."
        )

    # Upgrade legacy plaintext records after a successful login.
    if not user.password.startswith("$2"):
        user.password = hash_password(login_data.password)
        db.commit()

    token = create_access_token(user)

    return {
        "status": "success",
        "access_token": token,
        "user": {
            "id": user.user_id,
            "username": user.name,
            "email": user.email,
            "role": user.role
        }
    }


@router.get("/me")
def profile(current_user: User = Depends(get_current_user)):
    """Get profile details of the logged-in user."""

    return {
        "id": current_user.user_id,
        "username": current_user.name,
        "email": current_user.email,
        "role": current_user.role
    }
