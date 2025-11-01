from typing import List
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter()

# Mock data for now
reports_db = []

class ReportCreate(BaseModel):
    title: str
    description: str | None = None
    lat: float
    lng: float
    accuracy_m: float | None = None
    anonymous: bool = True
    reporter_contact: str | None = None

class ReportSummary(BaseModel):
    id: str
    title: str
    lat: float
    lng: float
    status: str
    priority_score: int
    created_at: str

@router.post("/", response_model=dict)
def create_report(report: ReportCreate):
    # Mock implementation
    report_id = f"report_{len(reports_db) + 1}"
    new_report = {
        "id": report_id,
        "title": report.title,
        "description": report.description,
        "lat": report.lat,
        "lng": report.lng,
        "status": "created",
        "priority_score": 50,  # Mock
        "created_at": "2025-11-01T00:00:00Z",
        "tracking_url": f"/reports/{report_id}"
    }
    reports_db.append(new_report)
    return {
        "id": report_id,
        "tracking_url": f"/reports/{report_id}",
        "status": "created",
        "message": "Report accepted for verification"
    }

@router.get("/", response_model=dict)
def list_reports(bbox: str | None = None, status: str | None = None):
    # Mock implementation
    return {
        "data": reports_db,
        "meta": {"page": 1, "per_page": 20, "total": len(reports_db)}
    }

@router.get("/{report_id}", response_model=dict)
def get_report(report_id: str):
    # Mock implementation
    report = next((r for r in reports_db if r["id"] == report_id), None)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    return report