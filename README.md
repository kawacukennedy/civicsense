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
   git clone https://github.com/yourusername/civicsense.git
   cd civicsense
   ```

2. Start the development environment:
   ```bash
   docker-compose up --build
   ```

3. Seed demo data:
   ```bash
   ./scripts/seed_demo_data.sh
   ```

4. Open http://localhost:3000 for the frontend, http://localhost:8000 for the backend API.

### Demo Mode

The app includes a demo mode with seeded data that works without external API keys. Use the pre-seeded volunteer account: `volunteer@example.com` / `demo123`.

## API Documentation

API docs available at `/api/v1/docs` when running the backend.

## Contributing

This is an open-source project under the MIT License. Contributions welcome!

## License

MIT License - see LICENSE file for details.