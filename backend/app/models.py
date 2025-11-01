from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    name = Column(String)
    role = Column(String, default="citizen")  # citizen, volunteer, admin
    password_hash = Column(String)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    reports = relationship("Report", back_populates="reporter")

class Report(Base):
    __tablename__ = "reports"

    id = Column(String, primary_key=True, index=True)
    title = Column(String(140), nullable=False)
    description = Column(Text)
    lat = Column(Float, nullable=False)
    lng = Column(Float, nullable=False)
    accuracy_m = Column(Float)

    # Location privacy - rounded coordinates for public display
    location_rounded_lat = Column(Float)
    location_rounded_lng = Column(Float)

    # Status and priority
    status = Column(String, default="created")  # created, verified, in_progress, resolved
    priority_score = Column(Integer, default=50)
    priority_level = Column(String, default="medium")  # low, medium, high

    # Verification
    verification_score = Column(Float, default=0.0)
    verification_labels = Column(JSON, default=list)  # List of detected categories
    is_duplicate = Column(Boolean, default=False)
    duplicate_of_id = Column(String, ForeignKey("reports.id"))

    # Metadata
    anonymous = Column(Boolean, default=True)
    reporter_id = Column(String, ForeignKey("users.id"))
    assigned_to_id = Column(String, ForeignKey("users.id"))

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    resolved_at = Column(DateTime(timezone=True))

    # Relationships
    reporter = relationship("User", foreign_keys=[reporter_id], back_populates="reports")
    assigned_to = relationship("User", foreign_keys=[assigned_to_id])
    media_files = relationship("MediaFile", back_populates="report")
    activities = relationship("Activity", back_populates="report")

class MediaFile(Base):
    __tablename__ = "media_files"

    id = Column(String, primary_key=True, index=True)
    report_id = Column(String, ForeignKey("reports.id"), nullable=False)
    filename = Column(String, nullable=False)
    original_filename = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    file_type = Column(String)  # image, video
    file_size = Column(Integer)
    mime_type = Column(String)
    sha256_hash = Column(String)
    perceptual_hash = Column(String)  # For duplicate detection

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    report = relationship("Report", back_populates="media_files")

class Activity(Base):
    __tablename__ = "activities"

    id = Column(String, primary_key=True, index=True)
    report_id = Column(String, ForeignKey("reports.id"), nullable=False)
    user_id = Column(String, ForeignKey("users.id"))
    action = Column(String, nullable=False)  # created, verified, claimed, resolved, etc.
    details = Column(JSON)  # Additional action-specific data
    ip_address = Column(String)
    user_agent = Column(String)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    report = relationship("Report", back_populates="activities")
    user = relationship("User")