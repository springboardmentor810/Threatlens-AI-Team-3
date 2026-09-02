"""Password hashing and JWT authentication helpers."""

from datetime import datetime, timedelta, timezone

import bcrypt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from app.config import JWT_EXPIRE_MINUTES, JWT_SECRET_KEY
from app.database import get_db
from app.models import User

ALGORITHM = "HS256"
bearer_scheme = HTTPBearer()


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(password: str, stored_password: str) -> bool:
    """Verify bcrypt passwords; supports legacy plaintext records once."""
    if stored_password.startswith("$2"):
        return bcrypt.checkpw(password.encode("utf-8"), stored_password.encode("utf-8"))
    return password == stored_password


def create_access_token(user: User) -> str:
    if not JWT_SECRET_KEY:
        raise RuntimeError("JWT_SECRET_KEY must be configured in backend/.env")
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=JWT_EXPIRE_MINUTES)
    return jwt.encode(
        {"sub": str(user.user_id), "role": user.role, "exp": expires_at},
        JWT_SECRET_KEY,
        algorithm=ALGORITHM,
    )


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> User:
    try:
        if not JWT_SECRET_KEY:
            raise JWTError("JWT secret is not configured")
        payload = jwt.decode(credentials.credentials, JWT_SECRET_KEY, algorithms=[ALGORITHM])
        user_id = int(payload.get("sub", ""))
    except (JWTError, TypeError, ValueError):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired access token.")

    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User account no longer exists.")
    return user


def is_administrator(user: User) -> bool:
    return user.role.strip().lower() in {"administrator", "admin"}
