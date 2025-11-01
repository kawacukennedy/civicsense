from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime
from . import models, schemas, auth

# User CRUD operations
def create_user(db: Session, user: schemas.UserCreate) -> models.User:
    """Create a new user."""
    db_user = models.User(
        id=str(uuid.uuid4()),
        email=user.email,
        name=user.name,
        role=user.role,
        password_hash=auth.get_password_hash(user.password)
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def get_user(db: Session, user_id: str) -> Optional[models.User]:
    """Get a user by ID."""
    return db.query(models.User).filter(models.User.id == user_id).first()

def get_user_by_email(db: Session, email: str) -> Optional[models.User]:
    """Get a user by email."""
    return db.query(models.User).filter(models.User.email == email).first()

def get_users(db: Session, skip: int = 0, limit: int = 100) -> List[models.User]:
    """Get all users with pagination."""
    return db.query(models.User).offset(skip).limit(limit).all()

# Report CRUD operations
def create_report(db: Session, report: schemas.ReportCreate, reporter_id: Optional[str] = None) -> models.Report:
    """Create a new report."""
    # Round coordinates for privacy (to nearest 50 meters)
    rounded_lat = round(report.lat, 4)  # ~11m precision
    rounded_lng = round(report.lng, 4)  # ~11m precision

    db_report = models.Report(
        id=str(uuid.uuid4()),
        title=report.title,
        description=report.description,
        lat=report.lat,
        lng=report.lng,
        location_rounded_lat=rounded_lat,
        location_rounded_lng=rounded_lng,
        accuracy_m=report.accuracy_m,
        anonymous=report.anonymous,
        reporter_id=reporter_id
    )
    db.add(db_report)
    db.commit()
    db.refresh(db_report)
    return db_report

def get_report(db: Session, report_id: str) -> Optional[models.Report]:
    """Get a report by ID."""
    return db.query(models.Report).filter(models.Report.id == report_id).first()

def get_reports(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    bbox: Optional[str] = None,
    status: Optional[str] = None,
    priority_min: Optional[int] = None
) -> List[models.Report]:
    """Get reports with optional filtering."""
    query = db.query(models.Report)

    # Bounding box filter
    if bbox:
        try:
            min_lng, min_lat, max_lng, max_lat = map(float, bbox.split(','))
            query = query.filter(
                and_(
                    models.Report.location_rounded_lng >= min_lng,
                    models.Report.location_rounded_lng <= max_lng,
                    models.Report.location_rounded_lat >= min_lat,
                    models.Report.location_rounded_lat <= max_lat
                )
            )
        except ValueError:
            pass  # Invalid bbox, ignore filter

    # Status filter
    if status:
        query = query.filter(models.Report.status == status)

    # Priority filter
    if priority_min is not None:
        query = query.filter(models.Report.priority_score >= priority_min)

    # Order by priority and creation date
    query = query.order_by(
        models.Report.priority_score.desc(),
        models.Report.created_at.desc()
    )

    return query.offset(skip).limit(limit).all()

def update_report(db: Session, report_id: str, updates: schemas.ReportUpdate) -> Optional[models.Report]:
    """Update a report."""
    db_report = get_report(db, report_id)
    if not db_report:
        return None

    update_data = updates.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_report, field, value)

    db_report.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(db_report)
    return db_report

def claim_report(db: Session, report_id: str, user_id: str, notes: Optional[str] = None) -> Optional[models.Report]:
    """Claim a report for resolution."""
    db_report = get_report(db, report_id)
    if not db_report or db_report.assigned_to_id:
        return None

    db_report.assigned_to_id = user_id
    db_report.status = "in_progress"
    db_report.updated_at = datetime.utcnow()

    # Create activity log
    activity = models.Activity(
        id=str(uuid.uuid4()),
        report_id=report_id,
        user_id=user_id,
        action="claimed",
        details={"notes": notes}
    )
    db.add(activity)

    db.commit()
    db.refresh(db_report)
    return db_report

def resolve_report(db: Session, report_id: str, user_id: str, resolution_notes: str) -> Optional[models.Report]:
    """Resolve a report."""
    db_report = get_report(db, report_id)
    if not db_report or db_report.assigned_to_id != user_id:
        return None

    db_report.status = "resolved"
    db_report.resolved_at = datetime.utcnow()
    db_report.updated_at = datetime.utcnow()

    # Create activity log
    activity = models.Activity(
        id=str(uuid.uuid4()),
        report_id=report_id,
        user_id=user_id,
        action="resolved",
        details={"resolution_notes": resolution_notes}
    )
    db.add(activity)

    db.commit()
    db.refresh(db_report)
    return db_report

# Media CRUD operations
def create_media_file(db: Session, media: schemas.MediaFileBase, report_id: str) -> models.MediaFile:
    """Create a media file record."""
    db_media = models.MediaFile(
        id=str(uuid.uuid4()),
        report_id=report_id,
        **media.dict()
    )
    db.add(db_media)
    db.commit()
    db.refresh(db_media)
    return db_media

def get_media_files(db: Session, report_id: str) -> List[models.MediaFile]:
    """Get all media files for a report."""
    return db.query(models.MediaFile).filter(models.MediaFile.report_id == report_id).all()

# Activity CRUD operations
def get_activities(db: Session, report_id: Optional[str] = None, skip: int = 0, limit: int = 100) -> List[models.Activity]:
    """Get activities, optionally filtered by report."""
    query = db.query(models.Activity)
    if report_id:
        query = query.filter(models.Activity.report_id == report_id)

    return query.order_by(models.Activity.created_at.desc()).offset(skip).limit(limit).all()

def create_activity(db: Session, activity: schemas.ActivityBase, report_id: str, user_id: Optional[str] = None) -> models.Activity:
    """Create an activity log."""
    db_activity = models.Activity(
        id=str(uuid.uuid4()),
        report_id=report_id,
        user_id=user_id,
        **activity.dict()
    )
    db.add(db_activity)
    db.commit()
    db.refresh(db_activity)
    return db_activity