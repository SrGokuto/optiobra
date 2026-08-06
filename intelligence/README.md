# OptiObra Intelligence Engine

Motor de inteligencia artificial para el sistema OptiObra.

## Requisitos

- Docker y Docker Compose
- Modelo Qwen 3 8B GGUF Q4_K_M descargado en `../models/`

## Inicio Rapido

### 1. Descargar el modelo

```bash
mkdir -p ../models
# Descargar qwen3-8b-q4_k_m.gguf y colocarlo en ../models/
```

### 2. Iniciar servicios

```bash
docker compose up -d
```

### 3. Verificar

```bash
# Health check
curl http://localhost:8000/api/v1/health

# Info
curl http://localhost:8000/api/v1/info

# Generar reporte (usando mock si no hay modelo)
USE_MOCK=true docker compose up -d
```

## API Endpoints

| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| GET | /api/v1/health | Health check |
| GET | /api/v1/info | Informacion del motor |
| POST | /api/v1/report/executive | Reporte ejecutivo |
| POST | /api/v1/report/daily | Reporte diario (V2) |
| POST | /api/v1/report/weekly | Reporte semanal (V2) |
| POST | /api/v1/report/monthly | Reporte mensual (V2) |

## Desarrollo Local

```bash
# Instalar dependencias
pip install -r requirements.txt

# Ejecutar en modo mock (sin modelo)
USE_MOCK=true uvicorn app.main:app --reload

# Ejecutar con llama.cpp
uvicorn app.main:app --reload
```

## Testing

```bash
USE_MOCK=true python -m pytest tests/ -v
```

## Arquitectura

```
FastAPI -> Context Enrichment -> Prompt Builder -> LLM Provider -> Markdown
    |                                                         |
    +--- Plugin System (7 analyzers)                          |
    +--- Cache (in-memory, TTL 10min)                         |
    +--- Metrics (tokens, duration, cache hit)                |
```
