# Weight Tracker - Architecture Diagrams

## System Architecture

```mermaid
graph TB
    User[User Browser]

    subgraph Minikube["Minikube Cluster"]
        subgraph Namespace["weight-tracker namespace"]
            subgraph Frontend["Frontend Pod"]
                Nginx[nginx:alpine<br/>Port 3000]
                Static[Next.js Static Export]
                Nginx --> Static
            end

            subgraph Backend["Backend Pod"]
                API[Go/Gin API<br/>Port 8080]
            end

            subgraph Storage["Persistent Storage"]
                PV[PersistentVolume<br/>HostPath]
                PVC[PersistentVolumeClaim]
                DB[(SQLite Database<br/>/data/weight-tracker.db)]
                PV --> PVC
                PVC --> DB
            end

            FrontendSvc[Frontend Service<br/>ClusterIP:3000]
            BackendSvc[Backend Service<br/>ClusterIP:8080]

            Nginx -.-> FrontendSvc
            API -.-> BackendSvc
            API --> DB
        end
    end

    User -->|Port Forward 3000| FrontendSvc
    User -->|Port Forward 8080| BackendSvc
    Nginx -->|HTTP API Calls| API

    style Frontend fill:#e1f5ff
    style Backend fill:#fff4e1
    style Storage fill:#f0f0f0
    style Minikube fill:#e8f5e9
```

## Component Interaction Flow

### Weight Entry Creation Flow

```mermaid
sequenceDiagram
    actor User
    participant UI as Next.js UI
    participant API as Go/Gin API
    participant DB as SQLite DB

    User->>UI: Enter date, stones, pounds
    UI->>UI: Validate inputs
    UI->>UI: Convert to total pounds<br/>(stones × 14) + pounds
    UI->>API: POST /api/v1/weights<br/>{date, pounds}
    API->>API: Validate date (not future)
    API->>API: Validate pounds > 0
    API->>DB: INSERT INTO weights
    alt Success
        DB-->>API: Entry created
        API-->>UI: 201 Created {id, date, pounds}
        UI-->>User: Show success message
        UI->>API: GET /api/v1/weights?start_date&end_date
        API->>DB: SELECT with date filter
        DB-->>API: Weight entries
        API-->>UI: {weights: [...]}
        UI->>UI: Convert pounds to display unit
        UI-->>User: Update chart & list
    else Duplicate Date
        DB-->>API: UNIQUE constraint violation
        API-->>UI: 409 Conflict
        UI-->>User: Show error: entry exists
    end
```

### Goal Weight Management Flow

```mermaid
sequenceDiagram
    actor User
    participant UI as Next.js UI
    participant API as Go/Gin API
    participant DB as SQLite DB

    User->>UI: Click "Set Goal"
    UI->>API: GET /api/v1/goal
    API->>DB: SELECT value FROM settings<br/>WHERE key='goal_weight'
    DB-->>API: Current goal or NULL
    API-->>UI: {pounds: 154.0}
    UI->>UI: Convert pounds to stones/pounds
    UI-->>User: Show modal with current goal

    User->>UI: Enter new goal (stones/pounds)
    UI->>UI: Convert to total pounds
    UI->>API: PUT /api/v1/goal<br/>{pounds: 168.0}
    API->>API: Validate pounds > 0 or NULL
    API->>DB: UPDATE settings<br/>SET value=pounds<br/>WHERE key='goal_weight'
    DB-->>API: Updated
    API-->>UI: {pounds: 168.0}
    UI-->>User: Update chart goal line
```

### Chart Filtering Flow

```mermaid
sequenceDiagram
    actor User
    participant UI as Next.js UI
    participant Filter as Date Range Filter
    participant API as Go/Gin API
    participant DB as SQLite DB

    User->>Filter: Select "Last 3 months"
    Filter->>Filter: Calculate start_date<br/>(today - 90 days)
    Filter->>API: GET /api/v1/weights<br/>?start_date=2025-10-27<br/>&end_date=2026-01-27
    API->>DB: SELECT * FROM weights<br/>WHERE date >= ? AND date <= ?<br/>ORDER BY date DESC
    DB-->>API: Filtered entries
    API-->>UI: {weights: [...]}
    UI->>UI: Convert based on unit toggle<br/>(imperial/metric)
    UI-->>User: Render updated chart
```

## Database Schema

```mermaid
erDiagram
    WEIGHTS {
        INTEGER id PK "AUTOINCREMENT"
        TEXT date UK "YYYY-MM-DD, NOT NULL"
        REAL pounds "NOT NULL, > 0"
        TEXT created_at "ISO 8601 timestamp"
        TEXT updated_at "ISO 8601 timestamp"
    }

    SETTINGS {
        TEXT key PK "Setting identifier"
        TEXT value "NULL allowed"
        TEXT updated_at "ISO 8601 timestamp"
    }

    WEIGHTS ||--o{ SETTINGS : "independent"
```

### Database Indexes

```mermaid
graph LR
    A[weights table] --> B[PRIMARY KEY: id]
    A --> C[UNIQUE INDEX: date]
    A --> D[INDEX: idx_weights_date<br/>date DESC]

    E[settings table] --> F[PRIMARY KEY: key]

    style A fill:#e1f5ff
    style E fill:#e1f5ff
```

## Kubernetes Resource Architecture

