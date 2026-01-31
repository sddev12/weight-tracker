#!/bin/bash

# Weight Tracker - Start Script
# Starts the Docker Compose services

set -e

echo "🚀 Starting Weight Tracker..."
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Error: Docker is not running"
    echo "Please start Docker and try again"
    exit 1
fi

# Check if services are already running
if docker-compose ps | grep -q "Up"; then
    echo "⚠️  Services are already running"
    echo ""
    docker-compose ps
    echo ""
    read -p "Do you want to restart? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Aborted."
        exit 0
    fi
    echo "Stopping existing services..."
    docker-compose down
fi

# Start services
echo "Building and starting services..."
docker-compose up --build -d

# Wait for services to be healthy
echo ""
echo "Waiting for services to be ready..."
sleep 5

# Check service status
echo ""
echo "Service Status:"
docker-compose ps

# Test backend health
echo ""
echo "Checking backend health..."
if curl -s http://localhost:8080/health > /dev/null 2>&1; then
    echo "✅ Backend is healthy"
else
    echo "⚠️  Backend may still be starting up"
fi

echo ""
echo "✨ Weight Tracker is running!"
echo ""
echo "📱 Frontend: http://localhost:3000"
echo "🔌 Backend API: http://localhost:8080"
echo ""
echo "To view logs: docker-compose logs -f"
echo "To stop: ./stop.sh or docker-compose down"
