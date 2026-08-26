# Stage 1: Build Frontend Angular
FROM node:20-alpine AS frontend-builder

WORKDIR /build/frontend

COPY frontend/optiobra/package*.json ./
RUN npm ci

COPY frontend/optiobra/ ./
RUN npm run build

# Stage 2: Build Python dependencies
FROM python:3.12-slim-bookworm AS python-builder

WORKDIR /build

COPY backend/requirements.txt ./backend/requirements.txt

RUN pip install --no-cache-dir --prefix=/install -r backend/requirements.txt


# Stage 3: Final image (Debian + Python + Nginx + MySQL Server + cloudflared)
FROM python:3.12-slim-bookworm

LABEL maintainer="OptiObra Team"
LABEL description="OptiObra - Sistema de gestión de construcción (Full Stack con MySQL y cloudflared)"
LABEL version="1.1.0"

ENV DEBIAN_FRONTEND=noninteractive
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Install system dependencies, nginx, MySQL Server 8.0 (mysql-alpine equivalent)
# and download cloudflared for Cloudflare Tunnels.
RUN apt-get update && apt-get install -y --no-install-recommends \
    nginx \
    curl \
    wget \
    gnupg \
    ca-certificates \
    lsb-release \
    apt-transport-https \
    && wget -qO - https://repo.mysql.com/RPM-GPG-KEY-mysql-2025 | gpg --dearmor -o /usr/share/keyrings/mysql-archive-keyring.gpg \
    && echo "deb [signed-by=/usr/share/keyrings/mysql-archive-keyring.gpg] http://repo.mysql.com/apt/debian bookworm mysql-8.0" > /etc/apt/sources.list.d/mysql.list \
    && apt-get update \
    && DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends mysql-server \
    && rm -rf /var/lib/apt/lists/* /etc/apt/sources.list.d/mysql.list \
    && wget -qO /usr/local/bin/cloudflared https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 \
    && chmod +x /usr/local/bin/cloudflared \
    && rm -rf /var/lib/mysql /var/lib/apt/lists/*

# Copy Python dependencies from builder
COPY --from=python-builder /install /usr/local

# Copy backend code
COPY backend/ /app/backend/

# Copy compiled frontend
COPY --from=frontend-builder /build/frontend/dist/optiobra/browser/ /var/www/html/

# Copy nginx config
COPY docker/nginx.conf /etc/nginx/nginx.conf
COPY docker/default.conf /etc/nginx/conf.d/default.conf

# Remove Debian's default site (conflicts with our default_server)
RUN rm -f /etc/nginx/sites-enabled/default

# Copy MySQL tuning config
COPY docker/mysql/optiobra.cnf /etc/mysql/conf.d/optiobra.cnf

# Copy startup script
COPY docker/start_ptero.sh /app/start_ptero.sh
RUN chmod +x /app/start_ptero.sh

# Create directories for logs, media, static and the persistent MySQL datadir
RUN mkdir -p \
    /app/backend/media \
    /app/backend/static \
    /home/container/models \
    /home/container/mysql \
    && chmod 755 /var/www/html \
    && chown -R 1000:1000 /app/backend/media \
    && chown -R 1000:1000 /app/backend/static \
    && chmod 777 /home/container/mysql

# Expose ports
EXPOSE 80 443 8000 3306

# Health check (nginx serves /health/)
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD curl -f http://localhost/health/ || exit 1

# Start script (compatible with Pterodactyl startup command)
CMD ["/app/start_ptero.sh"]