```mermaid
graph TB
    subgraph Namespace["Namespace: weight-tracker"]
        subgraph FrontendResources["Frontend Resources"]
            FD[Deployment: frontend<br/>Replicas: 1]
            FS[Service: frontend<br/>Type: ClusterIP<br/>Port: 3000]
            FP[Pod: frontend-xxx<br/>Image: weight-tracker-frontend:latest<br/>imagePullPolicy: Never]

            FD --> FP
            FS --> FP
        end

        subgraph BackendResources["Backend Resources"]
            BD[Deployment: backend<br/>Replicas: 1]
            BS[Service: backend<br/>Type: ClusterIP<br/>Port: 8080]
            BP[Pod: backend-xxx<br/>Image: weight-tracker-backend:latest<br/>imagePullPolicy: Never]
            BCM[ConfigMap: backend-config<br/>DATABASE_PATH<br/>PORT<br/>CORS_ORIGIN]

            BD --> BP
            BS --> BP
            BCM -.->|env vars| BP
        end

        subgraph StorageResources["Storage Resources"]
            PV[PersistentVolume<br/>weight-tracker-pv<br/>1Gi, HostPath<br/>/data/weight-tracker]
            PVC[PersistentVolumeClaim<br/>weight-tracker-pvc<br/>1Gi, ReadWriteOnce]

            PV --> PVC
            PVC -.->|mounted at /data| BP
        end
    end

    subgraph LocalAccess["Local Access"]
        PF1[Port Forward: 3000:3000]
        PF2[Port Forward: 8080:8080]
    end

    PF1 --> FS
    PF2 --> BS

    style FrontendResources fill:#e1f5ff
    style BackendResources fill:#fff4e1
    style StorageResources fill:#f0f0f0
```

## Data Conversion Flow

```mermaid
graph TB
    subgraph Input["User Input"]
        A[Stones: 12]
        B[Pounds: 2]
    end

    subgraph Conversion["Frontend Conversion"]
        C[Total Pounds = stones × 14 + pounds]
        D[Total Pounds = 170]
    end

    subgraph Storage["Database Storage"]
        E[(SQLite: pounds REAL<br/>Value: 170.0)]
    end

    subgraph Display["Display Conversion"]
        F{Unit Toggle}
        G[Imperial:<br/>stones = floor 170 / 14 = 12<br/>pounds = 170 % 14 = 2<br/>Display: 12 st 2 lbs]
        H[Metric:<br/>kg = 170 × 0.453592<br/>Display: 77.11 kg]
    end

    A --> C
    B --> C
    C --> D
    D -->|API POST/PUT| E
    E -->|API GET| F
    F -->|imperial| G
    F -->|metric| H

    style Input fill:#e8f5e9
    style Conversion fill:#fff4e1
    style Storage fill:#e1f5ff
    style Display fill:#f3e5f5
```

## API Request/Response Flow

```mermaid
graph LR
    subgraph Client["Frontend Client"]
        A[fetch API]
    end

    subgraph CORS["CORS Middleware"]
        B[Check Origin<br/>http://localhost:3000]
    end

    subgraph Router["Gin Router"]
        C[/api/v1/weights]
        D[/api/v1/weights/:id]
        E[/api/v1/goal]
        F[/health]
    end

    subgraph Handlers["Request Handlers"]
        G[Validate Input]
        H[Database Query]
        I[Format Response]
    end

    subgraph Database["SQLite"]
        J[(weight-tracker.db)]
    end

    A --> B
    B --> C
    B --> D
    B --> E
    B --> F
    C --> G
    D --> G
    E --> G
    G --> H
    H --> J
    J --> I
    I --> A

    style Client fill:#e1f5ff
    style CORS fill:#fff4e1
    style Router fill:#f0f0f0
    style Handlers fill:#e8f5e9
    style Database fill:#f3e5f5
```

## Deployment Workflow

```mermaid
graph TB
    A[Start Minikube] --> B[eval $(minikube docker-env)]
    B --> C[Build Backend Image<br/>docker build -t weight-tracker-backend:latest]
    B --> D[Build Frontend Image<br/>docker build -t weight-tracker-frontend:latest]

    C --> E[kubectl apply -f k8s/namespace.yaml]
    D --> E

    E --> F[kubectl apply -f k8s/storage/]
    F --> G[kubectl apply -f k8s/backend/]
    G --> H[kubectl apply -f k8s/frontend/]

    H --> I{Pods Ready?}
    I -->|No| J[Wait for readiness probes]
    J --> I
    I -->|Yes| K[kubectl port-forward svc/frontend 3000:3000]
    I -->|Yes| L[kubectl port-forward svc/backend 8080:8080]

    K --> M[Access http://localhost:3000]
    L --> M

    style A fill:#e8f5e9
    style B fill:#fff4e1
    style C fill:#e1f5ff
    style D fill:#e1f5ff
    style M fill:#c8e6c9
```

## Health Check Flow

```mermaid
sequenceDiagram
    participant K8s as Kubernetes
    participant Pod as Backend Pod
    participant API as Go/Gin API
    participant DB as SQLite

    Note over K8s: Liveness Probe<br/>every 30s after 10s delay
    K8s->>API: GET /health
    API->>DB: Test connection
    alt Database Healthy
        DB-->>API: Connected
        API-->>K8s: 200 OK<br/>{status: "healthy",<br/>database: "connected"}
        Note over K8s: Pod is healthy
    else Database Error
        DB-->>API: Connection failed
        API-->>K8s: 500 Error
        Note over K8s: Restart pod
        K8s->>Pod: Kill and restart
    end

    Note over K8s: Readiness Probe<br/>every 10s after 5s delay
    K8s->>API: GET /health
    API->>DB: Test connection
    alt Ready
        DB-->>API: Connected
        API-->>K8s: 200 OK
        Note over K8s: Route traffic to pod
    else Not Ready
        API-->>K8s: Non-200 status
        Note over K8s: Remove from service endpoints
    end
```
