#!/bin/bash
set -e

echo "=== OptiObra Docker Startup ==="
echo "Starting services..."

# Ensure directories exist
mkdir -p /var/log/supervisor
mkdir -p /app/backend/media
mkdir -p /app/backend/static
mkdir -p /var/www/html
mkdir -p /home/container/models

# Generate supervisord configuration based on available services
cat > /etc/supervisor/conf.d/supervisord.conf << 'EOF'
[supervisord]
nodaemon=true
logfile=/var/log/supervisor/supervisord.log
pidfile=/var/run/supervisord.pid
childlogdir=/var/log/supervisor
loglevel=info

[program:nginx]
command=/usr/sbin/nginx -g "daemon off;"
autostart=true
autorestart=true
priority=10
stdout_logfile=/var/log/supervisor/nginx_stdout.log
stderr_logfile=/var/log/supervisor/nginx_stderr.log

[program:backend]
directory=/app/backend
command=/usr/local/bin/gunicorn config.wsgi:application --bind 127.0.0.1:8000 --workers 2 --timeout 120 --access-logfile /var/log/supervisor/backend_access.log --error-logfile /var/log/supervisor/backend_error.log
autostart=true
autorestart=true
priority=20
stdout_logfile=/var/log/supervisor/backend_stdout.log
stderr_logfile=/var/log/supervisor/backend_stderr.log
environment=PYTHONPATH="/app/backend"
EOF

# Run database migrations if DB is configured
if [ -n "${DB_HOST:-}" ] && [ -n "${DB_NAME:-}" ]; then
    echo "Running database migrations..."
    cd /app/backend
    python manage.py migrate --noinput
    echo "Migrations completed."
else
    echo "Warning: Database not configured. Skipping migrations."
fi

# Collect static files
echo "Collecting static files..."
cd /app/backend
python manage.py collectstatic --noinput --clear || true

echo "Starting supervisord..."
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf
