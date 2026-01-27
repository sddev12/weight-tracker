# Weight Tracker - System Architecture

## Overview

A simple weight tracking application running locally in Minikube with three main components: Next.js frontend (statically exported), Go/Gin backend API, and SQLite database.

## System Components

### 1. Frontend (Next.js + nginx)

- **Technology**: Next.js with static export, served by nginx
- **Responsibility**: User interface for weight entry, visualization, and goal tracking
- **Deployment**: Kubernetes Deployment with nginx container serving static files
- **Port**: 3000 (nginx)

### 2. Backend API (Go + Gin)

- **Technology**: Go with Gin web framework
- **Responsibility**: REST API for CRUD operations on weight entries and goal management
- **Deployment**: Kubernetes Deployment with Go application container
- **Port**: 8080
- **Database**: SQLite file mounted via PersistentVolume

### 3. Database (SQLite)

- **Technology**: SQLite (file-based database)
- **Responsibility**: Persistent storage for weight entries and settings
- **Deployment**: File stored on PersistentVolume mounted to backend container
- **Location**: `/data/weight-tracker.db`

## Component Interactions

```
User Browser
    ↓ HTTP
[nginx Frontend] (Port 3000)
    ↓ HTTP/REST API
[Go Backend API] (Port 8080)
    ↓ File I/O
[SQLite Database] (PersistentVolume at /data)
```

## Data Flow

### Weight Entry Creation

1. User enters date, stones, and pounds in frontend
2. Frontend converts to total pounds and sends POST request to backend API
3. Backend validates data and inserts into SQLite database
4. Backend returns success response with created entry
5. Frontend refreshes weight list and chart

### Weight Visualization

1. User selects date range filter (7 days, 1/3/6/9/12 months)
2. Frontend requests weight entries from backend API with date range
3. Backend queries SQLite and returns filtered entries
4. Frontend converts pounds to selected unit (stones/pounds or kg)
5. Frontend renders chart with data points and goal line

### Goal Management

1. User sets goal weight in stones/pounds
2. Frontend converts to pounds and sends PUT request to backend
3. Backend updates goal in settings table
4. Frontend displays goal line on chart

## Storage Strategy

### SQLite Persistence

- SQLite database file stored on Kubernetes PersistentVolume
- Volume mounted to backend pod at `/data`
- Database survives pod restarts and redeployments
- HostPath volume type for Minikube (local development)

### Schema Initialization

- Backend application checks for table existence on startup
- Auto-creates schema if tables don't exist
- Ensures database is ready for first use without manual setup

## Deployment Architecture

### Kubernetes Resources

#### Frontend

- **Deployment**: 1 replica of nginx serving static Next.js build
- **Service**: ClusterIP exposing port 3000
- **Access**: Port-forward for local access

#### Backend

- **Deployment**: 1 replica of Go application
- **Service**: ClusterIP exposing port 8080
- **Volume Mount**: PersistentVolumeClaim at /data
- **Environment**: Database path configuration

#### Storage

- **PersistentVolume**: HostPath volume for SQLite file
- **PersistentVolumeClaim**: Claimed by backend deployment
- **Capacity**: 1Gi (more than sufficient for weight data)

## Development Workflow

1. Build Docker images using Minikube's Docker daemon
2. Apply Kubernetes manifests to Minikube cluster
3. Port-forward services for local access
4. Access frontend via http://localhost:3000
5. Backend API available at http://localhost:8080

## Security Considerations

- CORS configuration in backend to allow frontend origin
- Input validation on all API endpoints
- Date validation to prevent future dates
- Positive number validation for weight values

## Scalability Notes

For personal use, single replicas are sufficient. The SQLite file-based approach works well for:

- Single user access patterns
- Low concurrent write operations
- Simple backup/restore (copy single file)

## Backup Strategy

SQLite database can be backed up by:

1. Copying `/data/weight-tracker.db` file from PersistentVolume
2. Using `sqlite3` backup command
3. Exporting data via API endpoint (future enhancement)
