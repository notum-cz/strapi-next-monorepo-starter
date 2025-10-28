
# 🐳 Docker Setup Guide

Complete Docker setup and usage guide for the Strapi Template monorepo.

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Build & Run](#build--run)
- [Docker Compose](#docker-compose)
- [Production Deployment](#production-deployment)
- [Troubleshooting](#troubleshooting)

---

## 🔧 Prerequisites

### Install Docker

**macOS/Windows:**
- Download [Docker Desktop](https://www.docker.com/products/docker-desktop)
- Install and start Docker Desktop

**Linux:**
```bash
# Ubuntu/Debian
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Start Docker
sudo systemctl start docker
sudo systemctl enable docker
```

### Verify Installation

```bash
docker --version
docker-compose --version
```

---

## 🚀 Quick Start

### 1. Build the Image

```bash
# Build production image
docker build -t strapi-template:latest .

# Build with build args
docker build \
  --build-arg NODE_ENV=production \
  -t strapi-template:latest .
```

### 2. Run the Container

```bash
# Basic run
docker run -p 1337:1337 strapi-template:latest

# With environment variables
docker run -p 1337:1337 \
  -e NODE_ENV=production \
  -e DATABASE_URL=postgres://user:pass@host:5432/db \
  strapi-template:latest

# With mounted volumes (for development)
docker run -p 1337:1337 \
  -v $(pwd)/services/cms:/app/services/cms \
  strapi-template:latest
```

### 3. Access the Application

Open browser to: `http://localhost:1337/admin`

---

## 🏗️ Build & Run

### Development Build

```bash
# Build development image
docker build -t strapi-template:dev \
  --target builder \
  .

# Run development container
docker run -it -p 1337:1337 \
  -v $(pwd):/app \
  -e NODE_ENV=development \
  strapi-template:dev \
  yarn dev
```

### Production Build

```bash
# Build optimized production image
docker build -t strapi-template:prod .

# Run production container
docker run -d \
  --name strapi-prod \
  -p 1337:1337 \
  --restart=unless-stopped \
  strapi-template:prod
```

### Multi-Platform Build

```bash
# Build for multiple platforms
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -t strapi-template:latest \
  .
```

---

## 🎼 Docker Compose

### Start All Services

```bash
# Start all services
docker-compose up

# Start in detached mode
docker-compose up -d

# Start specific services
docker-compose up stellar-agents browser-service

# Build and start
docker-compose up --build
```

### Manage Services

```bash
# View running containers
docker-compose ps

# View logs
docker-compose logs
docker-compose logs -f stellar-agents

# Stop services
docker-compose stop

# Stop and remove containers
docker-compose down

# Remove everything including volumes
docker-compose down -v
```

### Scale Services

```bash
# Scale specific service
docker-compose up --scale stellar-agents=3
```

---

## 📦 Production Deployment

### Using Docker Swarm

```bash
# Initialize swarm
docker swarm init

# Deploy stack
docker stack deploy -c docker-compose.yml strapi-stack

# View services
docker stack services strapi-stack

# Remove stack
docker stack rm strapi-stack
```

### Using Kubernetes

Create `k8s-deployment.yaml`:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: strapi-template
spec:
  replicas: 3
  selector:
    matchLabels:
      app: strapi
  template:
    metadata:
      labels:
        app: strapi
    spec:
      containers:
      - name: strapi
        image: strapi-template:latest
        ports:
        - containerPort: 1337
        env:
        - name: NODE_ENV
          value: production
        resources:
          requests:
            memory: "1Gi"
            cpu: "500m"
          limits:
            memory: "2Gi"
            cpu: "1"
---
apiVersion: v1
kind: Service
metadata:
  name: strapi-service
spec:
  type: LoadBalancer
  ports:
  - port: 80
    targetPort: 1337
  selector:
    app: strapi
```

Deploy:
```bash
kubectl apply -f k8s-deployment.yaml
```

---

## 🔍 Debugging

### Interactive Shell

```bash
# Access running container
docker exec -it strapi-prod sh

# Run commands inside container
docker exec strapi-prod yarn build
```

### View Logs

```bash
# View container logs
docker logs strapi-prod

# Follow logs in real-time
docker logs -f strapi-prod

# Last 100 lines
docker logs --tail 100 strapi-prod
```

### Inspect Container

```bash
# View container details
docker inspect strapi-prod

# View container stats
docker stats strapi-prod

# View processes
docker top strapi-prod
```

---

## 🧹 Cleanup

### Remove Containers

```bash
# Remove stopped container
docker rm strapi-prod

# Force remove running container
docker rm -f strapi-prod

# Remove all stopped containers
docker container prune
```

### Remove Images

```bash
# Remove specific image
docker rmi strapi-template:latest

# Remove dangling images
docker image prune

# Remove all unused images
docker image prune -a
```

### Full Cleanup

```bash
# Remove everything (containers, images, volumes, networks)
docker system prune -a --volumes

# Clean build cache
docker builder prune
```

---

## 🔐 Security Best Practices

### 1. Use Non-Root User

The Dockerfile already includes this:
```dockerfile
RUN addgroup --system --gid 1001 appuser
RUN adduser --system --uid 1001 appuser
USER appuser
```

### 2. Scan for Vulnerabilities

```bash
# Scan image
docker scan strapi-template:latest

# Using Trivy
trivy image strapi-template:latest
```

### 3. Use .dockerignore

Ensure sensitive files are excluded:
```
.env
.env.*
**/.git
**/.gitignore
**/node_modules
```

### 4. Secrets Management

```bash
# Use Docker secrets (Swarm)
echo "secret_value" | docker secret create db_password -

# Use in compose
services:
  app:
    secrets:
      - db_password
```

---

## 📊 Performance Optimization

### Build Optimization

```bash
# Use BuildKit
DOCKER_BUILDKIT=1 docker build -t strapi-template:latest .

# Enable inline cache
docker build \
  --build-arg BUILDKIT_INLINE_CACHE=1 \
  -t strapi-template:latest .
```

### Runtime Optimization

```bash
# Limit memory
docker run -m 2g strapi-template:latest

# Limit CPU
docker run --cpus="1.5" strapi-template:latest

# Set memory swap
docker run -m 2g --memory-swap 3g strapi-template:latest
```

---

## 🧪 Testing

### Test Build

```bash
# Build without cache
docker build --no-cache -t strapi-template:test .

# Test run
docker run --rm strapi-template:test yarn test
```

### Health Checks

```bash
# Check container health
docker inspect --format='{{.State.Health.Status}}' strapi-prod

# View health check logs
docker inspect --format='{{json .State.Health}}' strapi-prod | jq
```

---

## 📝 Tips & Tricks

### Speed Up Builds

1. **Order Dockerfile commands** by change frequency
2. **Use .dockerignore** to exclude unnecessary files
3. **Enable BuildKit** for better caching
4. **Use multi-stage builds** to minimize final image size

### Reduce Image Size

```bash
# Check image size
docker images strapi-template

# Use Alpine base images
FROM node:22-alpine

# Clean up in same layer
RUN apk add --no-cache build-deps \
    && yarn install \
    && apk del build-deps
```

### Development Workflow

```bash
# Watch for changes
docker-compose watch

# Hot reload
docker-compose up --watch
```

---

## 🆘 Troubleshooting

### Common Issues

**Issue**: Build fails with "No space left on device"
```bash
# Clean up
docker system prune -a --volumes
```

**Issue**: Container exits immediately
```bash
# Check logs
docker logs <container-id>

# Run interactively
docker run -it strapi-template:latest sh
```

**Issue**: Permission denied errors
```bash
# Fix permissions
docker run --user $(id -u):$(id -g) strapi-template:latest
```

**Issue**: Port already in use
```bash
# Use different port
docker run -p 3000:1337 strapi-template:latest

# Or kill process using port
lsof -ti:1337 | xargs kill -9
```

---

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Dockerfile Reference](https://docs.docker.com/engine/reference/builder/)

---

## ✅ Checklist

Before deploying to production:

- [ ] Build passes successfully
- [ ] Health checks are working
- [ ] Environment variables are set
- [ ] Secrets are properly managed
- [ ] Volumes are configured for persistence
- [ ] Logging is configured
- [ ] Monitoring is set up
- [ ] Security scan completed
- [ ] Backup strategy in place
- [ ] Rollback plan documented
