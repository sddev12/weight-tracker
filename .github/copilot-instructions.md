# Copilot Instructions - Weight Tracker Application

## Project Overview

This is a weight tracking application designed to run locally in Minikube. It consists of a Next.js frontend (statically exported), Go/Gin backend API, and SQLite database, all deployed via Kubernetes manifests.

## Important: Always Consult Specifications

**Before implementing any feature or making changes, always refer to the comprehensive specifications in the `/specs` directory:**

### Functional Requirements

- **[specs/REQUIREMENTS.md](../specs/REQUIREMENTS.md)** - Core functional requirements, user flows, business rules, and feature specifications
  - Defines what the application should do
  - User stories and interaction patterns
  - Data model and calculations
  - Validation rules and error handling

### Technical Implementation Specifications

- **[specs/architecture.md](../specs/architecture.md)** - System architecture, component interactions, deployment strategy, and data flow
- **[specs/api-spec.md](../specs/api-spec.md)** - Complete REST API endpoints, request/response schemas, validation rules, and error handling
- **[specs/database-schema.md](../specs/database-schema.md)** - SQLite database schema, table structures, indexes, and query patterns
- **[specs/frontend-spec.md](../specs/frontend-spec.md)** - React components, UI flow, conversion logic, and styling guidelines
- **[specs/deployment-spec.md](../specs/deployment-spec.md)** - Kubernetes manifests, Docker configurations, and deployment workflow
- **[specs/diagrams.md](../specs/diagrams.md)** - Architecture diagrams and visual representations

**How to use these specs:**

1. Start with **REQUIREMENTS.md** to understand WHAT needs to be built
2. Refer to the technical specs to understand HOW to implement it in the web application architecture

## Technology Stack

### Frontend

- **Framework**: Next.js 14+ (App Router) with TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Date Handling**: date-fns
- **Deployment**: Static export served by nginx in Kubernetes

### Backend

- **Language**: Go 1.22+
- **Framework**: Gin web framework
- **Database**: SQLite with file-based storage
- **Container**: Alpine-based Docker image

### Infrastructure

- **Platform**: Minikube (local Kubernetes)
- **Storage**: PersistentVolume with HostPath
- **Services**: ClusterIP with port-forwarding for local access

## Key Design Decisions

### Functional Requirements (from REQUIREMENTS.md)

#### Core Features

- Add weight entries with date, stones, and pounds
- View historical entries in a sortable table
- Delete entries with confirmation
- Visualize weight trends over time with charts
- Display weights in multiple formats (stones/pounds, decimal stones, kilograms, total pounds)

#### Data Calculations

- **Total Pounds**: `(stones × 14) + pounds`
- **Decimal Stones**: `round((total_lbs ÷ 14) × 100) ÷ 100`
- **Kilograms**: `total_lbs × 0.45359237`

#### Business Rules

- Stones must be ≥ 0
- Pounds must be ≥ 0 and < 14 (by convention)
- Date format: ISO 8601 (YYYY-MM-DD) for storage
- Calculated fields (total_lbs, decimal_stones, kg) are computed, not stored
- Confirmation required before deleting entries

### Weight Storage

- **Store as**: Total pounds (single REAL field in database)
- **Input format**: Stones and pounds (user enters both)
- **Conversion formula**: `total_pounds = (stones × 14) + pounds`
- **Display formats**:
  - Imperial: Convert back to stones/pounds (`stones = floor(pounds / 14)`, `remaining = pounds % 14`)
  - Metric: Convert to kg (`kg = pounds × 0.453592`)

### Database Strategy

- SQLite file stored on PersistentVolume at `/data/weight-tracker.db`
- Auto-initialization on backend startup (creates schema if not exists)
- Single goal weight stored in settings table
- No migration framework initially (manual schema updates)

### Frontend Deployment

- Next.js static export (no server-side rendering needed)
- Served by nginx on port 3000
- API calls to backend at `http://localhost:8080/api/v1` (via port-forward)

### User Interface

- **Display Format**: Support both imperial (stones/pounds) and metric (kg) views
- **Table Columns**: Date, Stones, Pounds, Total (lbs), Decimal (st), Kilograms (kg)
- **Chart Features**: Line chart showing weight trends, min/max indicators, date range
- **Validation**: Client-side and server-side validation for all inputs
- **Feedback**: Clear success/error messages, confirmation dialogs for destructive actions

## Code Conventions

### Go Backend

- Use Gin framework for routing and middleware
- Database access through standard library `database/sql` with SQLite driver
- Enable CGO for SQLite support (`CGO_ENABLED=1`)
- CORS middleware configured for `http://localhost:3000`
- Health check endpoint at `/health`
- All API routes under `/api/v1` prefix

### TypeScript Frontend

