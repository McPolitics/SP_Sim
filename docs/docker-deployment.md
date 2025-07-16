# Docker Deployment Guide for SP_Sim

This guide covers Docker-based deployment of SP_Sim for both development and production environments, including VPS deployment via CI/CD.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Development Environment](#development-environment)
- [Production Deployment](#production-deployment)
- [VPS Deployment via CI/CD](#vps-deployment-via-cicd)
- [Manual VPS Deployment](#manual-vps-deployment)
- [Health Monitoring](#health-monitoring)
- [Troubleshooting](#troubleshooting)

## Prerequisites

- **Docker**: Version 20.10 or higher
- **Docker Compose**: Version 2.0 or higher
- **Node.js**: Version 22.x (for local builds)
- **VPS Access**: SSH access for server deployments

## Development Environment

### Quick Start

```bash
# Build and start development environment
docker compose -f docker-compose.dev.yml up --build

# Access the application
open http://localhost:3000
```

### Development Features

- **Hot Reload**: File changes trigger automatic rebuilds
- **Debug Mode**: Enhanced logging and development tools
- **Source Maps**: For debugging in browser dev tools

### Development Commands

```bash
# Build development image
docker compose -f docker-compose.dev.yml build

# Start in background
docker compose -f docker-compose.dev.yml up -d

# View logs
docker compose -f docker-compose.dev.yml logs -f

# Stop and cleanup
docker compose -f docker-compose.dev.yml down
```

## Production Deployment

### Simple Production Setup

For single-server production deployment:

```bash
# 1. Build the application locally
npm ci
npm run build

# 2. Build and start production container
docker build -t sp_sim .
docker run -d --name sp_sim -p 80:80 sp_sim

# 3. Verify deployment
curl http://localhost/health
```

### Production with Load Balancer

For scalable production with nginx reverse proxy:

```bash
# Set the image tag (defaults to 'latest')
export TAG=v1.0.0

# Start production environment
docker compose -f docker-compose.prod.yml up -d

# Check status
docker compose -f docker-compose.prod.yml ps
```

### Production Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `TAG` | Docker image tag to deploy | `latest` |
| `NODE_ENV` | Environment mode | `production` |

## VPS Deployment via CI/CD

### GitHub Actions Setup

The repository includes automated VPS deployment. Configure these GitHub secrets:

| Secret | Description | Example |
|--------|-------------|---------|
| `VPS_HOST` | VPS hostname or IP | `your-server.com` |
| `VPS_USERNAME` | SSH username | `deploy` |
| `VPS_SSH_KEY` | Private SSH key | `-----BEGIN OPENSSH PRIVATE KEY-----...` |
| `VPS_DEPLOY_PATH` | Deployment directory | `/opt/sp_sim` |
| `VPS_SITE_URL` | Public URL for health checks | `https://your-domain.com` |

### Automatic Deployment Flow

1. **Push to main branch** triggers the deployment pipeline
2. **Build and test** - Runs linting, tests, and builds the application
3. **Docker build** - Creates and pushes image to GitHub Container Registry
4. **Security scan** - Scans image for vulnerabilities with Trivy
5. **VPS deployment** - Deploys to server using Docker Compose
6. **Health checks** - Verifies deployment success
7. **Rollback** - Automatic rollback on failure

### Deployment Verification

The CI/CD pipeline includes comprehensive verification:

- ✅ Container health status
- ✅ HTTP endpoint accessibility  
- ✅ Content integrity checks
- ✅ Response time monitoring
- ✅ Resource usage validation

## Manual VPS Deployment

### Server Preparation

1. **Install Docker and Docker Compose** on your VPS:

```bash
# Ubuntu/Debian
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

2. **Create deployment directory**:

```bash
sudo mkdir -p /opt/sp_sim
sudo chown $USER:$USER /opt/sp_sim
```

### Manual Deployment Steps

1. **Copy deployment files to server**:

```bash
scp -r docker-compose.yml nginx/ scripts/ user@your-server:/opt/sp_sim/
```

2. **Deploy using the deployment script**:

```bash
ssh user@your-server << 'EOF'
cd /opt/sp_sim

# Set environment variables
export TAG=latest
export VPS_DEPLOY_PATH=/opt/sp_sim
export VPS_SITE_URL=https://your-domain.com

# Login to GitHub Container Registry
echo YOUR_GITHUB_TOKEN | docker login ghcr.io -u YOUR_USERNAME --password-stdin

# Run deployment
chmod +x scripts/deploy-docker.sh
./scripts/deploy-docker.sh
EOF
```

### Deployment Script Features

The `scripts/deploy-docker.sh` script provides:

- **Automated deployment** with Docker Compose
- **Health check verification** 
- **Rollback on failure**
- **Resource monitoring**
- **Cleanup of old images**

## Health Monitoring

### Built-in Health Checks

All containers include health checks:

```bash
# Check container health
docker ps --format "table {{.Names}}\t{{.Status}}"

# View health check logs
docker inspect sp_sim_app --format='{{.State.Health.Status}}'
```

### Comprehensive Health Check Script

Use the provided health check script for detailed monitoring:

```bash
# Run all health checks
./scripts/health-check-docker.sh all

# Check specific components
./scripts/health-check-docker.sh container  # Container status
./scripts/health-check-docker.sh http      # HTTP endpoints
./scripts/health-check-docker.sh content   # Content verification
./scripts/health-check-docker.sh resources # Resource usage
```

### Health Check Output

The script provides detailed information:

```
✅ Container sp_sim_app is running
✅ Container health status: healthy
✅ HTTP health check passed (status: 200)
✅ Application endpoint is accessible (status: 200)
✅ Response time: 0.002s (< 3.0s threshold)
✅ Container resource usage: CPU 0.01%, Memory 45.2MB
✅ Content check passed - SP_Sim found in response
✅ HTML structure check passed

Health check summary: 7/7 checks passed
```

## Emergency Rollback

### Automatic Rollback

The deployment script automatically rolls back on failure. You can also manually trigger rollback:

```bash
# Rollback to previous version
./scripts/rollback-docker.sh previous

# Rollback to specific version
./scripts/rollback-docker.sh version v1.2.3

# Interactive rollback with version selection
./scripts/rollback-docker.sh interactive
```

### Rollback Features

- **Version tracking** - Maintains history of deployed versions
- **Quick restoration** - Fast rollback using Docker image tags
- **Health verification** - Confirms rollback success
- **Interactive mode** - Guided rollback process

## Troubleshooting

### Common Issues

#### Container Won't Start

```bash
# Check container logs
docker logs sp_sim_app

# Check container status
docker ps -a
```

#### Health Check Failing

```bash
# Manual health check
curl -v http://localhost/health

# Check nginx configuration
docker exec sp_sim_app nginx -t
```

#### Image Build Issues

```bash
# Build with verbose output
docker build --no-cache --progress=plain -t sp_sim .

# Check build context
docker build --dry-run .
```

### Performance Optimization

#### Resource Limits

The production Docker Compose includes resource limits:

```yaml
deploy:
  resources:
    limits:
      memory: 256M
      cpus: '0.5'
    reservations:
      memory: 128M
      cpus: '0.25'
```

#### Cache Optimization

- **Docker layer caching** reduces build times
- **Static asset caching** with proper nginx headers
- **Gzip compression** for smaller response sizes

### Security Considerations

#### Image Security

```bash
# Scan for vulnerabilities
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
  aquasec/trivy image sp_sim:latest
```

#### Container Security

- Runs as non-root user where possible
- Minimal base images (Alpine Linux)
- Security headers in nginx configuration
- Regular security updates via automated builds

## Support

For deployment issues:

1. Check the [troubleshooting section](#troubleshooting)
2. Review container logs: `docker logs sp_sim_app`
3. Run health checks: `./scripts/health-check-docker.sh all`
4. Open an issue with deployment details

---

*This guide covers Docker deployment for SP_Sim. For development setup, see [DEVELOPER.md](./DEVELOPER.md).*