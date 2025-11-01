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
- **Backend**: FastAPI + Python 3.11 + SQLAlchemy + Postgres/SQLite
- **ML**: ONNX models for image/text classification + duplicate detection
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

The app runs in demo mode by default with mock data and services. No external API keys required!

### Deployment

#### Frontend (Vercel)
The frontend is configured for Vercel deployment:

1. Connect your GitHub repo to Vercel
2. Set the root directory to `frontend/`
3. Vercel will automatically detect the Vite configuration
4. The app will be deployed with the API proxy configured

#### Backend (Render/Railway)
Deploy the backend separately:
1. Use the `backend/` directory
2. Set environment variables from `.env.example`
3. Deploy to Render, Railway, or similar platform
4. Update the frontend API URLs to point to your deployed backend

### Manual Testing

To test the full flow:
1. Visit http://localhost:3000
2. Click "Report Issue"
3. Fill out the form (location will auto-detect)
4. Submit the report
5. View it on the map and in the feed
6. Click on a report to see details and send to authorities

## API Documentation

API docs available at `/api/v1/docs` when running the backend.

## Contributing

This is an open-source project under the MIT License. Contributions welcome!

## License

MIT License - see LICENSE file for details.
