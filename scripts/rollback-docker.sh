#!/bin/bash

# Docker Rollback Script
# Rollback SP_Sim Docker deployment to previous version

set -e

# Configuration
REGISTRY="ghcr.io"
IMAGE_NAME="mcpolitics/sp_sim"
CONTAINER_NAME="sp_sim_app"
COMPOSE_PROJECT="sp_sim"
DEPLOY_PATH="${VPS_DEPLOY_PATH:-/opt/sp_sim}"
HEALTH_CHECK_URL="${VPS_SITE_URL:-http://localhost:3000}"
BACKUP_TAG_FILE="${DEPLOY_PATH}/.previous_tag"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

info() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
}

# Get current deployed version
get_current_version() {
    local current_tag=""
    
    if docker ps -q -f name="${CONTAINER_NAME}" | grep -q .; then
        current_tag=$(docker inspect --format='{{index .Config.Image}}' "${CONTAINER_NAME}" 2>/dev/null | cut -d':' -f2 || echo "unknown")
    fi
    
    echo "$current_tag"
}

# Get previous version from backup file
get_previous_version() {
    if [[ -f "$BACKUP_TAG_FILE" ]]; then
        cat "$BACKUP_TAG_FILE"
    else
        echo ""
    fi
}

# Save current version as backup
save_current_version() {
    local current_tag="$1"
    if [[ -n "$current_tag" && "$current_tag" != "unknown" ]]; then
        echo "$current_tag" > "$BACKUP_TAG_FILE"
        log "Saved current version as backup: $current_tag"
    fi
}

# List available image versions
list_available_versions() {
    info "Available Docker image versions:"
    docker images "${REGISTRY}/${IMAGE_NAME}" --format "table {{.Tag}}\t{{.CreatedAt}}\t{{.Size}}" 2>/dev/null || {
        warn "No local images found for ${REGISTRY}/${IMAGE_NAME}"
        return 1
    }
}

# Rollback to specific version
rollback_to_version() {
    local target_tag="$1"
    
    if [[ -z "$target_tag" ]]; then
        error "No target version specified for rollback"
        return 1
    fi
    
    log "Starting rollback to version: $target_tag"
    
    # Check if target image exists locally
    if ! docker images -q "${REGISTRY}/${IMAGE_NAME}:${target_tag}" | grep -q .; then
        info "Target image not found locally, attempting to pull..."
        if ! docker pull "${REGISTRY}/${IMAGE_NAME}:${target_tag}"; then
            error "Failed to pull target image: ${REGISTRY}/${IMAGE_NAME}:${target_tag}"
            return 1
        fi
    fi
    
    # Save current version before rollback
    local current_version=$(get_current_version)
    if [[ -n "$current_version" && "$current_version" != "unknown" ]]; then
        save_current_version "$current_version"
    fi
    
    # Stop current containers
    log "Stopping current containers..."
    validate_deploy_path "$DEPLOY_PATH"
    cd "$DEPLOY_PATH"
    docker-compose down || {
        warn "Docker compose down failed, attempting manual container stop"
        docker stop "$CONTAINER_NAME" 2>/dev/null || true
        docker rm "$CONTAINER_NAME" 2>/dev/null || true
    }
    
    # Deploy with target version
    log "Deploying rollback version: $target_tag"
    export TAG="$target_tag"
    docker-compose up -d --remove-orphans
    
    # Wait for container to start
    sleep 10
    
    # Verify rollback
    if verify_rollback; then
        log "Rollback to version $target_tag completed successfully!"
        return 0
    else
        error "Rollback verification failed!"
        return 1
    fi
}

# Rollback to previous version
rollback_to_previous() {
    local previous_tag=$(get_previous_version)
    
    if [[ -z "$previous_tag" ]]; then
        error "No previous version found in backup file: $BACKUP_TAG_FILE"
        list_available_versions
        return 1
    fi
    
    log "Found previous version: $previous_tag"
    rollback_to_version "$previous_tag"
}

