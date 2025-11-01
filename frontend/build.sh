#!/bin/bash

echo "Building CivicSense Frontend..."

# Install dependencies
npm install

# Run linter
npm run lint

# Run tests (if available)
# npm test run

# Build for production
npm run build

echo "Build completed successfully!"
echo "Output in dist/ directory"