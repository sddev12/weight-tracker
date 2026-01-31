# Docker Compose for Weight Tracker

This Docker Compose configuration allows you to run the entire Weight Tracker application locally with a single command.

## Prerequisites

- Docker
- Docker Compose

## Quick Start

```bash
# Build and start all services
docker-compose up --build

# Or run in detached mode
docker-compose up -d --build
```

The application will be available at:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080
- **Health Check**: http://localhost:8080/health

## Services

### Backend

- **Port**: 8080
- **Technology**: Go/Gin with SQLite
- **Database**: Persistent volume at `/data/weight-tracker.db`
- **Health Check**: Automatic health monitoring

### Frontend

- **Port**: 3000
- **Technology**: Next.js (static export) served by nginx
- **Depends on**: Backend (waits for backend to be healthy)

## Common Commands

```bash
# Start services
docker-compose up

# Start in background
docker-compose up -d

# Stop services
docker-compose down

# Stop and remove volumes (deletes database)
docker-compose down -v

# View logs
docker-compose logs

# Follow logs
docker-compose logs -f

# View logs for specific service
docker-compose logs backend
docker-compose logs frontend

# Rebuild images
docker-compose build

# Rebuild and restart
docker-compose up --build

# Check status
docker-compose ps

# Execute commands in containers
docker-compose exec backend sh
docker-compose exec frontend sh
```

## Development Workflow

### First Time Setup

```bash
# Build and start
docker-compose up --build -d

# Check logs to ensure everything started
docker-compose logs -f
```

### Making Changes

**Backend changes:**

```bash
# Rebuild backend only
docker-compose up -d --build backend
```

**Frontend changes:**

```bash
# Rebuild frontend only
docker-compose up -d --build frontend
```

**Both:**

```bash
# Rebuild all
docker-compose up --build
```

## Data Persistence

The SQLite database is stored in a Docker volume named `weight-data`. This means:

- Data persists across container restarts
- Data is retained when you stop and start services
- Data is only deleted when you run `docker-compose down -v`

### Backup Database

```bash
# Copy database out of container
docker-compose exec backend cat /data/weight-tracker.db > backup.db

# Or using docker cp
docker cp weight-tracker-backend:/data/weight-tracker.db ./backup.db
```

### Restore Database

```bash
# Copy database into container
docker cp ./backup.db weight-tracker-backend:/data/weight-tracker.db

# Restart backend to pick up changes
docker-compose restart backend
```

## Troubleshooting

### Backend won't start

```bash
# Check logs
docker-compose logs backend

# Common issues:
# - Port 8080 already in use
# - Database initialization failed
```

### Frontend can't connect to backend

```bash
# Verify backend is healthy
curl http://localhost:8080/health

# Check network connectivity
docker-compose exec frontend ping backend
```

### Reset everything

```bash
# Stop and remove all containers, networks, and volumes
docker-compose down -v

# Rebuild from scratch
docker-compose up --build
```

### View resource usage

```bash
docker-compose stats
```

## Network Configuration

Services communicate via the `weight-tracker-network` bridge network:

- Backend is accessible to frontend via hostname `backend:8080`
- Both services are exposed to host machine on their respective ports

## Environment Variables

### Backend

- `DATABASE_PATH`: Path to SQLite database file
- `PORT`: Server port
- `CORS_ORIGIN`: Allowed CORS origin
- `GIN_MODE`: Gin framework mode (release/debug)

### Frontend

- `NEXT_PUBLIC_API_URL`: Backend API URL for browser requests

## Production Considerations

This Docker Compose setup is designed for **local development**. For production:

- Use Kubernetes (see k8s/ directory)
- Configure proper secrets management
- Set up SSL/TLS certificates
- Use external database (PostgreSQL/MySQL)
- Implement proper logging and monitoring
- Add authentication and authorization

## Notes

- Frontend build uses static export (no Node.js runtime needed)
- Backend uses multi-stage build for smaller image size
- Health checks ensure services are ready before accepting traffic
- Volumes ensure data persistence
