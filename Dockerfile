# Production stage - optimized for pre-built artifacts
FROM nginx:alpine AS production

# Install curl for health checks
RUN apk add --no-cache curl

# Copy built assets (assumes dist/ directory exists)
COPY dist/ /usr/share/nginx/html/

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/health || exit 1

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]