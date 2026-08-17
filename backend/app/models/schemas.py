from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, EmailStr

# Auth Schemas
class Token(BaseModel):
    access_token: str
    token_type: str
    user: "UserResponse"

class TokenData(BaseModel):
    user_id: Optional[int] = None
    role: Optional[str] = None

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    role_name: Optional[str] = "Security Analyst"

# User Schemas
class RoleResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None

    class Config:
        from_attributes = True

class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    role: RoleResponse
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    role_id: int

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    role_id: Optional[int] = None
    is_active: Optional[bool] = None

# File & Analysis Schemas
class FileItemResponse(BaseModel):
    id: int
    filename: str
    original_name: str
    file_size: int
    file_type: str
    md5_hash: str
    sha256_hash: str
    upload_user_id: int
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

class AnalysisSummaryResponse(BaseModel):
    id: int
    file_id: int
    mongo_report_id: str
    pe_sections_count: int
    suspicious_imports_count: int
    urls_found_count: int
    ips_found_count: int
    yara_matches_count: int
    created_at: datetime

    class Config:
        from_attributes = True

class ClassificationResponse(BaseModel):
    id: int
    file_id: int
    predicted_label: str
    malware_family: str
    confidence_score: float
    risk_score: int
    execution_time_ms: float
    model_version: str
    created_at: datetime

    class Config:
        from_attributes = True

# Full Scan Result Schema
class FileAnalysisDetailResponse(BaseModel):
    file: FileItemResponse
    summary: Optional[AnalysisSummaryResponse] = None
    classification: Optional[ClassificationResponse] = None
    mongo_detail: Optional[Dict[str, Any]] = None
    virustotal: Optional[Dict[str, Any]] = None

# Alert Schemas
class AlertResponse(BaseModel):
    id: int
    file_id: int
    title: str
    severity: str
    status: str
    risk_score: int
    details: Optional[str] = None
    assigned_to_user_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime
    file_name: Optional[str] = None
    assignee_name: Optional[str] = None

    class Config:
        from_attributes = True

class AlertUpdate(BaseModel):
    status: Optional[str] = None
    assigned_to_user_id: Optional[int] = None

# Dashboard Aggregations
class DashboardStatsResponse(BaseModel):
    total_files_scanned: int
    total_malware_detected: int
    total_alerts: int
    critical_alerts_count: int
    malware_by_family: Dict[str, int]
    alerts_over_time: List[Dict[str, Any]]
    risk_distribution: Dict[str, int]
    system_latency_avg_ms: float

# Threat Intel & Settings
class ThreatIntelFeedResponse(BaseModel):
    id: int
    feed_name: str
    indicator_type: str
    indicator_value: str
    threat_category: str
    source: str
    created_at: datetime

    class Config:
        from_attributes = True

class PlatformSettingResponse(BaseModel):
    id: int
    setting_key: str
    setting_value: str
    description: Optional[str] = None

    class Config:
        from_attributes = True

class PlatformSettingUpdate(BaseModel):
    setting_value: str

class AuditLogResponse(BaseModel):
    id: int
    user_id: Optional[int]
    action: str
    resource: str
    details: Optional[str]
    ip_address: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True
