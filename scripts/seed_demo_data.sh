#!/bin/bash

echo "Seeding demo data..."

# Run Python seeder
cd backend
python scripts/seed_demo.py

echo "Demo data seeded successfully!"