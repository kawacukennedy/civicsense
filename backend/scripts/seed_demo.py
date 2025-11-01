#!/usr/bin/env python3
"""
Demo data seeding script for CivicSense.
Run this after starting the backend to populate the database with sample data.
"""

import os
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session
from app.database import SessionLocal, engine
from app.models import Base
from app import crud, schemas

def seed_demo_data():
    """Seed the database with demo data."""
    # Create tables
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        # Create demo users
        print("Creating demo users...")

        volunteer_data = schemas.UserCreate(
            email="volunteer@civicsense.demo",
            name="Demo Volunteer",
            password="demo123",
            role="volunteer"
        )
        volunteer = crud.create_user(db, volunteer_data)

        admin_data = schemas.UserCreate(
            email="admin@civicsense.demo",
            name="Demo Admin",
            password="admin123",
            role="admin"
        )
        admin = crud.create_user(db, admin_data)

        # Create demo reports
        print("Creating demo reports...")

        reports_data = [
            {
                "title": "Pothole on Main Street",
                "description": "Large pothole causing traffic issues near the intersection",
                "lat": 40.7128,
                "lng": -74.0060,
                "anonymous": True
            },
            {
                "title": "Flooding near River Park",
                "description": "Water overflowing onto sidewalks after heavy rain",
                "lat": 40.7589,
                "lng": -73.9851,
                "anonymous": True
            },
            {
                "title": "Broken Street Light",
                "description": "Street light not working at night, safety concern",
                "lat": 40.7505,
                "lng": -73.9934,
                "anonymous": False
            },
            {
                "title": "Illegal Dumping",
                "description": "Construction waste dumped on public property",
                "lat": 40.7282,
                "lng": -73.7949,
                "anonymous": True
            },
            {
                "title": "Traffic Signal Malfunction",
                "description": "Traffic light stuck on red, causing congestion",
                "lat": 40.7580,
                "lng": -73.9855,
                "anonymous": True
            }
        ]

        for report_data in reports_data:
            report = crud.create_report(db, schemas.ReportCreate(**report_data))

            # Mock verification and priority
            crud.update_report(db, report.id, schemas.ReportUpdate(
                verification_score=0.8 + (0.2 * (hash(report.id) % 10) / 10),  # Random between 0.8-1.0
                verification_labels=["infrastructure", "safety", "maintenance"][hash(report.id) % 3:][:1],
                priority_score=60 + (hash(report.id) % 40),  # Random between 60-100
                priority_level="high" if hash(report.id) % 3 == 0 else "medium",
                status="verified"
            ))

        # Claim one report
        reports = crud.get_reports(db, limit=1)
        if reports:
            crud.claim_report(db, reports[0].id, volunteer.id, "Will investigate this week")

        print("Demo data seeded successfully!")
        print(f"Created users: {volunteer.email}, {admin.email}")
        print(f"Created {len(reports_data)} demo reports")

    except Exception as e:
        print(f"Error seeding data: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_demo_data()