# Verify rollback success
verify_rollback() {
    info "Verifying rollback..."
    
    # Check if container is running
    if ! docker ps -q -f name="${CONTAINER_NAME}" | grep -q .; then
        error "Container ${CONTAINER_NAME} is not running after rollback"
        return 1
    fi
    
    # Wait for container to be healthy
    local retries=0
    local max_retries=20
    while [[ $retries -lt $max_retries ]]; do
        local health_status=$(docker inspect --format='{{.State.Health.Status}}' "${CONTAINER_NAME}" 2>/dev/null || echo "none")
        
        if [[ "$health_status" == "healthy" ]]; then
            log "Container is healthy after rollback"
            break
        elif [[ "$health_status" == "starting" ]]; then
            info "Container is still starting... (attempt $((retries + 1))/$max_retries)"
        else
            warn "Container health status: $health_status (attempt $((retries + 1))/$max_retries)"
        fi
        
        retries=$((retries + 1))
        sleep 5
    done
    
    # Test HTTP endpoint
    if curl -f -s "${HEALTH_CHECK_URL}/health" >/dev/null 2>&1; then
        log "HTTP health check passed after rollback"
    else
        error "HTTP health check failed after rollback"
        return 1
    fi
    
    log "Rollback verification completed successfully"
    return 0
}

# Show rollback status
show_status() {
    info "=== SP_Sim Docker Rollback Status ==="
    
    local current_version=$(get_current_version)
    local previous_version=$(get_previous_version)
    
    echo "Current deployed version: ${current_version:-'unknown'}"
    echo "Previous version (backup): ${previous_version:-'none available'}"
    echo "Deploy path: $DEPLOY_PATH"
    echo "Backup file: $BACKUP_TAG_FILE"
    
    echo ""
    if docker ps -q -f name="${CONTAINER_NAME}" | grep -q .; then
        log "Container $CONTAINER_NAME is currently running"
        
        local health_status=$(docker inspect --format='{{.State.Health.Status}}' "${CONTAINER_NAME}" 2>/dev/null || echo "none")
        echo "Health status: $health_status"
    else
        error "Container $CONTAINER_NAME is not running"
    fi
    
    echo ""
    list_available_versions
}

# Interactive rollback selection
interactive_rollback() {
    info "=== Interactive Rollback Mode ==="
    
    show_status
    
    echo ""
    echo "Available rollback options:"
    echo "1. Rollback to previous version"
    echo "2. Rollback to specific version"
    echo "3. List available versions"
    echo "4. Show current status"
    echo "5. Exit"
    
    read -p "Please select an option (1-5): " choice
    
    case $choice in
        1)
            rollback_to_previous
            ;;
        2)
            list_available_versions
            echo ""
            read -p "Enter the version tag to rollback to: " target_tag
            if [[ -n "$target_tag" ]]; then
                rollback_to_version "$target_tag"
            else
                error "No version specified"
            fi
            ;;
        3)
            list_available_versions
            ;;
        4)
            show_status
            ;;
        5)
            info "Exiting interactive mode"
            exit 0
            ;;
        *)
            error "Invalid option selected"
            exit 1
            ;;
    esac
}

# Help function
show_help() {
    echo "SP_Sim Docker Rollback Script"
    echo ""
    echo "Usage: $0 [COMMAND] [OPTIONS]"
    echo ""
    echo "Commands:"
    echo "  previous                 Rollback to the previous version"
    echo "  version <tag>           Rollback to a specific version tag"
    echo "  status                  Show current rollback status"
    echo "  list                    List available image versions"
    echo "  interactive            Interactive rollback mode"
    echo "  help                   Show this help message"
    echo ""
    echo "Environment Variables:"
    echo "  VPS_DEPLOY_PATH        Deployment path (default: /opt/sp_sim)"
    echo "  VPS_SITE_URL           Site URL for health checks (default: http://localhost:3000)"
    echo "  CONTAINER_NAME         Container name (default: sp_sim_app)"
    echo ""
    echo "Examples:"
    echo "  $0 previous                    # Rollback to previous version"
    echo "  $0 version v1.2.3             # Rollback to specific version"
    echo "  $0 interactive                # Interactive mode"
    echo ""
}

# Main function
main() {
    local command="${1:-interactive}"
    
    case "$command" in
        "previous")
            rollback_to_previous
            ;;
        "version")
            local target_tag="$2"
            if [[ -z "$target_tag" ]]; then
                error "Version tag required. Usage: $0 version <tag>"
                exit 1
            fi
            rollback_to_version "$target_tag"
            ;;
        "status")
            show_status
            ;;
        "list")
            list_available_versions
            ;;
        "interactive")
            interactive_rollback
            ;;
        "help"|"-h"|"--help")
            show_help
            ;;
        *)
            error "Unknown command: $command"
            show_help
            exit 1
            ;;
    esac
}

# Ensure deployment path exists
if [[ ! -d "$DEPLOY_PATH" ]]; then
    error "Deployment path does not exist: $DEPLOY_PATH"
    exit 1
fi

# Run main function with all arguments
main "$@"