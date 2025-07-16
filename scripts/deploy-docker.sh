#!/bin/bash

# Docker VPS Deployment Script
# This script deploys the SP_Sim application to a VPS using Docker

set -e

# Configuration
REGISTRY="ghcr.io"
IMAGE_NAME="mcpolitics/sp_sim"
CONTAINER_NAME="sp_sim_app"
COMPOSE_PROJECT="sp_sim"
DEPLOY_PATH="${VPS_DEPLOY_PATH:-/opt/sp_sim}"
HEALTH_CHECK_URL="${VPS_SITE_URL:-http://localhost:3000}"
MAX_RETRIES=30
RETRY_INTERVAL=10

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
}

# Check required environment variables
check_env() {
    local required_vars=("TAG" "VPS_HOST" "VPS_USERNAME" "VPS_DEPLOY_PATH")
    for var in "${required_vars[@]}"; do
        if [[ -z "${!var}" ]]; then
            error "Environment variable $var is not set"
            exit 1
        fi
    done
}

# Pull the latest Docker image
pull_image() {
    log "Pulling Docker image: ${REGISTRY}/${IMAGE_NAME}:${TAG}"
    docker pull "${REGISTRY}/${IMAGE_NAME}:${TAG}"
}

# Stop and remove existing containers
stop_existing() {
    log "Stopping existing containers..."
    
    if docker ps -q -f name="${CONTAINER_NAME}" | grep -q .; then
        log "Stopping container: ${CONTAINER_NAME}"
        docker stop "${CONTAINER_NAME}" || true
    fi
    
    if docker ps -aq -f name="${CONTAINER_NAME}" | grep -q .; then
        log "Removing container: ${CONTAINER_NAME}"
        docker rm "${CONTAINER_NAME}" || true
    fi
}

# Deploy using Docker Compose
deploy_with_compose() {
    log "Deploying with Docker Compose..."
    
    # Export TAG for docker-compose
    export TAG="${TAG}"
    
    # Navigate to deployment directory
    cd "${DEPLOY_PATH}"
    
    # Pull the latest image
    docker-compose pull app
    
    # Start services
    docker-compose up -d --remove-orphans
    
    log "Docker Compose deployment started"
}

# Health check function
health_check() {
    log "Performing health check on ${HEALTH_CHECK_URL}/health"
    
    local retries=0
    while [[ $retries -lt $MAX_RETRIES ]]; do
        if curl -f -s "${HEALTH_CHECK_URL}/health" >/dev/null 2>&1; then
            log "Health check passed!"
            return 0
        fi
        
        retries=$((retries + 1))
        warn "Health check failed (attempt ${retries}/${MAX_RETRIES}). Retrying in ${RETRY_INTERVAL}s..."
        sleep $RETRY_INTERVAL
    done
    
    error "Health check failed after ${MAX_RETRIES} attempts"
    return 1
}

# Verify deployment
verify_deployment() {
    log "Verifying deployment..."
    
    # Check if container is running
    if ! docker ps -q -f name="${CONTAINER_NAME}" | grep -q .; then
        error "Container ${CONTAINER_NAME} is not running"
        return 1
    fi
    
    # Check container health
    local health_status=$(docker inspect --format='{{.State.Health.Status}}' "${CONTAINER_NAME}" 2>/dev/null || echo "none")
    if [[ "$health_status" != "healthy" ]]; then
        warn "Container health status: ${health_status}"
    fi
    
    # Perform HTTP health check
    if ! health_check; then
        return 1
    fi
    
    # Check for build timestamp
    if curl -s "${HEALTH_CHECK_URL}" | grep -q "SP_Sim"; then
        log "Content verification passed"
    else
        warn "Content verification failed - SP_Sim not found in response"
    fi
    
    log "Deployment verification completed successfully"
    return 0
}

# Cleanup old images
cleanup() {
    log "Cleaning up old Docker images..."
    docker image prune -f --filter "label=org.opencontainers.image.source=https://github.com/mcpolitics/sp_sim"
}

# Main deployment function
main() {
    log "Starting Docker VPS deployment for SP_Sim"
    log "Image: ${REGISTRY}/${IMAGE_NAME}:${TAG}"
    log "Deploy path: ${DEPLOY_PATH}"
    
    # Check environment
    check_env
    
    # Pull latest image
    pull_image
    
    # Stop existing containers
    stop_existing
    
    # Deploy with Docker Compose
    deploy_with_compose
    
    # Wait a moment for container to start
    sleep 5
    
    # Verify deployment
    if verify_deployment; then
        log "Deployment completed successfully!"
        cleanup
        exit 0
    else
        error "Deployment verification failed!"
        exit 1
    fi
}

# Run main function
main "$@"