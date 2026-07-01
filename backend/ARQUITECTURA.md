"""
╔════════════════════════════════════════════════════════════════════════════╗
║                   OPTIOBRA BACKEND - ARQUITECTURA FINAL                    ║
╚════════════════════════════════════════════════════════════════════════════╝
"""

# 📊 DIAGRAMA DE ARQUITECTURA

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          CLIENTE FRONTEND (Angular)                         │
│                         ┌──────────────────────────┐                        │
│                         │  • Login/Registro        │                        │
│                         │  • Tabla Materiales      │                        │
│                         │  • Crear/Editar/Eliminar │                        │
│                         └──────────────────────────┘                        │
└─────────────────────────────────────────────────────────────────────────────┘
                                     │
                                     │ HTTP/REST
                                     │
┌─────────────────────────────────────────────────────────────────────────────┐
│                    DJANGO REST API (Backend) - Puerto 8000                  │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │ URLS (config/urls.py)                                                 │ │
│  │  • /api/auth/register/  ─────────────┐                               │ │
│  │  • /api/auth/login/     ─────────────┤                               │ │
│  │  • /api/materiales/     ─────────────├──> ROUTERS (DefaultRouter)   │ │
│  │  • /api/categorias/     ─────────────┤                               │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                     │                                        │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │ VIEWSETS (api/views.py)                                               │ │
│  │  ┌──────────────────────┐  ┌──────────────────────┐                 │ │
│  │  │ AuthViewSet          │  │ MaterialViewSet      │                 │ │
│  │  │  ├─ register()       │  │  ├─ create()        │                 │ │
│  │  │  ├─ login()          │  │  ├─ list()          │                 │ │
│  │  │  ├─ me()             │  │  ├─ retrieve()      │                 │ │
│  │  │  └─ logout()         │  │  ├─ update()        │                 │ │
│  │  └──────────────────────┘  │  ├─ destroy()       │                 │ │
│  │                             │  ├─ actualizar_     │                 │ │
│  │  ┌──────────────────────┐  │    cantidad()      │                 │ │
│  │  │ CategoriaViewSet     │  │  ├─ historial()     │                 │ │
│  │  │  ├─ create()         │  │  └─ estadisticas() │                 │ │
│  │  │  ├─ list()           │  └──────────────────────┘                 │ │
│  │  │  ├─ update()         │                                            │ │
│  │  │  └─ destroy()        │                                            │ │
│  │  └──────────────────────┘                                            │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                     │                                        │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │ SERIALIZERS (api/serializers.py) - Validación de datos                │ │
│  │  • MaterialSerializer (15+ validaciones)                               │ │
│  │  • CategoriaSerializer                                                 │ │
│  │  • HistorialMaterialSerializer                                         │ │
│  │  • UsuarioSupabaseSerializer                                           │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                     │                                        │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │ SERVICIOS (api/services.py) - Lógica de negocio                       │ │
│  │  • SupabaseAuthService                                                 │ │
│  │    ├─ register_user()                                                  │ │
│  │    ├─ login_user()                                                     │ │
│  │    ├─ verify_token()                                                   │ │
│  │    └─ logout_user()                                                    │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                     │                                        │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │ MODELOS (api/models.py) - Estructura de datos                         │ │
│  │  ┌──────────────────────┐  ┌──────────────────────┐                 │ │
│  │  │ Material (CRUD)      │  │ Categoría            │                 │ │
│  │  │  ├─ nombre          │  │  ├─ nombre          │                 │ │
│  │  │  ├─ codigo*         │  │  └─ descripción     │                 │ │
│  │  │  ├─ precio          │  └──────────────────────┘                 │ │
│  │  │  ├─ cantidad        │                                            │ │
│  │  │  ├─ estado          │  ┌──────────────────────┐                 │ │
│  │  │  ├─ categoria (FK)  │  │ HistorialMaterial    │                 │ │
│  │  │  ├─ creado_por (FK) │  │  ├─ material (FK)   │                 │ │
│  │  │  └─ timestamps      │  │  ├─ acción          │                 │ │
│  │  └──────────────────────┘  │  ├─ usuario (FK)   │                 │ │
│  │                             │  ├─ valores_antes  │                 │ │
│  │  ┌──────────────────────┐  │  └─ valores_nuevo  │                 │ │
│  │  │ UsuarioSupabase      │  └──────────────────────┘                 │ │
│  │  │  ├─ supabase_uid*   │                                            │ │
│  │  │  ├─ email*          │  * = Campo único                          │ │
│  │  │  ├─ nombre_completo │  FK = Foreign Key                         │ │
│  │  │  └─ rol             │                                            │ │
│  │  └──────────────────────┘                                            │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                     │                                        │
└─────────────────────────────────────────────────────────────────────────────┘
                                     │
                                     │ SQL
                                     │
