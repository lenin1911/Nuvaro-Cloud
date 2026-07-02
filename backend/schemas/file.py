from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, Dict

class FileResponse(BaseModel):
    id: int
    owner_id: int
    filename: str
    original_name: str
    size: int
    mime_type: str
    s3_key: str
    is_public: bool
    upload_time: datetime

    class Config:
        from_attributes = True

class FileUpdate(BaseModel):
    filename: Optional[str] = Field(None, min_length=1, max_length=255)
    is_public: Optional[bool] = None

class FileStats(BaseModel):
    total_files: int
    total_size: int
    recent_uploads: list[FileResponse]
    storage_limit: int = 100 * 1024 * 1024 * 1024  # default mock limit: 100 GB
