from typing import List, Optional
import uuid
from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Depends, Query
from sqlalchemy.orm import Session
import aiofiles
import os
from ...database import get_db
from ... import crud, models, schemas, auth

router = APIRouter()

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/", response_model=schemas.APIResponse)
async def create_report(
    title: str = Form(...),
    description: str = Form(""),
    lat: float = Form(...),
    lng: float = Form(...),
    accuracy_m: float = Form(None),
    anonymous: bool = Form(True),
    reporter_contact: str = Form(None),
    media: UploadFile = File(None),
    db: Session = Depends(get_db),
    current_user: Optional[models.User] = Depends(auth.get_current_user)
):
    """Create a new report."""
    # Create report data
    report_data = schemas.ReportCreate(
        title=title,
        description=description,
        lat=lat,
        lng=lng,
        accuracy_m=accuracy_m,
        anonymous=anonymous,
        reporter_contact=reporter_contact
    )

    # Create report in database
    reporter_id = current_user.id if current_user and not anonymous else None
    db_report = crud.create_report(db, report_data, reporter_id)

    media_urls = []
    if media:
        # Save uploaded file
        file_extension = os.path.splitext(media.filename or "")[1]
        filename = f"{db_report.id}{file_extension}"
        file_path = os.path.join(UPLOAD_DIR, filename)

        async with aiofiles.open(file_path, 'wb') as f:
            content = await media.read()
            await f.write(content)

        # Create media file record
        media_data = schemas.MediaFileBase(
            filename=filename,
            original_filename=media.filename or "",
            file_path=file_path,
            file_type="image" if media.content_type and media.content_type.startswith("image") else "video",
            file_size=len(content),
            mime_type=media.content_type or "",
            sha256_hash=None,  # TODO: Calculate hash
            perceptual_hash=None  # TODO: Calculate perceptual hash
        )
        crud.create_media_file(db, media_data, db_report.id)
        media_urls.append(f"/uploads/{filename}")

    # Create activity log
    crud.create_activity(
        db,
        schemas.ActivityBase(action="created", details={"media_count": len(media_urls)}),
        db_report.id,
        reporter_id
    )

    # Mock verification and priority updates (in real app, this would be async)
    crud.update_report(db, db_report.id, schemas.ReportUpdate(
        verification_score=0.85,
        verification_labels=["pothole"],
        priority_score=75,
        priority_level="high",
        status="verified"
    ))

    return schemas.APIResponse(
        message="Report accepted for verification",
        data={
            "id": db_report.id,
            "tracking_url": f"/reports/{db_report.id}",
            "status": "created"
        }
    )

@router.get("/", response_model=schemas.PaginatedResponse)
def list_reports(
    bbox: Optional[str] = Query(None, description="Bounding box: minLng,minLat,maxLng,maxLat"),
    status: Optional[str] = Query(None, description="Filter by status"),
    priority_min: Optional[int] = Query(None, description="Minimum priority score"),
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(20, ge=1, le=100, description="Items per page"),
    db: Session = Depends(get_db)
):
    """List reports with optional filtering."""
    skip = (page - 1) * per_page
    reports = crud.get_reports(db, skip=skip, limit=per_page, bbox=bbox, status=status, priority_min=priority_min)

    # Convert to response format
    report_summaries = []
    for report in reports:
        report_summaries.append(schemas.ReportSummary(
            id=report.id,
            title=report.title,
            lat=report.location_rounded_lat or report.lat,
            lng=report.location_rounded_lng or report.lng,
            status=report.status,
            priority_score=report.priority_score,
            created_at=report.created_at
        ))

    return schemas.PaginatedResponse(
        data=report_summaries,
        meta={
            "page": page,
            "per_page": per_page,
            "total": len(reports)  # TODO: Get actual total count
        }
    )

@router.get("/{report_id}", response_model=schemas.Report)
def get_report(report_id: str, db: Session = Depends(get_db)):
    """Get a specific report."""
    db_report = crud.get_report(db, report_id)
    if not db_report:
        raise HTTPException(status_code=404, detail="Report not found")

    # Get media files
    media_files = crud.get_media_files(db, report_id)
    media_urls = [f"/uploads/{mf.filename}" for mf in media_files]

    return schemas.Report(
        id=db_report.id,
        title=db_report.title,
        description=db_report.description,
        lat=db_report.lat,
        lng=db_report.lng,
        accuracy_m=db_report.accuracy_m,
        location_rounded_lat=db_report.location_rounded_lat,
        location_rounded_lng=db_report.location_rounded_lng,
        status=db_report.status,
        priority_score=db_report.priority_score,
        priority_level=db_report.priority_level,
        verification_score=db_report.verification_score,
        verification_labels=db_report.verification_labels or [],
        is_duplicate=db_report.is_duplicate,
        duplicate_of_id=db_report.duplicate_of_id,
        anonymous=db_report.anonymous,
        reporter_id=db_report.reporter_id,
        assigned_to_id=db_report.assigned_to_id,
        created_at=db_report.created_at,
        updated_at=db_report.updated_at,
        resolved_at=db_report.resolved_at,
        media_urls=media_urls
    )

