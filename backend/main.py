from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from backend.config import settings
from backend.database.connection import init_db
from backend.routers import auth, files
import os

# Set up rate limiter
limiter = Limiter(key_func=get_remote_address, default_limits=["120 per minute"])

app = FastAPI(
    title="Cloud File Storage API",
    description="A production-ready secure file upload and storage management API.",
    version="1.0.0"
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS configuration
origins = [
    "http://localhost:5173", # Vite local frontend
    "http://127.0.0.1:5173",
    "http://localhost:80",
    "http://localhost",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api")
app.include_router(files.router, prefix="/api")

@app.on_event("startup")
def on_startup():
    # Make sure local storage directory exists if using fallback local storage
    if settings.USE_LOCAL_STORAGE:
        os.makedirs(settings.LOCAL_STORAGE_DIR, exist_ok=True)
    
    # Initialize SQL database tables
    init_db()

@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": "Cloud File Storage API",
        "storage_mode": "Local Filesystem Fallback" if settings.USE_LOCAL_STORAGE else "AWS S3"
    }

# General error handling
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    # Log the actual exception (simplified for console output)
    print(f"Unhandled Exception: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal server error occurred."}
    )
