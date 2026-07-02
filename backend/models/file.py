from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Boolean, BigInteger
from sqlalchemy.orm import relationship
from datetime import datetime
from backend.database.connection import Base

class FileMetadata(Base):
    __tablename__ = "files"

    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    filename = Column(String, nullable=False)
    original_name = Column(String, nullable=False)
    size = Column(BigInteger, nullable=False)
    mime_type = Column(String, nullable=False)
    s3_key = Column(String, nullable=False)
    is_public = Column(Boolean, default=False)
    upload_time = Column(DateTime, default=datetime.utcnow)

    # Relationships
    owner = relationship("User", back_populates="files")
