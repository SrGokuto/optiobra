#!/bin/bash
set -e

echo "=== OptiObra Frontend Docker Startup ==="

# El filesystem raíz del contenedor puede ser de solo lectura en Pterodactyl
# (Wings con docker.read_only=true), así que TODO lo escribible se ubica en
# /home/container (volumen de datos) y /tmp (tmpfs).
DATA_DIR=/home/container
LOG_DIR=$DATA_DIR/logs
export HOME=$DATA_DIR

# Ensure writable directories exist
mkdir -p "$LOG_DIR"
mkdir -p /tmp/nginx_temp

# Reinicia un proceso en bucle si muere (nginx, cloudflared)
run_loop() {
    local name="$1"
    shift
    while true; do
        echo "[$name] starting..."
        "$@" || echo "[$name] exited with code $?, restarting in 2s"
        sleep 2
    done
}

# ===================== Nginx =====================
run_loop nginx nginx -g "daemon off;" &

# ===================== Cloudflare Tunnel =====================
# Conecta de forma SALIENTE hacia el edge de Cloudflare, sin necesidad de
# abrir/exponer puertos en el nodo de Pterodactyl. El ingress en el panel de
# Cloudflare debe apuntar a http://localhost:80.
if [ -n "${CLOUDFLARE_TUNNEL_TOKEN:-}" ]; then
    echo "[cloudflared] Starting Cloudflare Tunnel..."
    run_loop cloudflared cloudflared tunnel --no-autoupdate run --token "$CLOUDFLARE_TUNNEL_TOKEN" &
else
    echo "[cloudflared] No CLOUDFLARE_TUNNEL_TOKEN provided, skipping tunnel..."
fi

# ===================== Esperar readiness =====================
echo "Waiting for OptiObra frontend to be ready..."
until curl -sf http://localhost/health/ > /dev/null 2>&1; do
    sleep 2
done

# Marca de arranque para Pterodactyl (config.startup.done del egg)
echo "OptiObra frontend is up and running"

# Mantener el contenedor vivo
while true; do
    sleep 3600
done