# Weight Tracker

A weight tracking application built with Go (backend) and Next.js (frontend), designed to run locally in Docker Compose or deployed to Kubernetes.

## Features

- 📊 Track weight entries over time
- 📈 Visualize weight trends with interactive charts
- 🎯 Set and track goal weight
- 🔄 Toggle between imperial (stones/pounds) and metric (kg) units
- 📅 Filter data by date ranges (7 days, 1/3/6/9/12 months, all time)
- ✏️ Edit and delete weight entries
- 💾 SQLite database for data persistence

## Quick Start (Docker Compose)

The easiest way to run the application locally:

```bash
# Clone the repository
git clone https://github.com/sddev12/weight-tracker.git
cd weight-tracker

# Start with Docker Compose
docker-compose up --build

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:8080
```

See [DOCKER-COMPOSE.md](DOCKER-COMPOSE.md) for detailed Docker Compose documentation.

## Technology Stack

### Backend

- **Language**: Go 1.22+
- **Framework**: Gin web framework
- **Database**: SQLite
- **Testing**: Go testing with 77%+ coverage

### Frontend

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Date Handling**: date-fns

### Infrastructure

- **Local Development**: Docker Compose
- **Production**: Kubernetes (Minikube)
- **Container Registry**: Docker

## Project Structure

```
weight-tracker/
├── backend/              # Go/Gin API
│   ├── db/              # Database initialization
│   ├── handlers/        # HTTP request handlers
│   ├── models/          # Data models
│   └── main.go          # Application entry point
├── frontend/            # Next.js application
│   ├── app/             # Next.js app router pages
│   ├── components/      # React components
│   └── lib/             # Utilities and API client
├── specs/               # Project specifications
├── k8s/                 # Kubernetes manifests (coming soon)
├── docker-compose.yml   # Docker Compose configuration
└── Makefile            # Build automation (coming soon)
```

## Documentation

- [Backend README](backend/README.md) - Backend API documentation
- [Frontend README](frontend/README.md) - Frontend application documentation
- [Docker Compose Guide](DOCKER-COMPOSE.md) - Local development with Docker
- [Specifications](specs/) - Detailed project specifications
  - [Requirements](specs/REQUIREMENTS.md) - Functional requirements
  - [Architecture](specs/architecture.md) - System architecture
  - [API Specification](specs/api-spec.md) - REST API endpoints
  - [Database Schema](specs/database-schema.md) - SQLite schema
  - [Frontend Spec](specs/frontend-spec.md) - Frontend implementation
  - [Deployment Spec](specs/deployment-spec.md) - Kubernetes deployment

## Development

### Prerequisites

- Docker and Docker Compose (recommended)
- OR Go 1.22+ and Node.js 20+ (for local development)

### Running Locally with Docker Compose

```bash
# Start all services
docker-compose up --build

# Stop services
docker-compose down

# View logs
docker-compose logs -f

# Reset database (removes all data)
docker-compose down -v
```

### Running Locally without Docker

**Backend:**

```bash
cd backend
go mod download
DATABASE_PATH=./weight-tracker.db go run main.go
# Server runs on http://localhost:8080
```

**Frontend:**

```bash
cd frontend
npm install
npm run dev
# Server runs on http://localhost:3000
```

## Testing

### Backend Tests

```bash
cd backend
go test ./... -v
go test ./... -cover
```

Coverage: 77%+ across handlers and database layer

## API Endpoints

### Weight Endpoints

- `GET /api/v1/weights` - List all weight entries
- `GET /api/v1/weights/:id` - Get single entry
- `POST /api/v1/weights` - Create new entry
- `PUT /api/v1/weights/:id` - Update entry
- `DELETE /api/v1/weights/:id` - Delete entry

### Goal Endpoints

- `GET /api/v1/goal` - Get goal weight
- `PUT /api/v1/goal` - Set/update goal weight

### Health Check

- `GET /health` - Health status

See [API Specification](specs/api-spec.md) for detailed documentation.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Ensure all tests pass
6. Submit a pull request

## License

MIT License - See LICENSE file for details

## Author

Built by sddev12

## Roadmap

- [x] Backend API with Go/Gin
- [x] SQLite database integration
- [x] Frontend with Next.js
- [x] Docker Compose setup
- [ ] Kubernetes deployment
- [ ] Makefile for automation
- [ ] CI/CD pipeline
- [ ] User authentication
- [ ] Mobile responsive improvements
- [ ] Data export (CSV, PDF)
- [ ] Progressive Web App (PWA)
