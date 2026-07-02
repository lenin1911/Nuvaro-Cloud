import uuid
import os
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status, Request
from fastapi.responses import FileResponse as FastAPIFileResponse
from sqlalchemy.orm import Session
from backend.database.connection import get_db
from backend.models.user import User
from backend.models.file import FileMetadata
from backend.schemas.file import FileResponse, FileUpdate, FileStats
from backend.auth.jwt import get_current_user
from backend.services.s3_service import s3_service
from backend.config import settings

router = APIRouter(prefix="/files", tags=["Files"])

# 100MB limit: 100 * 1024 * 1024
MAX_FILE_SIZE = 100 * 1024 * 1024

# MIME type mappings by category
CATEGORY_MIMES = {
    "pdf": ["application/pdf"],
    "image": ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"],
    "video": ["video/mp4", "video/mpeg", "video/quicktime", "video/x-msvideo", "video/webm"],
    "document": [
        "text/plain", "application/msword", 
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-powerpoint", 
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "application/vnd.ms-excel", 
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    ],
    "zip": ["application/zip", "application/x-zip-compressed", "application/x-tar", "application/x-gzip", "application/x-rar-compressed", "application/x-7z-compressed"]
}

# Master list of supported MIME types
SUPPORTED_MIMES = []
for mimes in CATEGORY_MIMES.values():
    SUPPORTED_MIMES.extend(mimes)

def get_category_from_mime(mime_type: str) -> str:
    for category, mimes in CATEGORY_MIMES.items():
        if mime_type in mimes:
            return category
    return "other"

@router.post("/upload", response_model=FileResponse, status_code=status.HTTP_201_CREATED)
async def upload_file(
    file: UploadFile = File(...),
    is_public: bool = Form(False),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Validate MIME type
    content_type = file.content_type
    # If content_type is missing, fall back to checking extension
    if not content_type or content_type == "application/octet-stream":
        import mimetypes
        guess, _ = mimetypes.guess_type(file.filename)
        if guess:
            content_type = guess

    # Check if type is in supported types list
    if content_type not in SUPPORTED_MIMES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file type: {content_type}. Supported types: PDF, Images, Videos, Documents, Archives (ZIP/RAR/TAR)."
        )

    # Read a chunk to inspect file size or rely on header if reliable
    # We will read chunks to double-check file size safely.
    file.file.seek(0, os.SEEK_END)
    size = file.file.tell()
    file.file.seek(0)  # Reset pointer

    if size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File exceeds maximum upload size of {MAX_FILE_SIZE // (1024 * 1024)}MB."
        )

    # Prevent path traversal and name collisions by securing key
    original_name = os.path.basename(file.filename)
    # Sanitize name
    sanitized_name = "".join(c for c in original_name if c.isalnum() or c in (".", "_", "-")).strip()
    if not sanitized_name:
        sanitized_name = "unnamed_file"
        
    s3_key = f"uploads/{current_user.id}/{uuid.uuid4()}_{sanitized_name}"

    # Upload to backend storage (S3 or filesystem fallback)
    uploaded_key = s3_service.upload_file(file.file, s3_key)

    # Save metadata in DB
    db_file = FileMetadata(
        owner_id=current_user.id,
        filename=sanitized_name,
        original_name=original_name,
        size=size,
        mime_type=content_type,
        s3_key=uploaded_key,
        is_public=is_public
    )
    db.add(db_file)
    db.commit()
    db.refresh(db_file)

    return db_file

