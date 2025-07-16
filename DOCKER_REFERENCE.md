# SP_Sim Docker Quick Reference

## Common Commands

### Development
```bash
# Start development environment
docker compose -f docker-compose.dev.yml up --build

# Stop development environment  
docker compose -f docker-compose.dev.yml down
```

### Production
```bash
# Simple production (after npm run build)
docker build -t sp_sim . && docker run -d --name sp_sim -p 80:80 sp_sim

# Production with nginx reverse proxy
TAG=latest docker compose -f docker-compose.prod.yml up -d

# Stop production
docker compose -f docker-compose.prod.yml down
```

### Health Checks
```bash
# Quick health check
curl http://localhost/health

# Comprehensive health check
./scripts/health-check-docker.sh all

# Check specific components
./scripts/health-check-docker.sh container
./scripts/health-check-docker.sh http
./scripts/health-check-docker.sh content
```

### Deployment Scripts
```bash
# Deploy to VPS
./scripts/deploy-docker.sh

# Rollback to previous version
./scripts/rollback-docker.sh previous

# Rollback to specific version  
./scripts/rollback-docker.sh version v1.2.3

# Interactive rollback
./scripts/rollback-docker.sh interactive
```

### Maintenance
```bash
# View logs
docker logs sp_sim_app

# Check resource usage
docker stats sp_sim_app

# Cleanup old images
docker image prune -f

# Update to latest image
docker pull ghcr.io/mcpolitics/sp_sim:latest
docker compose up -d
```

## Environment Variables

### Required for VPS Deployment
- `VPS_HOST` - Server hostname/IP
- `VPS_USERNAME` - SSH username
- `VPS_SSH_KEY` - Private SSH key
- `VPS_DEPLOY_PATH` - Deployment directory
- `VPS_SITE_URL` - Public URL

### Optional
- `TAG` - Docker image tag (default: latest)
- `NODE_ENV` - Environment mode (default: production)
- `CONTAINER_NAME` - Container name (default: sp_sim_app)

## File Structure

```
├── Dockerfile                 # Production (uses pre-built assets)
├── Dockerfile.full           # Full build (includes npm build)
├── docker-compose.yml        # Simple production
├── docker-compose.prod.yml   # Production + nginx
├── docker-compose.dev.yml    # Development environment
├── nginx.conf                # Nginx config for standalone
├── nginx/nginx.conf          # Reverse proxy config
└── scripts/
    ├── deploy-docker.sh      # VPS deployment
    ├── health-check-docker.sh # Health verification
    └── rollback-docker.sh    # Emergency rollback
```

## Port Mapping

- **Development**: 3000 → 80 (container)
- **Production**: 80 → 80 (container)  
- **Production + nginx**: 80,443 → 80 (nginx) → 80 (app)

## Health Endpoints

- `/health` - Simple health check (returns "healthy")
- `/` - Main application (returns HTML)

## GitHub Container Registry

Images are published to: `ghcr.io/mcpolitics/sp_sim:TAG`

Available tags:
- `latest` - Latest main branch build
- `main-<sha>` - Specific commit builds
- `v*` - Release versions