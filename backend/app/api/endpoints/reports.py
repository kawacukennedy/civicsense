from typing import List
import uuid
from datetime import datetime
from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from pydantic import BaseModel
import aiofiles
import os

router = APIRouter()

# In-memory storage for demo (use database in production)
reports_db = []

class ReportSummary(BaseModel):
    id: str
    title: str
    lat: float
    lng: float
    status: str
    priority_score: int
    created_at: str

class ReportDetail(BaseModel):
    id: str
    title: str
    description: str | None
    lat: float
    lng: float
    media_urls: List[str]
    verification: dict
    priority: dict
    status: str
    created_at: str
    updated_at: str

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/", response_model=dict)
async def create_report(
    title: str = Form(...),
    description: str = Form(""),
    lat: float = Form(...),
    lng: float = Form(...),
    accuracy_m: float = Form(None),
    anonymous: bool = Form(True),
    reporter_contact: str = Form(None),
    media: UploadFile = File(None)
):
    report_id = str(uuid.uuid4())

    media_urls = []
    if media:
        # Save uploaded file
        file_extension = os.path.splitext(media.filename)[1]
        filename = f"{report_id}{file_extension}"
        file_path = os.path.join(UPLOAD_DIR, filename)

        async with aiofiles.open(file_path, 'wb') as f:
            content = await media.read()
            await f.write(content)

        media_urls.append(f"/uploads/{filename}")

    # Mock verification and priority
    verification = {
        "score": 0.85,
        "labels": ["pothole"],
        "is_duplicate": False,
        "explanation": "AI analysis complete"
    }

    priority = {
        "score": 75,
        "level": "high",
        "factors": {"verification": 0.85, "location": 0.8}
    }

    created_at = datetime.utcnow().isoformat() + "Z"

    new_report = {
        "id": report_id,
        "title": title,
        "description": description,
        "lat": lat,
        "lng": lng,
        "media_urls": media_urls,
        "verification": verification,
        "priority": priority,
        "status": "verified",
        "created_at": created_at,
        "updated_at": created_at
    }

    reports_db.append(new_report)

    return {
        "id": report_id,
        "tracking_url": f"http://localhost:3000/reports/{report_id}",
        "status": "created",
        "message": "Report accepted for verification"
    }

@router.get("/", response_model=dict)
def list_reports(bbox: str | None = None, status: str | None = None):
    filtered_reports = reports_db

    if status:
        filtered_reports = [r for r in filtered_reports if r["status"] == status]

    # Mock pagination
    return {
        "data": filtered_reports,
        "meta": {"page": 1, "per_page": 20, "total": len(filtered_reports)}
    }

@router.get("/{report_id}", response_model=ReportDetail)
def get_report(report_id: str):
    report = next((r for r in reports_db if r["id"] == report_id), None)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    return report

@router.post("/{report_id}/message", response_model=dict)
def generate_authority_message(report_id: str, format: str = "mailto", target: str = "municipal@city.gov"):
    report = next((r for r in reports_db if r["id"] == report_id), None)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    subject = f"[CivicSense] Urgent: {report['title']}"
    body = f"""Date: {report['created_at']}
Location: {report['lat']}, {report['lng']}
Issue: {report['title']}
Description: {report['description'] or 'No description provided'}
Priority: {report['priority']['level']} ({report['priority']['score']})
Media: {', '.join(report['media_urls']) if report['media_urls'] else 'None'}

Please acknowledge receipt and provide expected ETA for resolution.
"""

    if format == "mailto":
        mailto_link = f"mailto:{target}?subject={subject}&body={body}"
        return {"mailto": mailto_link}
    elif format == "whatsapp":
        whatsapp_text = f"{subject}\n\n{body}".replace('\n', '%0A')
        wa_link = f"https://wa.me/?text={whatsapp_text}"
        return {"wa_link": wa_link}

    return {"message": "Format not supported"}