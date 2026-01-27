# Weight Tracker - Deployment Specification

## Deployment Target

**Platform:** Minikube (local Kubernetes cluster)

## Kubernetes Resources

### Namespace

**File:** `k8s/namespace.yaml`

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: weight-tracker
```

All resources deployed to `weight-tracker` namespace.

### Storage Resources

#### PersistentVolume

**File:** `k8s/storage/persistent-volume.yaml`

```yaml
apiVersion: v1
kind: PersistentVolume
metadata:
  name: weight-tracker-pv
  namespace: weight-tracker
spec:
  capacity:
    storage: 1Gi
  accessModes:
    - ReadWriteOnce
  hostPath:
    path: /data/weight-tracker
    type: DirectoryOrCreate
  storageClassName: standard
```

**Details:**

- Capacity: 1Gi (sufficient for SQLite database)
- Access Mode: ReadWriteOnce (single node access)
- Host Path: `/data/weight-tracker` on Minikube VM
- Storage Class: standard (Minikube default)

#### PersistentVolumeClaim

**File:** `k8s/storage/persistent-volume-claim.yaml`

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: weight-tracker-pvc
  namespace: weight-tracker
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 1Gi
  storageClassName: standard
```

**Details:**

- Requested: 1Gi
- Bound to: weight-tracker-pv
- Used by: backend deployment

### Backend Deployment

#### ConfigMap

**File:** `k8s/backend/configmap.yaml`

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: backend-config
  namespace: weight-tracker
data:
  DATABASE_PATH: '/data/weight-tracker.db'
  PORT: '8080'
  CORS_ORIGIN: 'http://localhost:3000'
```

#### Deployment

**File:** `k8s/backend/deployment.yaml`

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend
  namespace: weight-tracker
  labels:
    app: backend
spec:
  replicas: 1
  selector:
    matchLabels:
      app: backend
  template:
    metadata:
      labels:
        app: backend
    spec:
      containers:
        - name: backend
          image: weight-tracker-backend:latest
          imagePullPolicy: Never
          ports:
            - containerPort: 8080
          env:
            - name: DATABASE_PATH
              valueFrom:
                configMapKeyRef:
                  name: backend-config
                  key: DATABASE_PATH
            - name: PORT
              valueFrom:
                configMapKeyRef:
                  name: backend-config
                  key: PORT
            - name: CORS_ORIGIN
              valueFrom:
                configMapKeyRef:
                  name: backend-config
                  key: CORS_ORIGIN
          volumeMounts:
            - name: data
              mountPath: /data
          livenessProbe:
            httpGet:
              path: /health
              port: 8080
            initialDelaySeconds: 10
            periodSeconds: 30
          readinessProbe:
            httpGet:
              path: /health
              port: 8080
            initialDelaySeconds: 5
            periodSeconds: 10
      volumes:
        - name: data
          persistentVolumeClaim:
            claimName: weight-tracker-pvc
```

**Details:**

