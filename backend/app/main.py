from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .api import api_router

app = FastAPI(
    title="CivicSense API",
    description="AI-verified Civic & Climate Reporting API",
    version="0.1.0",
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api/v1")

@app.get("/api/v1/health")
def health_check():
    return {"status": "ok", "services": {"db": "ok", "ml": "ok"}}