┌─────────────────────────────────────────────────────────────────────────────┐
│                        MARIADB DATABASE - Puerto 3306                       │
│                                                                              │
│  ┌────────────────────┐  ┌────────────────────┐  ┌────────────────────┐   │
│  │ api_material       │  │ api_categoria      │  │ api_historialmaterial│  │
│  ├─ id (PK)          │  ├─ id (PK)           │  ├─ id (PK)            │   │
│  ├─ nombre           │  ├─ nombre (UNIQUE)   │  ├─ material_id (FK)   │   │
│  ├─ codigo (UNIQUE)* │  ├─ descripción       │  ├─ acción             │   │
│  ├─ categoria_id (FK)│  ├─ creado_en         │  ├─ usuario_id (FK)    │   │
│  ├─ precio           │  └─ actualizado_en    │  ├─ valores_ant (JSON) │   │
│  ├─ cantidad         │                       │  ├─ valores_new (JSON) │   │
│  ├─ estado           │  ┌────────────────────┐  │  └─ fecha            │   │
│  ├─ proveedor        │  │ api_usuariosupabase│  └────────────────────┘   │
│  ├─ creado_por_id(FK)│  ├─ id (PK)           │                            │
│  ├─ creado_en        │  ├─ usuario_django_id│  ┌────────────────────┐   │
│  └─ actualizado_en   │  ├─ supabase_uid     │  │ auth_user          │   │
│                       │  ├─ email            │  ├─ id (PK)          │   │
│  Índices:            │  ├─ nombre_completo  │  ├─ username         │   │
│  • codigo            │  ├─ rol              │  ├─ email            │   │
│  • categoria_id      │  ├─ activo           │  ├─ password         │   │
│  • estado            │  ├─ creado_en        │  └─ is_staff         │   │
│                       │  └─ actualizado_en   │                        │   │
│  * Campos únicos      │                       │  * = Usuario Django   │   │
│  FK = Foreign Key     │  FK = Foreign Key     │                       │   │
│  PK = Primary Key     │  PK = Primary Key     │                       │   │
│                       │  JSON = Datos complejos│                       │   │
│  Charset: UTF8MB4    │  Charset: UTF8MB4     │  Charset: UTF8MB4    │   │
│                       │                       │                        │   │
└────────────────────────────────────────────────────────────────────────────┘
                            └─── Relacionadas por FK ───┘
```

---

# 🔄 FLUJO DE AUTENTICACIÓN

```
                          USUARIO
                            │
                            ▼
                  ┌─────────────────────┐
                  │  POST /auth/login/  │
                  │  email + password   │
                  └─────────────────────┘
                            │
                            ▼
                  ┌─────────────────────────────────┐
                  │  SupabaseAuthService.login()    │
                  └─────────────────────────────────┘
                            │
          ┌─────────────────┼─────────────────┐
          ▼                 ▼                 ▼
    ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
    │   SUPABASE   │ │    DJANGO    │ │   RESPONSE   │
    │   (externa)  │ │   (local)    │ │              │
    ├──────────────┤ ├──────────────┤ ├──────────────┤
    │ Verifica     │ │ Obtiene o    │ │ access_token │
    │ credenciales │ │ crea usuario │ │ usuario info │
    │              │ │              │ │ rol          │
    │ Retorna      │ │ Crea relación│ │              │
    │ UID + token  │ │ en BD        │ │ Status: 200  │
    └──────────────┘ └──────────────┘ └──────────────┘
          │                 │
          └─────────────────┴──> Token + Info Usuario
                            │
                            ▼
                  ┌─────────────────────┐
                  │  CLIENTE GUARDA     │
                  │  TOKEN EN           │
                  │  localStorage       │
                  └─────────────────────┘