- Image: weight-tracker-backend:latest (built locally)
- Image Pull Policy: Never (uses Minikube's Docker daemon)
- Replicas: 1 (single instance for SQLite)
- Volume Mount: PVC mounted at `/data`
- Health Checks: Liveness and readiness probes on `/health`

#### Service

**File:** `k8s/backend/service.yaml`

```yaml
apiVersion: v1
kind: Service
metadata:
  name: backend
  namespace: weight-tracker
spec:
  selector:
    app: backend
  ports:
    - name: http
      port: 8080
      targetPort: 8080
      protocol: TCP
  type: ClusterIP
```

**Details:**

- Type: ClusterIP (internal only)
- Port: 8080
- Selector: app=backend

### Frontend Deployment

#### Deployment

**File:** `k8s/frontend/deployment.yaml`

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: frontend
  namespace: weight-tracker
  labels:
    app: frontend
spec:
  replicas: 1
  selector:
    matchLabels:
      app: frontend
  template:
    metadata:
      labels:
        app: frontend
    spec:
      containers:
        - name: frontend
          image: weight-tracker-frontend:latest
          imagePullPolicy: Never
          ports:
            - containerPort: 3000
          livenessProbe:
            httpGet:
              path: /
              port: 3000
            initialDelaySeconds: 10
            periodSeconds: 30
          readinessProbe:
            httpGet:
              path: /
              port: 3000
            initialDelaySeconds: 5
            periodSeconds: 10
```

**Details:**

- Image: weight-tracker-frontend:latest (built locally)
- Image Pull Policy: Never (uses Minikube's Docker daemon)
- Replicas: 1
- Health Checks: Liveness and readiness probes on `/`

#### Service

**File:** `k8s/frontend/service.yaml`

```yaml
apiVersion: v1
kind: Service
metadata:
  name: frontend
  namespace: weight-tracker
spec:
  selector:
    app: frontend
  ports:
    - name: http
      port: 3000
      targetPort: 3000
      protocol: TCP
  type: ClusterIP
```

**Details:**

- Type: ClusterIP (internal only)
- Port: 3000
- Selector: app=frontend

## Docker Images

### Backend Dockerfile

**File:** `backend/Dockerfile`

```dockerfile
# Build stage
FROM golang:1.22-alpine AS builder

WORKDIR /app

# Copy go mod files
COPY go.mod go.sum ./
RUN go mod download

# Copy source code
COPY . .

# Build binary
RUN CGO_ENABLED=1 GOOS=linux go build -o weight-tracker-api .

# Runtime stage
FROM alpine:latest

RUN apk --no-cache add ca-certificates sqlite-libs

WORKDIR /root/

# Copy binary from builder
COPY --from=builder /app/weight-tracker-api .

# Expose port
EXPOSE 8080

# Run binary
CMD ["./weight-tracker-api"]
```

**Build Command:**

```bash
eval $(minikube docker-env)
docker build -t weight-tracker-backend:latest ./backend
```

### Frontend Dockerfile

**File:** `frontend/Dockerfile`

```dockerfile
# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Build static export
RUN npm run build

# Runtime stage
FROM nginx:alpine

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy static files
COPY --from=builder /app/out /usr/share/nginx/html

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]
```

**Frontend nginx.conf:**

```nginx
server {
    listen 3000;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ $uri.html /index.html;
    }

    # Disable caching for index.html
    location = /index.html {
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }
}
```

**Build Command:**

```bash
eval $(minikube docker-env)
docker build -t weight-tracker-frontend:latest ./frontend
```

## Deployment Workflow

### Prerequisites

```bash
# Start Minikube
minikube start

# Enable necessary addons (optional)
minikube addons enable metrics-server
```

### Build and Deploy

**File:** `Makefile`

```makefile
.PHONY: build-backend build-frontend build deploy clean port-forward logs

# Set Docker to use Minikube's daemon
docker-env:
	@eval $$(minikube docker-env)

# Build backend image
build-backend:
	@echo "Building backend image..."
	eval $$(minikube docker-env) && docker build -t weight-tracker-backend:latest ./backend

# Build frontend image
build-frontend:
	@echo "Building frontend image..."
	eval $$(minikube docker-env) && docker build -t weight-tracker-frontend:latest ./frontend

# Build all images
build: build-backend build-frontend

# Deploy to Kubernetes
deploy:
	@echo "Deploying to Minikube..."
	kubectl apply -f k8s/namespace.yaml
	kubectl apply -f k8s/storage/
	kubectl apply -f k8s/backend/
	kubectl apply -f k8s/frontend/
	@echo "Waiting for pods to be ready..."
	kubectl wait --for=condition=ready pod -l app=backend -n weight-tracker --timeout=60s
	kubectl wait --for=condition=ready pod -l app=frontend -n weight-tracker --timeout=60s
	@echo "Deployment complete!"

