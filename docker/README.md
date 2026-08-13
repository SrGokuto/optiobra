# OptiObra Dockerización

Dockerización completa del proyecto OptiObra para despliegue en Pterodactyl y desarrollo local.

## 📁 Estructura

```
docker/
├── Dockerfile              # Imagen multi-stage para Pterodactyl
├── Dockerfile.dev          # Imagen para desarrollo frontend
├── docker-compose.yml      # Orquestación local
├── nginx.conf              # Configuración principal de nginx
├── default.conf            # Virtual host de nginx
├── supervisord.conf        # Orquestador de procesos
├── start_ptero.sh          # Script de inicio para Pterodactyl
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
- `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`: Credenciales de MariaDB
- `SECRET_KEY`: Clave secreta de Django
- `CORS_ALLOWED_ORIGINS`: Orígenes permitidos para CORS
- `SUPABASE_URL`, `SUPABASE_KEY`: Configuración de Supabase

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
| MariaDB    | 3306   | Base de datos                |

## 🔐 Seguridad

- Cambia `SECRET_KEY` en producción
- Usa `DEBUG=False` en producción
- Configura `ALLOWED_HOSTS` y `CORS_ALLOWED_ORIGINS`
- No expongas el puerto 3306 en producción

## 📝 Notas

- El frontend se sirve como archivos estáticos desde nginx en producción
- Las migraciones se ejecutan automáticamente al iniciar el container
