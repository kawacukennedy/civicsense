from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

# User schemas
class UserBase(BaseModel):
    email: str
    name: str
    role: str = "citizen"

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: str
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True

class UserLogin(BaseModel):
    email: str
    password: str

# Media schemas
class MediaFileBase(BaseModel):
    filename: str
    original_filename: str
    file_path: str
    file_type: str
    file_size: int
    mime_type: str
    sha256_hash: Optional[str]
    perceptual_hash: Optional[str]

class MediaFile(MediaFileBase):
    id: str
    report_id: str
    created_at: datetime

    class Config:
        from_attributes = True

# Report schemas
class ReportBase(BaseModel):
    title: str = Field(..., max_length=140)
    description: Optional[str] = Field(None, max_length=2000)
    lat: float
    lng: float
    accuracy_m: Optional[float] = None

class ReportCreate(ReportBase):
    anonymous: bool = True
    reporter_contact: Optional[str] = None

class ReportUpdate(BaseModel):
    title: Optional[str] = Field(None, max_length=140)
    description: Optional[str] = Field(None, max_length=2000)
    status: Optional[str] = None
    priority_score: Optional[int] = None
    priority_level: Optional[str] = None

class Report(ReportBase):
    id: str
    location_rounded_lat: Optional[float]
    location_rounded_lng: Optional[float]
    status: str
    priority_score: int
    priority_level: str
    verification_score: float
    verification_labels: List[str]
    is_duplicate: bool
    duplicate_of_id: Optional[str]
    anonymous: bool
    reporter_id: Optional[str]
    assigned_to_id: Optional[str]
    created_at: datetime
    updated_at: Optional[datetime]
    resolved_at: Optional[datetime]

    # Related data
    media_urls: List[str] = []
    reporter: Optional[User] = None
    assigned_to: Optional[User] = None

    class Config:
        from_attributes = True

class ReportSummary(BaseModel):
    id: str
    title: str
    lat: float
    lng: float
    status: str
    priority_score: int
    created_at: datetime

# Activity schemas
class ActivityBase(BaseModel):
    action: str
    details: Optional[Dict[str, Any]] = None

class Activity(ActivityBase):
    id: str
    report_id: str
    user_id: Optional[str]
    created_at: datetime
    user: Optional[User] = None

    class Config:
        from_attributes = True

# API Response schemas
class APIResponse(BaseModel):
    success: bool = True
    message: Optional[str] = None
    data: Optional[Any] = None

class PaginatedResponse(BaseModel):
    data: List[Any]
    meta: Dict[str, Any]

# Token schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    user_id: Optional[str] = None