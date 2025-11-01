#!/bin/bash

echo "Seeding demo data..."

# Create uploads directory
mkdir -p uploads

# Create some sample reports via API
curl -X POST http://localhost:8000/api/v1/reports \
  -F "title=Pothole on Main Street" \
  -F "description=Large pothole causing traffic issues" \
  -F "lat=40.7128" \
  -F "lng=-74.0060" \
  -F "anonymous=true"

curl -X POST http://localhost:8000/api/v1/reports \
  -F "title=Flooding near River Park" \
  -F "description=Water overflowing onto sidewalks" \
  -F "lat=40.7589" \
  -F "lng=-73.9851" \
  -F "anonymous=true"

curl -X POST http://localhost:8000/api/v1/reports \
  -F "title=Broken Street Light" \
  -F "description=Street light not working at night" \
  -F "lat=40.7505" \
  -F "lng=-73.9934" \
  -F "anonymous=true"

echo "Demo data seeded successfully!"