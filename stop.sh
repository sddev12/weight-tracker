#!/bin/bash

# Weight Tracker - Stop Script
# Stops the Docker Compose services

set -e

echo "🛑 Stopping Weight Tracker..."
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Error: Docker is not running"
    exit 1
fi

# Check if services are running
if ! docker-compose ps | grep -q "Up"; then
    echo "⚠️  Services are not running"
    docker-compose ps
    exit 0
fi

# Ask for confirmation
read -p "Stop all services? (Y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Nn]$ ]]; then
    echo "Aborted."
    exit 0
fi

# Stop services
echo "Stopping services..."
docker-compose down

echo ""
echo "✅ Services stopped successfully"
echo ""
echo "Note: Data is preserved in the Docker volume 'weight-tracker_weight-data'"
echo "To remove volumes: docker-compose down -v"