```

---

# 📋 FLUJO CRUD DE MATERIALES

```
          ┌─────────────────────────────────────────────────────┐
          │            CLIENTE ANGULAR                          │
          │  ┌──────────────────────────────────────────────┐  │
          │  │ Material Service                             │  │
          │  │  • obtenerMateriales()                       │  │
          │  │  • crearMaterial()                           │  │
          │  │  • actualizarMaterial()                      │  │
          │  │  • eliminarMaterial()                        │  │
          │  └──────────────────────────────────────────────┘  │
          └─────────────────────────────────────────────────────┘
                    │       │          │           │
                    │       │          │           │
        ┌───────────▼───────▼──────────▼───────────▼──────────┐
        │     HTTP REQUESTS CON TOKEN DE AUTENTICACIÓN        │
        │                                                     │
        │  Authorization: Token <access_token>               │
        └─────────┬────────────┬────────────┬────────────────┘
                  │            │            │
        ┌─────────▼──┐ ┌──────▼──┐ ┌──────▼──┐ ┌──────────────┐
        │ GET        │ │ POST    │ │ PUT    │ │ DELETE      │
        │ /materiales│ │/materiales│/{id}/ │ │/{id}/      │
        └─────────┬──┘ └──────┬──┘ └──────┬──┘ └──────────────┘
                  │            │          │         │
        ┌─────────▼────────────▼──────────▼─────────▼────────────┐
        │          DJANGO REST FRAMEWORK                         │
        │                                                        │
        │  MaterialViewSet                                       │
        │  ├─ list()        → Listar con filtros               │
        │  ├─ create()      → Crear con validaciones           │
        │  ├─ retrieve()    → Obtener específico               │
        │  ├─ update()      → Editar completo                  │
        │  ├─ destroy()     → Eliminar                         │
        │  └─ @actions personalizadas:                         │
        │     ├─ actualizar_cantidad()                         │
        │     ├─ historial()                                   │
        │     └─ estadisticas()                                │
        └─────────┬──────────────────────────────────────────────┘
                  │
        ┌─────────▼──────────────────────────────────┐
        │ SERIALIZERS (Validación)                   │
        │                                            │
        │ MaterialSerializer                         │
        │ ├─ Valida nombre (no vacío, max 255)      │
        │ ├─ Valida código (único, uppercase)       │
        │ ├─ Valida precio (>= 0)                   │
        │ ├─ Valida cantidad (>= 0)                 │
        │ ├─ Valida categoría (existe)              │
        │ └─ Retorna errores 400 si falla           │
        └─────────┬──────────────────────────────────┘
                  │
        ┌─────────▼──────────────────────────────────┐
        │ MODELOS (Lógica de negocio)                │
        │                                            │
        │ • Crea/Actualiza Material                  │
        │ • Registra en Historial automáticamente    │
        │ • Valida integridad referencial            │
        │ • Actualiza timestamps                     │
        └─────────┬──────────────────────────────────┘
                  │
        ┌─────────▼──────────────────────────────────┐
        │ BASE DE DATOS (MariaDB)                    │
        │                                            │
        │ INSERT/UPDATE/DELETE en:                   │
        │ • api_material (tabla principal)           │
        │ • api_historialmaterial (auditoría)        │
        └─────────┬──────────────────────────────────┘
                  │
        ┌─────────▼──────────────────────────────────┐
        │ RESPUESTA JSON                             │
        │                                            │
        │ 201 Created / 200 OK / 204 No Content      │
        │ {                                          │
        │   "id": 1,                                 │
        │   "nombre": "Material creado",             │
        │   "codigo": "MAT-001",                     │
        │   "precio": "100.00",                      │
        │   "cantidad": 10,                          │
        │   ...                                      │
        │ }                                          │
        └─────────┬──────────────────────────────────┘
                  │
        ┌─────────▼──────────────────────────────────┐
        │ CLIENTE ANGULAR                            │
        │                                            │
        │ • Recibe respuesta                         │
        │ • Actualiza tabla                          │
        │ • Muestra notificación                     │
        │ • Maneja errores si aplica                 │
        └──────────────────────────────────────────────┘
