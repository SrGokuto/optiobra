# OptiObra Dockerización

Dockerización completa del proyecto OptiObra para despliegue en Pterodactyl y desarrollo local.

## 📁 Estructura

```
docker/
├── Dockerfile              # Imagen full-stack para Pterodactyl (Frontend + Backend + MySQL + nginx + cloudflared)
├── Dockerfile.backend      # Imagen solo backend (Django + MySQL Server interno)
├── Dockerfile.dev          # Imagen para desarrollo frontend
├── docker-compose.yml      # Orquestación local
├── nginx.conf              # Configuración principal de nginx
├── default.conf            # Virtual host de nginx
├── mysql/optiobra.cnf      # Tuning de MySQL Server interno
├── start_ptero.sh          # Script de inicio full-stack para Pterodactyl (gestiona todos los procesos)
├── start_backend_ptero.sh  # Script de inicio solo backend para Pterodactyl
├── build-push.sh           # Script para construir y publicar las imágenes
└── README.md               # Este archivo
```

## 🚀 Pterodactyl (Producción)

### 1. Construir la imagen

```bash
docker build -t optiobra-full:latest .
```

### 2. Subir a registry

```bash
docker tag optiobra-full:latest srgokuto/optiobra-full:latest
docker push srgokuto/optiobra-full:latest
```

### 3. Configurar egg en Pterodactyl

Importa el archivo `egg.json` en tu panel de Pterodactyl.

**Variables importantes:**
- `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`: Credenciales de MySQL (servidor interno del contenedor, deja `DB_HOST=127.0.0.1`).
- `DB_ROOT_PASSWORD`: Contraseña del usuario root de MySQL interno.
- `SECRET_KEY`: Clave secreta de Django
- `ALLOWED_HOSTS`: Dominios permitidos (default: `optiobra.inferna.dev,api-optiobra.inferna.dev`)
- `CORS_ALLOWED_ORIGINS`: Orígenes permitidos para CORS (default: `https://optiobra.inferna.dev`)
- `SUPABASE_URL`, `SUPABASE_KEY`: Configuración de Supabase
- `CLOUDFLARE_TUNNEL_TOKEN`: Token del túnel de Cloudflare (cloudflared). Déjalo vacío para deshabilitarlo.

### Túnel de Cloudflare (cloudflared)

La imagen incluye `cloudflared`. Para exponer OptiObra sin abrir puertos:

1. Crea un túnel en el panel de Cloudflare Zero Trust (`Access → Tunnels → Create a tunnel`).
2. Copia el **token** del túnel.
3. Pega el token en la variable `CLOUDFLARE_TUNNEL_TOKEN` del servidor en Pterodactyl.
4. En la configuración del túnel (panel de Cloudflare), define el `ingress` con **dos hostnames**, ambos apuntando a `http://localhost:80` (nginx enruta por el header `Host`):

   ```yaml
   ingress:
     - hostname: optiobra.inferna.dev
       service: http://localhost:80
     - hostname: api-optiobra.inferna.dev
       service: http://localhost:80
     - service: http_status:404
   ```

5. Añade en Cloudflare un registro CNAME `api-optiobra` → `{tunnel-id}.cfargotunnel.com` (igual que el del frontend).

Resultado:
- `optiobra.inferna.dev` → nginx sirve la SPA Angular y el `/api/` como fallback.
- `api-optiobra.inferna.dev` → nginx reenvía **todo** al backend Django (uso desde la app móvil).
- La app móvil debe apuntar a `https://api-optiobra.inferna.dev/api`.

Si el token está vacío, el proceso `cloudflared` no se inicia y la app queda solo en la red interna del nodo.

### Imagen solo backend (`srgokuto/optiobra-backend`)

Variante que **solo contiene el backend Django + MySQL Server interno + cloudflared** (sin frontend ni nginx). Útil si ya sirves el frontend desde otro sitio (por ejemplo, Cloudflare Pages o un egg aparte).

```bash
# Construir y publicar
./docker/build-push.sh backend        # o: docker/build-push.sh all

# Construir manualmente
docker build -t srgokuto/optiobra-backend:latest -f docker/Dockerfile.backend .
```

- La API escucha en el puerto **8000** directamente (sin nginx en medio).
- MySQL interno sigue escuchando solo en `127.0.0.1:3306`.
- Mismas variables de entorno que el egg full-stack: `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST=127.0.0.1`, `SECRET_KEY`, `ALLOWED_HOSTS`, `CORS_ALLOWED_ORIGINS`, `SUPABASE_URL`, `SUPABASE_KEY`, `CLOUDFLARE_TUNNEL_TOKEN`, etc.
- Para crear el egg en Pterodactyl, importa **`egg.backend.json`** (ya apunta a `srgokuto/optiobra-backend:latest` y al startup correcto).

**Túnel de Cloudflare (sin abrir puertos):** cloudflared conecta de forma saliente hacia el edge de Cloudflare, así que no necesitas exponer ningún puerto en el nodo de Pterodactyl. Pega el token en la variable `CLOUDFLARE_TUNNEL_TOKEN` y en el panel de Cloudflare define el `ingress` apuntando a `http://localhost:8000`:

```yaml
ingress:
  - hostname: api-optiobra.inferna.dev
    service: http://localhost:8000
  - service: http_status:404
```

Añade también el hostname a `ALLOWED_HOSTS` de Django (default del egg: `api-optiobra.inferna.dev`).

| Imagen | Contenido | Comando de inicio |
|--------|-----------|-------------------|
| `srgokuto/optiobra-full` | Frontend + Backend + MySQL + nginx + cloudflared | `bash /app/start_ptero.sh` |
| `srgokuto/optiobra-backend` | Backend + MySQL | `bash /app/start_backend_ptero.sh` |

## 🛠️ Desarrollo Local

### Prerrequisitos

- Docker 20.10+
- Docker Compose 2.0+
- Node.js 20+ (para Angular CLI)
- Python 3.11+

### Levantar todo el stack

```bash
docker compose up -d
```

Esto levanta:
- MariaDB en puerto 3306
- Backend Django en puerto 8000
- Frontend Angular en puerto 4200 (hot reload)

### Detener el stack

```bash
docker compose down
```

### Ver logs

```bash
docker compose logs -f [servicio]
```

Servicios disponibles: `mariadb`, `backend`, `frontend`

## 🔧 Configuración

### Base de Datos

```bash
# Ejecutar migraciones
docker compose exec backend python manage.py migrate

# Crear superusuario
docker compose exec backend python manage.py createsuperuser

# Cargar datos de prueba
docker compose exec backend python manage.py load_test_data
```

### Frontend

```bash
# Compilar para producción
docker compose run --rm frontend-builder npm run build
```

## 📡 Puertos

| Servicio   | Puerto | Descripción                  |
|------------|--------|------------------------------|
| Frontend   | 80     | UI Angular (nginx)           |
| Backend    | 8000   | API REST Django              |
| MySQL      | 3306   | Base de datos (interna)      |

## 🔐 Seguridad

- Cambia `SECRET_KEY` en producción
- Usa `DEBUG=False` en producción
- Configura `ALLOWED_HOSTS` y `CORS_ALLOWED_ORIGINS`
- No expongas el puerto 3306 en producción

## 📝 Notas

- El frontend se sirve como archivos estáticos desde nginx en producción
- Las migraciones se ejecutan automáticamente al iniciar el container
