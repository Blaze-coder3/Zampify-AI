from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # App
    APP_NAME: str = "Zampify AI"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://zampify:zampify@localhost:5432/zampify"
    DATABASE_SYNC_URL: str = "postgresql://zampify:zampify@localhost:5432/zampify"

    # Redis
    REDIS_URL: str = "redis://localhost:6379"

    # FeatherlessAI
    FEATHERLESS_API_KEY: str = ""
    FEATHERLESS_BASE_URL: str = "https://api.featherless.ai/v1"
    FEATHERLESS_MODEL: str = "meta-llama/Llama-3.3-70B-Instruct"

    # File Storage
    UPLOAD_DIR: str = "./uploads"
    MAX_UPLOAD_SIZE_MB: int = 10

    # Policy
    POLICY_FILE: str = "./app/policies/policies.yaml"
    
    # Email Ingestion
    IMAP_SERVER: str = "imap.gmail.com"
    IMAP_PORT: int = 993
    IMAP_USERNAME: str = ""
    IMAP_PASSWORD: str = ""

    # Processing Thresholds
    OCR_CONFIDENCE_THRESHOLD: float = 80.0
    MAX_AUTO_APPROVAL_AMOUNT: float = 5000.0
    TOLERANCE_PERCENTAGE: float = 2.0
    DUPLICATE_WINDOW_DAYS: int = 90
    VELOCITY_MAX_INVOICES: int = 3
    VELOCITY_WINDOW_HOURS: int = 24

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
