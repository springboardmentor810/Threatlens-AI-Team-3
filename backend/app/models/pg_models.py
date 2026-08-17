from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, Float, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship, declarative_base

Base = declarative_base()

class Role(Base):
    __tablename__ = "roles"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, nullable=False, index=True) # Security Analyst, SOC Team Member, Administrator, Researcher
    description = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    users = relationship("User", back_populates="role")


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(100), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(100), nullable=False)
    role_id = Column(Integer, ForeignKey("roles.id"), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    role = relationship("Role", back_populates="users")
    uploaded_files = relationship("FileItem", back_populates="uploader")
    assigned_alerts = relationship("Alert", back_populates="assignee")
    audit_logs = relationship("AuditLog", back_populates="user")


class FileItem(Base):
    __tablename__ = "files"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String(255), nullable=False)
    original_name = Column(String(255), nullable=False)
    file_size = Column(Integer, nullable=False)
    file_type = Column(String(100), nullable=False)
    md5_hash = Column(String(32), index=True, nullable=False)
    sha256_hash = Column(String(64), index=True, nullable=False)
    upload_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    status = Column(String(50), default="uploaded") # uploaded, analyzing, analyzed, failed
    created_at = Column(DateTime, default=datetime.utcnow)

    uploader = relationship("User", back_populates="uploaded_files")
    summary = relationship("AnalysisSummary", back_populates="file", uselist=False, cascade="all, delete-orphan")
    classification = relationship("Classification", back_populates="file", uselist=False, cascade="all, delete-orphan")
    alerts = relationship("Alert", back_populates="file", cascade="all, delete-orphan")


class AnalysisSummary(Base):
    __tablename__ = "analysis_summaries"

    id = Column(Integer, primary_key=True, index=True)
    file_id = Column(Integer, ForeignKey("files.id"), nullable=False, unique=True)
    mongo_report_id = Column(String(100), nullable=False) # Mongo Object ID string
    pe_sections_count = Column(Integer, default=0)
    suspicious_imports_count = Column(Integer, default=0)
    urls_found_count = Column(Integer, default=0)
    ips_found_count = Column(Integer, default=0)
    yara_matches_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    file = relationship("FileItem", back_populates="summary")


class Classification(Base):
    __tablename__ = "classifications"

    id = Column(Integer, primary_key=True, index=True)
    file_id = Column(Integer, ForeignKey("files.id"), nullable=False, unique=True)
    predicted_label = Column(String(50), nullable=False) # Clean, Ransomware, Trojan, Spyware, Worm, Adware
    malware_family = Column(String(100), nullable=False) # E.g., WannaCry, Emotet, AgentTesla, Mirai, Adware.Generic, Clean
    confidence_score = Column(Float, nullable=False) # 0.0 - 1.0
    risk_score = Column(Integer, nullable=False) # 0 - 100
    execution_time_ms = Column(Float, default=0.0)
    model_version = Column(String(50), default="v1.0.0-rf")
    created_at = Column(DateTime, default=datetime.utcnow)

    file = relationship("FileItem", back_populates="classification")


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    file_id = Column(Integer, ForeignKey("files.id"), nullable=False)
    title = Column(String(255), nullable=False)
    severity = Column(String(20), nullable=False) # Low, Medium, High, Critical
    status = Column(String(30), default="New") # New, In_Progress, Resolved, False_Positive
    risk_score = Column(Integer, nullable=False)
    details = Column(Text, nullable=True)
    assigned_to_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    file = relationship("FileItem", back_populates="alerts")
    assignee = relationship("User", back_populates="assigned_alerts")


class ThreatIntelFeed(Base):
    __tablename__ = "threat_intel_feeds"

    id = Column(Integer, primary_key=True, index=True)
    feed_name = Column(String(100), nullable=False)
    indicator_type = Column(String(30), nullable=False) # hash, ip, domain, url
    indicator_value = Column(String(255), nullable=False, index=True)
    threat_category = Column(String(100), nullable=False)
    source = Column(String(100), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class PlatformSetting(Base):
    __tablename__ = "platform_settings"

    id = Column(Integer, primary_key=True, index=True)
    setting_key = Column(String(100), unique=True, nullable=False)
    setting_value = Column(Text, nullable=False)
    description = Column(String(255), nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    action = Column(String(100), nullable=False)
    resource = Column(String(100), nullable=False)
    details = Column(Text, nullable=True)
    ip_address = Column(String(45), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="audit_logs")