@router.post("/{report_id}/message", response_model=schemas.APIResponse)
def generate_authority_message(
    report_id: str,
    format: str = Query("mailto", description="Message format: mailto or whatsapp"),
    target: str = Query("municipal@city.gov", description="Target email or phone"),
    db: Session = Depends(get_db)
):
    """Generate authority message."""
    db_report = crud.get_report(db, report_id)
    if not db_report:
        raise HTTPException(status_code=404, detail="Report not found")

    subject = f"[CivicSense] Urgent: {db_report.title}"
    body = f"""Date: {db_report.created_at.strftime('%Y-%m-%d %H:%M UTC')}
Location: {db_report.lat:.6f}, {db_report.lng:.6f}
Issue: {db_report.title}
Description: {db_report.description or 'No description provided'}
Priority: {db_report.priority_level} ({db_report.priority_score})
Status: {db_report.status}

Please acknowledge receipt and provide expected ETA for resolution.
"""

    if format == "mailto":
        mailto_link = f"mailto:{target}?subject={subject}&body={body}"
        return schemas.APIResponse(data={"mailto": mailto_link})
    elif format == "whatsapp":
        whatsapp_text = f"{subject}\n\n{body}".replace('\n', '%0A')
        wa_link = f"https://wa.me/?text={whatsapp_text}"
        return schemas.APIResponse(data={"wa_link": wa_link})

    raise HTTPException(status_code=400, detail="Unsupported format")

@router.post("/{report_id}/claim", response_model=schemas.APIResponse)
def claim_report(
    report_id: str,
    notes: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    """Claim a report for resolution (volunteers only)."""
    if current_user.role not in ["volunteer", "admin"]:
        raise HTTPException(status_code=403, detail="Only volunteers can claim reports")

    db_report = crud.claim_report(db, report_id, current_user.id, notes)
    if not db_report:
        raise HTTPException(status_code=400, detail="Report could not be claimed")

    return schemas.APIResponse(
        message="Report claimed successfully",
        data={"status": "in_progress", "assigned_to": current_user.id}
    )

@router.post("/{report_id}/resolve", response_model=schemas.APIResponse)
async def resolve_report(
    report_id: str,
    resolution_notes: str = Form(...),
    media: UploadFile = File(None),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    """Resolve a report (assigned volunteer only)."""
    db_report = crud.get_report(db, report_id)
    if not db_report or db_report.assigned_to_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to resolve this report")

    # Handle additional media if provided
    if media:
        file_extension = os.path.splitext(media.filename or "")[1]
        filename = f"{report_id}_resolution{file_extension}"
        file_path = os.path.join(UPLOAD_DIR, filename)

        async with aiofiles.open(file_path, 'wb') as f:
            content = await media.read()
            await f.write(content)

        media_data = schemas.MediaFileBase(
            filename=filename,
            original_filename=media.filename or "",
            file_path=file_path,
            file_type="image" if media.content_type and media.content_type.startswith("image") else "video",
            file_size=len(content),
            mime_type=media.content_type or ""
        )
        crud.create_media_file(db, media_data, report_id)

    db_report = crud.resolve_report(db, report_id, current_user.id, resolution_notes)
    if not db_report:
        raise HTTPException(status_code=400, detail="Report could not be resolved")

    return schemas.APIResponse(
        message="Report resolved successfully",
        data={"status": "resolved", "resolved_at": db_report.resolved_at}
    )

@router.post("/{report_id}/confirm", response_model=schemas.APIResponse)
def confirm_report(
    report_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    """Confirm a report (citizen verification)."""
    db_report = crud.confirm_report(db, report_id, current_user.id)
    if not db_report:
        raise HTTPException(status_code=404, detail="Report not found")

    return schemas.APIResponse(
        message="Report confirmed successfully",
        data={"verification_score": db_report.verification_score}
    )