- Use TypeScript for all components and utilities
- Functional components with React hooks
- Client-side state management (no Redux needed)
- API client in `lib/api.ts`
- Conversion utilities in `lib/dateUtils.ts` and similar
- Components in `components/` directory
- Follow Next.js App Router conventions

### Docker

- Multi-stage builds for both frontend and backend
- Backend: golang:1.22-alpine builder, alpine:latest runtime
- Frontend: node:20-alpine builder, nginx:alpine runtime
- Images built in Minikube's Docker daemon (`eval $(minikube docker-env)`)
- `imagePullPolicy: Never` in Kubernetes deployments

### Kubernetes

- All resources in `weight-tracker` namespace
- ConfigMap for backend environment variables
- PersistentVolume and PersistentVolumeClaim for SQLite
- ClusterIP services (internal only)
- Health probes on all deployments

## Critical Implementation Details

### Date Handling

- Store dates as ISO 8601 strings: `YYYY-MM-DD`
- Validate that dates are not in the future
- Allow only one weight entry per date (UNIQUE constraint)

### Date Range Filters

Predefined ranges for chart filtering:

- Last 7 days
- Last month (30 days)
- Last 3 months
- Last 6 months
- Last 9 months
- Last year (365 days)
- All time

### Goal Tracking

- Single goal weight value (not time-based goals)
- Stored in settings table with key `goal_weight`
- Display as horizontal reference line on chart
- Can be set, updated, or cleared (set to NULL)

### API Error Handling

- Use appropriate HTTP status codes (400, 404, 409, 500)
- Return JSON error responses with `error` and optional `details` fields
- 409 Conflict when creating duplicate date entries
- Validate all inputs before database operations

## Development Workflow

### Building Images

```bash
make build              # Build both frontend and backend
make build-backend      # Build backend only
make build-frontend     # Build frontend only
```

### Deploying

```bash
make deploy             # Deploy all Kubernetes resources
make port-forward       # Port-forward services to localhost
```

### Debugging

```bash
make logs-backend       # View backend logs
make logs-frontend      # View frontend logs
make status             # Show all resources
```

### Cleanup

```bash
make clean              # Delete namespace and all resources
make rebuild            # Clean, build, and deploy
```

## File Structure

```
weight-tracker/
├── specs/              # Detailed specifications (READ THESE FIRST)
├── backend/           # Go/Gin API
│   ├── main.go
│   ├── go.mod
│   ├── go.sum
│   └── Dockerfile
├── frontend/          # Next.js application
│   ├── app/
│   ├── components/
│   ├── lib/
│   ├── package.json
│   ├── next.config.js
│   ├── nginx.conf
│   └── Dockerfile
├── k8s/               # Kubernetes manifests
│   ├── namespace.yaml
│   ├── storage/
│   ├── backend/
│   └── frontend/
└── Makefile           # Build and deployment automation
```

## Testing Guidelines

### Backend Testing

- Test API endpoints with proper status codes
- Validate database operations (CRUD)
- Test date validation and constraints
- Test goal weight CRUD operations
- Test health check endpoint

### Frontend Testing

- Test unit conversion functions
- Test date range calculations
- Test component rendering
- Test form validation
- Test API integration

## Common Patterns

### Adding a New API Endpoint

1. Check [specs/api-spec.md](../specs/api-spec.md) for endpoint definition
2. Add route in Go backend with Gin
3. Implement handler with validation
4. Add database queries if needed
5. Update API client in `frontend/lib/api.ts`
6. Create/update frontend component to use endpoint

### Adding a New Component

1. Check [specs/frontend-spec.md](../specs/frontend-spec.md) for component spec
2. Create TypeScript component in `components/`
3. Define props interface
4. Implement with Tailwind CSS styling
5. Add unit conversion logic if needed
6. Import and use in page

### Modifying Database Schema

1. Update [specs/database-schema.md](../specs/database-schema.md)
2. Modify schema initialization in Go backend
3. Consider data migration strategy
4. Update API types/models
5. Update frontend TypeScript interfaces

## Security Notes

- No authentication implemented (local personal use)
- CORS restricted to localhost:3000
- Services not exposed outside cluster (ClusterIP)
- Access via port-forwarding only
- Validate all user inputs on backend

## Performance Considerations

- SQLite is sufficient for single-user workload
- Index on weights.date for fast date range queries
- Static frontend served efficiently by nginx
- Single replica deployments (no need for scaling)

## Important: Minikube-Specific

- Always use `eval $(minikube docker-env)` before building images
- Use `imagePullPolicy: Never` to use local images
- HostPath volumes for persistent storage
- Port-forward required for local access
- Cleanup with `make clean` to free resources

## When in Doubt

1. **Check the specs** - All architectural decisions and implementation details are documented
2. **Follow existing patterns** - Maintain consistency with established code structure
3. **Test locally** - Build and deploy to Minikube to verify changes
4. **Keep it simple** - This is a personal use application, avoid over-engineering