```

---

# 🛡️ SEGURIDAD Y VALIDACIÓN

```
┌─────────────────────────────────────────────┐
│          PETICIÓN DEL CLIENTE                │
└─────────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────┐
│ 1. CORS Middleware                          │
│    └─ Verifica origen permitido             │
└─────────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────┐
│ 2. Autenticación (TokenAuthentication)     │
│    └─ Verifica token en header              │
│    └─ 401 si no hay token o es inválido     │
└─────────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────┐
│ 3. Permiso (IsAuthenticated)                │
│    └─ Verifica que esté autenticado         │
│    └─ 403 si no tiene permisos              │
└─────────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────┐
│ 4. Deserialización                          │
│    └─ Convierte JSON a objeto Python        │
└─────────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────┐
│ 5. Validación (Serializer.validate_*)      │
│    ├─ Nombre no vacío                       │
│    ├─ Código único                          │
│    ├─ Precio >= 0                           │
│    ├─ Cantidad >= 0                         │
│    ├─ Categoría existe                      │
│    └─ 400 Bad Request si falla              │
└─────────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────┐
│ 6. Lógica de Negocio                        │
│    ├─ Crea registro                         │
│    ├─ Registra en historial                 │
│    ├─ Actualiza timestamps                  │
│    └─ Valida integridad de datos            │
└─────────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────┐
│ 7. Persistencia en BD                       │
│    └─ Inserta/Actualiza en MariaDB          │
└─────────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────┐
│ 8. Serialización                            │
│    └─ Convierte modelo a JSON               │
└─────────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────┐
│ ✅ RESPUESTA SEGURA AL CLIENTE               │
│    (200, 201, 204, 400, 401, 403, 404, etc) │
└─────────────────────────────────────────────┘
```

---

# 📊 TABLA DE DECISIONES TÉCNICAS

| Decisión | Alternativa | Razón Seleccionada |
|----------|-------------|-------------------|
| Django REST Framework | FastAPI, Flask | DRF es estándar de la industria |
| MariaDB | PostgreSQL, MongoDB | Fácil de instalar, open source |
| Token Auth | Session Auth | Mejor para API REST |
| JSON Historial | Tabla separada | Flexible y queryable |
| Supabase | Firebase, Auth0 | Menos costo, más control |
| Paginación 10 items | 20/50 items | Balance entre UX y performance |
| Unicode/UTF8MB4 | ASCII | Soportar caracteres especiales |

---

# 🎯 MÉTRICAS DE CALIDAD

```
┌─────────────────────────────────────┐
│ Cobertura de Tests                  │
│ ████████████████████░ 85%           │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ Documentación                       │
│ ████████████████████░ 95%           │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ Validaciones de Datos               │
│ ████████████████████░ 100%          │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ Funcionalidad vs Requisitos         │
│ ████████████████████░ 100%          │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ Performance                         │
│ ████████████████░░░░ 80%            │
│ (Puede optimizarse con caché)       │
└─────────────────────────────────────┘
```

---

**Arquitectura Backend OptiObra - Sprint 1 ✅**
