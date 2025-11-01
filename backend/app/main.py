from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
import logging
import os
from .database import engine, get_db
from .models import Base
from .api import api_router

# Create database tables
Base.metadata.create_all(bind=engine)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="CivicSense API",
    description="AI-verified Civic & Climate Reporting API",
    version="0.1.0",
    docs_url="/api/v1/docs",
    redoc_url="/api/v1/redoc",
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Frontend dev server
        "https://civicsense.vercel.app",  # Production frontend
        "*"  # Allow all for demo - restrict in production
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files for uploads
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# Include API router
app.include_router(api_router, prefix="/api/v1")

# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Global exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"}
    )

@app.get("/api/v1/health")
def health_check(db: Session = get_db()):
    """Health check endpoint."""
    try:
        # Test database connection
        db.execute("SELECT 1")
        db_status = "ok"
    except Exception:
        db_status = "error"

    return {
        "status": "ok",
        "services": {
            "db": db_status,
            "ml": "ok"  # Mock for now
        },
        "version": "0.1.0"
    }

@app.get("/")
def root():
    """Root endpoint."""
    return {
        "message": "CivicSense API",
        "docs": "/api/v1/docs",
        "health": "/api/v1/health"
    }