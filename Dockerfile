# Stage 1: Build Frontend Angular
FROM node:20-alpine AS frontend-builder

WORKDIR /build/frontend

COPY frontend/optiobra/package*.json ./
RUN npm ci

COPY frontend/optiobra/ ./
RUN npm run build

# Stage 2: Build Python dependencies
FROM python:3.11-slim AS python-builder

WORKDIR /build

COPY backend/requirements.txt ./backend/requirements.txt

RUN pip install --no-cache-dir --prefix=/install -r backend/requirements.txt


# Stage 3: Final image
FROM python:3.11-slim

LABEL maintainer="OptiObra Team"
LABEL description="OptiObra - Sistema de gestión de construcción"
LABEL version="1.0.0"

ENV DEBIAN_FRONTEND=noninteractive
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Install system dependencies, nginx, supervisord, and build tools
RUN apt-get update && apt-get install -y --no-install-recommends \
    nginx \
    supervisor \
    curl \
    gnupg \
    build-essential \
    cmake \
    git \
    && rm -rf /var/lib/apt/lists/*

# Copy Python dependencies from builder
COPY --from=python-builder /install /usr/local

# Copy backend code
COPY backend/ /app/backend/

# Copy compiled frontend
COPY --from=frontend-builder /build/frontend/dist/optiobra/browser/ /var/www/html/

# Copy nginx config
COPY docker/nginx.conf /etc/nginx/nginx.conf
COPY docker/default.conf /etc/nginx/conf.d/default.conf

# Copy supervisord config
COPY docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Copy startup script
COPY docker/start_ptero.sh /app/start_ptero.sh
RUN chmod +x /app/start_ptero.sh

# Create directories for logs, media, static
RUN mkdir -p /var/log/supervisor \
    /var/log/nginx \
    /var/log/optiobra \
    /app/backend/media \
    /app/backend/static \
    && chmod 755 /var/www/html \
    && chmod 775 /var/log/nginx \
    && chown -R 1000:1000 /app/backend/media \
    && chown -R 1000:1000 /app/backend/static \
    && chown -R 1000:1000 /home/container

# Expose ports
EXPOSE 80 443 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost/health/ || exit 1

# Start script (compatible with Pterodactyl startup command)
CMD ["/app/start_ptero.sh"]
