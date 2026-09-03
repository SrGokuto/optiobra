#!/bin/bash
set -e

echo "=== OptiObra Docker Startup ==="

# El filesystem raíz del contenedor puede ser de solo lectura en Pterodactyl
# (Wings con docker.read_only=true), así que TODO lo escribible se ubica en
# /home/container (volumen de datos) y /tmp (tmpfs).
DATA_DIR=/home/container
LOG_DIR=$DATA_DIR/logs
MYSQL_DIR=$DATA_DIR/mysql
export HOME=$DATA_DIR
export PYTHONPATH=/app/backend

# Ensure writable directories exist
mkdir -p "$LOG_DIR"
mkdir -p "$DATA_DIR/models"
mkdir -p "$DATA_DIR/static"
mkdir -p "$DATA_DIR/media"
mkdir -p "$MYSQL_DIR"
mkdir -p /tmp/nginx_temp
chown -R mysql:mysql "$MYSQL_DIR" 2>/dev/null || true

# Reinicia un proceso en bucle si muere (nginx, backend, mysql, cloudflared)
run_loop() {
    local name="$1"
    shift
    while true; do
        echo "[$name] starting..."
        "$@" || echo "[$name] exited with code $?, restarting in 2s"
        sleep 2
    done
}

# ===================== MySQL =====================
if [ ! -d "$MYSQL_DIR/mysql" ]; then
    echo "[mysql] Initializing datadir..."
    mysqld --initialize-insecure --user=mysql --datadir="$MYSQL_DIR" --log-error="$MYSQL_DIR/error.log"
fi
run_loop mysql mysqld --user=mysql --datadir="$MYSQL_DIR" \
    --socket="$MYSQL_DIR/mysql.sock" --bind-address=127.0.0.1 --port=3306 \
    --log-error="$MYSQL_DIR/error.log" --pid-file="$MYSQL_DIR/mysqld.pid" --console &

# Esperar a que MySQL esté listo
for i in $(seq 1 60); do
    if mysqladmin --socket="$MYSQL_DIR/mysql.sock" -uroot ping --silent; then
        echo "[migrate] MySQL is up"
        break
    fi
    sleep 1
done

# ===================== Base de datos + migraciones =====================
echo "[migrate] Configuring database..."
mysql --socket="$MYSQL_DIR/mysql.sock" -uroot -e "CREATE DATABASE IF NOT EXISTS ${DB_NAME} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci; CREATE USER IF NOT EXISTS '${DB_USER}'@'127.0.0.1' IDENTIFIED BY '${DB_PASSWORD}'; CREATE USER IF NOT EXISTS '${DB_USER}'@'localhost' IDENTIFIED BY '${DB_PASSWORD}'; GRANT ALL PRIVILEGES ON ${DB_NAME}.* TO '${DB_USER}'@'127.0.0.1'; GRANT ALL PRIVILEGES ON ${DB_NAME}.* TO '${DB_USER}'@'localhost'; FLUSH PRIVILEGES;"

echo "[migrate] Running migrations..."
cd /app/backend
python manage.py migrate --noinput
echo "[migrate] Collecting static files..."
python manage.py collectstatic --noinput --clear

# ===================== Backend (gunicorn) =====================
run_loop backend gunicorn config.wsgi:application \
    --bind 127.0.0.1:8000 --workers 2 --timeout 120 \
    --access-logfile - --error-logfile - &

# ===================== Nginx =====================
run_loop nginx nginx -g "daemon off;" &

# ===================== Cloudflare Tunnel =====================
if [ -n "${CLOUDFLARE_TUNNEL_TOKEN:-}" ]; then
    echo "[cloudflared] Starting Cloudflare Tunnel..."
    run_loop cloudflared cloudflared tunnel --no-autoupdate run --token "$CLOUDFLARE_TUNNEL_TOKEN" &
else
    echo "[cloudflared] No CLOUDFLARE_TUNNEL_TOKEN provided, skipping tunnel..."
fi

# ===================== Esperar readiness =====================
echo "Waiting for OptiObra to be ready..."
until curl -sf http://localhost/health/ > /dev/null 2>&1 && curl -s http://127.0.0.1:8000/api/ -o /dev/null; do
    sleep 2
done

# Marca de arranque para Pterodactyl (config.startup.done del egg)
echo "OptiObra is up and running on optiobra.inferna.dev and api-optiobra.inferna.dev"

# Mantener el contenedor vivo
while true; do
    sleep 3600
done