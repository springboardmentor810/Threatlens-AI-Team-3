from pydantic import BaseModel, Field
from typing import Optional

class UserRegister(BaseModel):
    username: str
    email: str
    password: str = Field(min_length=8, max_length=72)
    role: str = "Security Analyst"  # Security Analyst, SOC Team Member, Administrator, Researcher
    full_name: Optional[str] = ""

class UserLogin(BaseModel):
    username: str
    password: str = Field(max_length=72)

class UserProfile(BaseModel):
    id: Optional[int] = None
    username: str
    email: str
    role: str
    full_name: Optional[str] = ""
