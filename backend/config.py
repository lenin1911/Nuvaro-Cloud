import os
from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    # JWT Settings
    SECRET_KEY: str = "supersecretkeychangeinproduction"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 1 day

    # Database Settings
    DATABASE_URL: str = "sqlite:///./cloudstorage.db"

    # AWS S3 Settings
    AWS_ACCESS_KEY_ID: Optional[str] = None
    AWS_SECRET_ACCESS_KEY: Optional[str] = None
    AWS_REGION: str = "us-east-1"
    AWS_S3_BUCKET: str = "cloud-storage-bucket"
    AWS_S3_ENDPOINT_URL: Optional[str] = None  # e.g. http://localhost:4566 for LocalStack

    # Fallback Local Storage
    LOCAL_STORAGE_DIR: str = os.path.join(os.path.dirname(os.path.abspath(__file__)), "local_uploads")
    USE_LOCAL_STORAGE: bool = True  # Automatically set to True if AWS credentials aren't provided

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

settings = Settings()

# Post-load verification: If S3 credentials are provided, turn off local storage fallback by default
if settings.AWS_ACCESS_KEY_ID and settings.AWS_SECRET_ACCESS_KEY:
    settings.USE_LOCAL_STORAGE = False