@router.get("", response_model=List[FileResponse])
def list_files(
    q: Optional[str] = None,
    type: Optional[str] = None,
    sort_by: str = "upload_time",  # upload_time, size, filename
    sort_order: str = "desc",      # asc, desc
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(FileMetadata).filter(FileMetadata.owner_id == current_user.id)

    # Filter by search query (case-insensitive filename search)
    if q:
        query = query.filter(FileMetadata.filename.ilike(f"%{q}%"))

    # Filter by category
    if type and type in CATEGORY_MIMES:
        mimes = CATEGORY_MIMES[type]
        query = query.filter(FileMetadata.mime_type.in_(mimes))

    # Apply sorting
    # Validate sort_by
    if sort_by not in ["upload_time", "size", "filename"]:
        sort_by = "upload_time"
        
    attr = getattr(FileMetadata, sort_by)
    if sort_order.lower() == "asc":
        query = query.order_by(attr.asc())
    else:
        query = query.order_by(attr.desc())

    return query.all()

@router.get("/stats", response_model=FileStats)
def get_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    files = db.query(FileMetadata).filter(FileMetadata.owner_id == current_user.id).all()
    total_files = len(files)
    total_size = sum(f.size for f in files)
    
    # Fetch 5 most recent files
    recent_uploads = db.query(FileMetadata)\
        .filter(FileMetadata.owner_id == current_user.id)\
        .order_by(FileMetadata.upload_time.desc())\
        .limit(5)\
        .all()

    return {
        "total_files": total_files,
        "total_size": total_size,
        "recent_uploads": recent_uploads
    }

@router.get("/{file_id}", response_model=FileResponse)
def get_file_metadata(
    file_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    file_meta = db.query(FileMetadata).filter(FileMetadata.id == file_id).first()
    if not file_meta:
        raise HTTPException(status_code=404, detail="File not found")
        
    if file_meta.owner_id != current_user.id and not file_meta.is_public:
        raise HTTPException(status_code=403, detail="Not authorized to access this file")
        
    return file_meta

@router.put("/{file_id}", response_model=FileResponse)
def update_file_metadata(
    file_id: int,
    file_update: FileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    file_meta = db.query(FileMetadata).filter(FileMetadata.id == file_id).first()
    if not file_meta:
        raise HTTPException(status_code=404, detail="File not found")
        
    if file_meta.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to modify this file")

    if file_update.filename is not None:
        # Sanitize new name
        sanitized = "".join(c for c in file_update.filename if c.isalnum() or c in (".", "_", "-")).strip()
        if not sanitized:
            raise HTTPException(status_code=400, detail="Invalid filename")
        # Maintain extension if original had one and update lacks it, or keep it clean
        file_meta.filename = sanitized
        
    if file_update.is_public is not None:
        file_meta.is_public = file_update.is_public

    db.commit()
    db.refresh(file_meta)
    return file_meta

@router.delete("/{file_id}")
def delete_file(
    file_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    file_meta = db.query(FileMetadata).filter(FileMetadata.id == file_id).first()
    if not file_meta:
        raise HTTPException(status_code=404, detail="File not found")
        
    if file_meta.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this file")

    # Delete from backend storage (S3 or filesystem)
    s3_service.delete_file(file_meta.s3_key)

    # Delete from DB
    db.delete(file_meta)
    db.commit()
    
    return {"message": "File deleted successfully"}

@router.get("/download/{file_id}")
def get_download_link(
    file_id: int,
    request: Request,
    token: Optional[str] = None,  # Query param to support direct download link validation for images/PDFs
    db: Session = Depends(get_db)
):
    # Verify user manually from query token or Authorization header
    user = None
    auth_token = token
    if not auth_token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            auth_token = auth_header.split(" ")[1]

    if auth_token:
        try:
            from backend.auth.jwt import jwt
            payload = jwt.decode(auth_token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
            user_id = int(payload.get("sub"))
            user = db.query(User).filter(User.id == user_id).first()
        except Exception:
            pass

    file_meta = db.query(FileMetadata).filter(FileMetadata.id == file_id).first()
    if not file_meta:
        raise HTTPException(status_code=404, detail="File not found")

    # Access control: Must be public or owned by requester
    if not file_meta.is_public:
        if not user:
            raise HTTPException(status_code=401, detail="Authentication required to access private file")
        if file_meta.owner_id != user.id:
            raise HTTPException(status_code=403, detail="Not authorized to download this file")

    # Generate a download link (presigned S3 URL or direct backend route for local mode)
    download_url = s3_service.generate_download_url(file_meta.s3_key, file_meta.filename)
    return {"download_url": download_url, "is_local": s3_service.use_local}

# Local storage fallback downloader route
@router.get("/download-local/{s3_key:path}")
def download_local_file(
    s3_key: str,
    filename: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Direct endpoint for local file streaming. Handles local files.
    """
    if not settings.USE_LOCAL_STORAGE:
        raise HTTPException(status_code=400, detail="Local storage is not active")

    file_path = s3_service.get_local_file_path(s3_key)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Local file does not exist")

    # Double check path traversal safety
    abs_root = os.path.abspath(settings.LOCAL_STORAGE_DIR)
    abs_file = os.path.abspath(file_path)
    if not abs_file.startswith(abs_root):
        raise HTTPException(status_code=400, detail="Access denied: Path traversal detected")

    headers = {}
    if filename:
        headers["Content-Disposition"] = f"attachment; filename=\"{filename}\""
        
    return FastAPIFileResponse(path=file_path, headers=headers)
