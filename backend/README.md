# Weight Tracker Backend

Go/Gin REST API backend for the Weight Tracker application.

## Technology Stack

- **Language**: Go 1.22+
- **Framework**: Gin web framework
- **Database**: SQLite (file-based)
- **CORS**: gin-contrib/cors

## Project Structure

```
backend/
├── main.go              # Application entry point
├── db/
│   ├── database.go      # Database connection and initialization
│   └── schema.sql       # SQL schema reference
├── handlers/
│   ├── weights.go       # Weight CRUD endpoints
│   ├── goal.go          # Goal management endpoints
│   └── health.go        # Health check endpoint
├── models/
│   └── models.go        # Data models and DTOs
├── Dockerfile           # Docker build configuration
├── go.mod               # Go module dependencies
└── go.sum               # Dependency checksums
```

## API Endpoints

### Health Check

- `GET /health` - Health check with database status

### Weights

- `GET /api/v1/weights` - List all weight entries (with optional date filtering)
- `GET /api/v1/weights/:id` - Get a single weight entry
- `POST /api/v1/weights` - Create a new weight entry
- `PUT /api/v1/weights/:id` - Update a weight entry
- `DELETE /api/v1/weights/:id` - Delete a weight entry

### Goal

- `GET /api/v1/goal` - Get goal weight
- `PUT /api/v1/goal` - Set/update goal weight

## Environment Variables

- `DATABASE_PATH` - Path to SQLite database file (default: `/data/weight-tracker.db`)
- `PORT` - Server port (default: `8080`)
- `CORS_ORIGIN` - Allowed CORS origin (default: `http://localhost:3000`)
- `GIN_MODE` - Gin mode: debug/release (default: `release`)

## Development

### Prerequisites

- Go 1.22 or higher
- SQLite3 (for local development)

### Local Development

```bash
# Install dependencies
go mod download

# Run locally
DATABASE_PATH=./weight-tracker.db PORT=8080 go run main.go
```

### Build

```bash
# Build binary (CGO required for SQLite)
CGO_ENABLED=1 go build -o weight-tracker-api .

# Run binary
./weight-tracker-api
```

### Docker Build

```bash
# For Minikube deployment
eval $(minikube docker-env)
docker build -t weight-tracker-backend:latest .
```

## Database

The application uses SQLite with automatic schema initialization on startup. The database file is stored at the path specified by `DATABASE_PATH`.

### Schema

- `weights` table - Stores weight entries
- `settings` table - Stores application settings (goal weight)

See `db/schema.sql` for the complete schema definition.

## Testing

```bash
# Run tests
go test ./...

# Run tests with coverage
go test -cover ./...
```

## Notes

- SQLite requires CGO to be enabled during compilation
- The application automatically creates the database schema on first run
- CORS is configured to allow requests from the frontend origin
- All dates are stored in ISO 8601 format (YYYY-MM-DD)
- Timestamps are stored in UTC
