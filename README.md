# CivicSense

AI-verified Civic & Climate Reporting for Public Good

## Overview

CivicSense is a mobile-first web app that allows citizens to report civic and climate issues quickly and anonymously. Reports are verified using AI, prioritized based on impact, and can be sent directly to authorities or community groups for action.

## Features

- **Quick Reporting**: One-screen form with optional photo, title, description, and location
- **AI Verification**: Automatic classification and duplicate detection using machine learning
- **Priority Scoring**: Intelligent prioritization based on verification score, weather, population density, etc.
- **Public Feed & Map**: Browse reports spatially and temporally
- **Authority Messaging**: Generate action-ready messages for municipal departments
- **Volunteer Dashboard**: Community volunteers can claim and resolve reports
- **Privacy-First**: Anonymous by default, location rounding, EXIF stripping

## Tech Stack

- **Frontend**: React + TypeScript + Vite + TailwindCSS + Leaflet + Framer Motion
- **Backend**: FastAPI + Python 3.11 + SQLAlchemy + Postgres/SQLite + JWT Auth
- **Database**: SQLAlchemy ORM with SQLite (dev) / PostgreSQL (prod)
- **ML**: ONNX models for image/text classification + duplicate detection
- **Security**: JWT authentication, password hashing, CORS, input validation
- **Infrastructure**: Docker + Docker Compose for local dev

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.11+
- Docker & Docker Compose

### Local Development

1. Clone the repo:
   ```bash
   git clone https://github.com/kawacukennedy/civicsense.git
   cd civicsense
   ```

2. Start the development environment:
   ```bash
   docker-compose -f infra/docker-compose.yml up --build
   ```

3. The app will be available at:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Docs: http://localhost:8000/docs

### Demo Mode

The app runs in demo mode by default with seeded data and services. No external API keys required!

**Demo Accounts:**
- **Volunteer**: `volunteer@civicsense.demo` / `demo123`
- **Admin**: `admin@civicsense.demo` / `admin123`

### Manual Testing

To test the full flow:
1. Visit http://localhost:3000
2. Click "Report Issue" (works without login)
3. Fill out the form (location will auto-detect)
4. Submit the report
5. View it on the map and in the feed
6. Login as volunteer to claim and resolve reports
7. Click on a report to see details and send to authorities

### Database Seeding

After starting the backend, run:
```bash
./scripts/seed_demo_data.sh
```

This creates demo users and sample reports in the database.

## API Documentation

- **Interactive API Docs**: `/api/v1/docs` (Swagger UI)
- **Alternative Docs**: `/api/v1/redoc` (ReDoc)
- **OpenAPI Schema**: `/api/v1/openapi.json`

### Authentication
The API uses JWT (JSON Web Tokens) for authentication:
- Register: `POST /api/v1/auth/register`
- Login: `POST /api/v1/auth/login`
- Use Bearer token in `Authorization` header for protected endpoints

### Key Endpoints
- `POST /api/v1/reports` - Create report (anonymous allowed)
- `GET /api/v1/reports` - List reports with filtering
- `GET /api/v1/reports/{id}` - Get report details
- `POST /api/v1/reports/{id}/claim` - Claim report (volunteers)
- `POST /api/v1/reports/{id}/resolve` - Resolve report
- `POST /api/v1/reports/{id}/message` - Generate authority message

## Contributing

This is an open-source project under the MIT License. Contributions welcome!

## License

MIT License - see LICENSE file for details.