# Port forward services
port-forward:
	@echo "Port forwarding frontend to localhost:3000..."
	@echo "Port forwarding backend to localhost:8080..."
	kubectl port-forward -n weight-tracker svc/frontend 3000:3000 & \
	kubectl port-forward -n weight-tracker svc/backend 8080:8080

# View logs
logs-backend:
	kubectl logs -f -n weight-tracker -l app=backend

logs-frontend:
	kubectl logs -f -n weight-tracker -l app=frontend

# Clean up deployment
clean:
	kubectl delete namespace weight-tracker

# Full rebuild and deploy
rebuild: clean build deploy

# Show status
status:
	kubectl get all -n weight-tracker
```

### Deployment Steps

1. **Start Minikube:**

   ```bash
   minikube start
   ```

2. **Build Docker images:**

   ```bash
   make build
   ```

3. **Deploy to Kubernetes:**

   ```bash
   make deploy
   ```

4. **Port forward services:**

   ```bash
   make port-forward
   ```

5. **Access application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8080

6. **View logs:**

   ```bash
   make logs-backend
   make logs-frontend
   ```

7. **Clean up:**
   ```bash
   make clean
   ```

## Accessing the Application

### Port Forwarding

```bash
# Frontend
kubectl port-forward -n weight-tracker svc/frontend 3000:3000

# Backend (optional, for direct API access)
kubectl port-forward -n weight-tracker svc/backend 8080:8080
```

### Service URLs (within cluster)

- Frontend: http://frontend.weight-tracker.svc.cluster.local:3000
- Backend: http://backend.weight-tracker.svc.cluster.local:8080

## Monitoring and Debugging

### Check Pod Status

```bash
kubectl get pods -n weight-tracker
```

### View Logs

```bash
# Backend
kubectl logs -f -n weight-tracker -l app=backend

# Frontend
kubectl logs -f -n weight-tracker -l app=frontend
```

### Describe Resources

```bash
kubectl describe deployment backend -n weight-tracker
kubectl describe pod <pod-name> -n weight-tracker
```

### Access Pod Shell

```bash
kubectl exec -it -n weight-tracker <pod-name> -- /bin/sh
```

### Check PVC Binding

```bash
kubectl get pv,pvc -n weight-tracker
```

## Backup and Restore

### Backup SQLite Database

```bash
# Get backend pod name
POD=$(kubectl get pod -n weight-tracker -l app=backend -o jsonpath='{.items[0].metadata.name}')

# Copy database file from pod
kubectl cp weight-tracker/$POD:/data/weight-tracker.db ./backup/weight-tracker-$(date +%Y%m%d).db
```

### Restore SQLite Database

```bash
# Get backend pod name
POD=$(kubectl get pod -n weight-tracker -l app=backend -o jsonpath='{.items[0].metadata.name}')

# Copy database file to pod
kubectl cp ./backup/weight-tracker-20260127.db weight-tracker/$POD:/data/weight-tracker.db

# Restart pod to pick up changes
kubectl rollout restart deployment/backend -n weight-tracker
```

## Troubleshooting

### Images Not Found

- Ensure you've run `eval $(minikube docker-env)` before building
- Verify `imagePullPolicy: Never` in deployments

### PVC Not Binding

- Check PV and PVC status: `kubectl get pv,pvc -n weight-tracker`
- Ensure storage class matches: `standard`

### Backend Can't Write to Database

- Check volume mount: `kubectl describe pod <backend-pod> -n weight-tracker`
- Verify file permissions in pod: `kubectl exec -it <pod> -- ls -la /data`

### Frontend Can't Reach Backend

- Verify backend service DNS: `backend.weight-tracker.svc.cluster.local:8080`
- Check CORS configuration in backend
- Ensure `NEXT_PUBLIC_API_URL` points to port-forwarded backend

## Security Considerations

### Current Implementation

- No authentication (local use only)
- ClusterIP services (not exposed externally)
- Port forwarding for local access

### Future Enhancements

- Ingress controller for external access
- TLS/HTTPS certificates
- Authentication/authorization
- Network policies
