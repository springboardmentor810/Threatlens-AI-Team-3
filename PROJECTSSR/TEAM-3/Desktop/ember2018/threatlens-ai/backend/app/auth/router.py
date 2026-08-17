import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.auth.schemas import UserRegister, UserLogin
from app.database import get_db
from app.models import User


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
        password=user_data.password,
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

    # Your database uses 'name', not 'username'
    user = (
        db.query(User)
        .filter(
            User.name == login_data.username,
            User.password == login_data.password
        )
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password."
        )

    # Temporary token generation
    token = f"token_{user.name}_{uuid.uuid4().hex[:8]}"

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
def profile(
    username: str = "analyst_demo",
    db: Session = Depends(get_db)
):
    """Get profile details of the logged-in user."""

    user = (
        db.query(User)
        .filter(User.name == username)
        .first()
    )

    if not user:
        return {
            "id": 1,
            "username": username,
            "email": f"{username}@threatlens.ai",
            "role": "Security Analyst"
        }

    return {
        "id": user.user_id,
        "username": user.name,
        "email": user.email,
        "role": user.role
    }