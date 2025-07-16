#!/bin/bash

# Docker Health Check Script
# Comprehensive health checking for SP_Sim Docker deployment

set -e

# Configuration
CONTAINER_NAME="${CONTAINER_NAME:-sp_sim_app}"
HEALTH_CHECK_URL="${VPS_SITE_URL:-http://localhost:3000}"
MAX_RETRIES="${MAX_RETRIES:-10}"
RETRY_INTERVAL="${RETRY_INTERVAL:-5}"

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

# Check if container is running
check_container_status() {
    info "Checking container status..."
    
    if ! docker ps -q -f name="${CONTAINER_NAME}" | grep -q .; then
        error "Container ${CONTAINER_NAME} is not running"
        return 1
    fi
    
    log "Container ${CONTAINER_NAME} is running"
    return 0
}

# Check Docker container health
check_container_health() {
    info "Checking container health status..."
    
    local health_status=$(docker inspect --format='{{.State.Health.Status}}' "${CONTAINER_NAME}" 2>/dev/null || echo "none")
    
    case "$health_status" in
        "healthy")
            log "Container health status: healthy"
            return 0
            ;;
        "starting")
            warn "Container health status: starting (still initializing)"
            return 1
            ;;
        "unhealthy")
            error "Container health status: unhealthy"
            return 1
            ;;
        "none")
            warn "Container has no health check configured"
            return 0
            ;;
        *)
            warn "Container health status: ${health_status}"
            return 1
            ;;
    esac
}

# Check HTTP endpoint availability
check_http_health() {
    info "Checking HTTP endpoint: ${HEALTH_CHECK_URL}/health"
    
    local retries=0
    while [[ $retries -lt $MAX_RETRIES ]]; do
        local response=$(curl -s -w "%{http_code}" -o /dev/null "${HEALTH_CHECK_URL}/health" 2>/dev/null || echo "000")
        
        if [[ "$response" == "200" ]]; then
            log "HTTP health check passed (status: 200)"
            return 0
        fi
        
        retries=$((retries + 1))
        warn "HTTP health check failed (status: ${response}, attempt ${retries}/${MAX_RETRIES})"
        
        if [[ $retries -lt $MAX_RETRIES ]]; then
            sleep $RETRY_INTERVAL
        fi
    done
    
    error "HTTP health check failed after ${MAX_RETRIES} attempts"
    return 1
}

# Check main application endpoint
check_app_health() {
    info "Checking main application endpoint: ${HEALTH_CHECK_URL}"
    
    local response=$(curl -s -w "%{http_code}" -o /dev/null "${HEALTH_CHECK_URL}" 2>/dev/null || echo "000")
    
    if [[ "$response" == "200" ]]; then
        log "Application endpoint is accessible (status: 200)"
        return 0
    else
        error "Application endpoint check failed (status: ${response})"
        return 1
    fi
}

# Check response time
check_response_time() {
    info "Checking response time..."
    
    local response_time=$(curl -s -w "%{time_total}" -o /dev/null "${HEALTH_CHECK_URL}" 2>/dev/null || echo "0")
    local threshold=3.0
    
    if (( $(echo "$response_time < $threshold" | bc -l 2>/dev/null || echo "0") )); then
        log "Response time: ${response_time}s (< ${threshold}s threshold)"
        return 0
    else
        warn "Response time: ${response_time}s (>= ${threshold}s threshold)"
        return 1
    fi
}

# Check container resource usage
check_container_resources() {
    info "Checking container resource usage..."
    
    if ! command -v docker &> /dev/null; then
        warn "Docker command not available for resource check"
        return 0
    fi
    
    local stats=$(docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}" "${CONTAINER_NAME}" 2>/dev/null || echo "")
    
    if [[ -n "$stats" ]]; then
        log "Container resource usage:"
        echo "$stats"
        return 0
    else
        warn "Could not retrieve container resource statistics"
        return 1
    fi
}

# Check content integrity
check_content() {
    info "Checking content integrity..."
    
    local content=$(curl -s "${HEALTH_CHECK_URL}" 2>/dev/null || echo "")
    
    # Check for key elements that should be present
    if echo "$content" | grep -q "SP_Sim"; then
        log "Content check passed - SP_Sim found in response"
    else
        warn "Content check failed - SP_Sim not found in response"
        return 1
    fi
    
    # Check for HTML structure
    if echo "$content" | grep -q "<html"; then
        log "HTML structure check passed"
    else
        warn "HTML structure check failed - no HTML tags found"
        return 1
    fi
    
    return 0
}

# Check for required assets
check_assets() {
    info "Checking for required assets..."
    
    local base_url="${HEALTH_CHECK_URL}"
    local assets_ok=true
    
    # Check for CSS files
    if curl -s -f "${base_url}/assets/" 2>/dev/null | grep -q "\.css"; then
        log "CSS assets found"
    else
        warn "CSS assets check failed"
        assets_ok=false
    fi
    
    # Check for JS files
    if curl -s -f "${base_url}/assets/" 2>/dev/null | grep -q "\.js"; then
        log "JavaScript assets found"
    else
        warn "JavaScript assets check failed"
        assets_ok=false
    fi
    
    if [[ "$assets_ok" == "true" ]]; then
        return 0
    else
        return 1
    fi
}

# Comprehensive health check
run_all_checks() {
    local checks_passed=0
    local total_checks=0
    
    info "Running comprehensive health checks for SP_Sim Docker deployment"
    echo "========================================"
    
    # Container status check
    total_checks=$((total_checks + 1))
    if check_container_status; then
        checks_passed=$((checks_passed + 1))
    fi
    
    echo ""
    
    # Container health check
    total_checks=$((total_checks + 1))
    if check_container_health; then
        checks_passed=$((checks_passed + 1))
    fi
    
    echo ""
    
    # HTTP health check
    total_checks=$((total_checks + 1))
    if check_http_health; then
        checks_passed=$((checks_passed + 1))
    fi
    
    echo ""
    
    # Application health check
    total_checks=$((total_checks + 1))
    if check_app_health; then
        checks_passed=$((checks_passed + 1))
    fi
    
    echo ""
    
    # Response time check
    total_checks=$((total_checks + 1))
    if check_response_time; then
        checks_passed=$((checks_passed + 1))
    fi
    
    echo ""
    
    # Resource usage check
    total_checks=$((total_checks + 1))
    if check_container_resources; then
        checks_passed=$((checks_passed + 1))
    fi
    
    echo ""
    
    # Content integrity check
    total_checks=$((total_checks + 1))
    if check_content; then
        checks_passed=$((checks_passed + 1))
    fi
    
    echo ""
    echo "========================================"
    info "Health check summary: ${checks_passed}/${total_checks} checks passed"
    
    if [[ $checks_passed -eq $total_checks ]]; then
        log "All health checks passed! Deployment is healthy."
        return 0
    elif [[ $checks_passed -ge $((total_checks * 3 / 4)) ]]; then
        warn "Most health checks passed (${checks_passed}/${total_checks}). Deployment may be functional but has issues."
        return 1
    else
        error "Health checks failed (${checks_passed}/${total_checks}). Deployment has significant issues."
        return 1
    fi
}

# Main function
main() {
    case "${1:-all}" in
        "container")
            check_container_status && check_container_health
            ;;
        "http")
            check_http_health
            ;;
        "app")
            check_app_health
            ;;
        "response")
            check_response_time
            ;;
        "resources")
            check_container_resources
            ;;
        "content")
            check_content
            ;;
        "assets")
            check_assets
            ;;
        "all"|*)
            run_all_checks
            ;;
    esac
}

# Run main function with arguments
main "$@"