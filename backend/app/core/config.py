import os

try:
    from pydantic_settings import BaseSettings
except ImportError:
    # Standard Python dataclass fallback
    class BaseSettings:
        pass

class Settings(BaseSettings):
    PROJECT_NAME: str = os.getenv("PROJECT_NAME", "ThreatLens AI")
    API_V1_STR: str = os.getenv("API_V1_STR", "/api/v1")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "threatlens_super_secret_jwt_key_2026_x86_64_prod")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours

    # Database URLs
    POSTGRES_USER: str = os.getenv("POSTGRES_USER", "postgres")
    POSTGRES_PASSWORD: str = os.getenv("POSTGRES_PASSWORD", "postgres")
    POSTGRES_SERVER: str = os.getenv("POSTGRES_SERVER", "localhost")
    POSTGRES_PORT: str = os.getenv("POSTGRES_PORT", "5432")
    POSTGRES_DB: str = os.getenv("POSTGRES_DB", "threatlens_db")

    @property
    def SQLALCHEMY_DATABASE_URI(self) -> str:
        if os.getenv("USE_POSTGRES", "false").lower() == "true":
            return f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
        return "sqlite:///./test.db"

    MONGODB_URL: str = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
    MONGODB_DB_NAME: str = os.getenv("MONGODB_DB_NAME", "threatlens_raw_db")

    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")

    # Threat Intel & Alerting
    VIRUSTOTAL_API_KEY: str = os.getenv("VIRUSTOTAL_API_KEY", "")
    RISK_ALERT_THRESHOLD: int = int(os.getenv("RISK_ALERT_THRESHOLD", "65"))
    SIEM_WEBHOOK_URL: str = os.getenv("SIEM_WEBHOOK_URL", "")

    # Storage
    UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", "./uploads")
    YARA_RULES_DIR: str = os.getenv("YARA_RULES_DIR", "./yara_rules")
    MODEL_PATH: str = os.getenv("MODEL_PATH", "./ml_models/malware_classifier.joblib")

    class Config:
        case_sensitive = True

settings = Settings()
