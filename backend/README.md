# Backend OptiObra - Django REST API

Backend funcional para OptiObra desarrollado con Django REST Framework, autenticación con Supabase y base de datos MariaDB.

## 📋 Requisitos Cumplidos

- ✅ **Módulo funcional**: CRUD completo de Materiales
- ✅ **Autenticación**: Sistema de login con Supabase
- ✅ **Validaciones**: Campos obligatorios y mensajes de error claros
- ✅ **Registro de usuarios**: Sistema de registro con validaciones
- ✅ **CRUD Principal**: Materiales (Create, Read, Update, Delete)
- ✅ **Historial de cambios**: Auditoría completa de modificaciones
- ✅ **Base de datos**: Integración con MariaDB local
- ✅ **Estructura ordenada**: Carpetas organizadas y código limpio
- ✅ **Pruebas**: Suite completa de tests unitarios
- ✅ **Documentación**: API documentation y ejemplos

## 🚀 Instalación y Configuración

### 1. Crear entorno virtual
```bash
cd backend
python -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate
```

### 2. Instalar dependencias
```bash
pip install -r requirements.txt
```

### 3. Configurar variables de entorno
```bash
cp .env.example .env
```

Edita `.env` y configura:
- Base de datos MariaDB
- Credenciales de Supabase

### 4. Crear base de datos MariaDB
```bash
mysql -u root -p
CREATE DATABASE optiobra;
CREATE USER 'optiobra_user'@'localhost' IDENTIFIED BY '123456';
GRANT ALL PRIVILEGES ON optiobra.* TO 'optiobra_user'@'localhost';
FLUSH PRIVILEGES;
```

### 5. Ejecutar migraciones
```bash
python manage.py migrate
```

### 6. Cargar datos de prueba
```bash
python manage.py load_test_data
```

Esto crea:
- Categorías de materiales
- Usuario admin (usuario: `admin`, contraseña: `admin123`)
- Usuario de prueba (usuario: `usuario@optiobra.local`, contraseña: `prueba123`)
- 7 materiales de ejemplo

### 7. Crear superusuario (opcional)
```bash
python manage.py createsuperuser
```

### 8. Ejecutar servidor
```bash
python manage.py runserver
```

El servidor estará disponible en `http://localhost:8000`

## 📚 Endpoints API

### Autenticación

#### Registrar usuario
```
POST /api/auth/register/
Content-Type: application/json

{
    "email": "usuario@example.com",
    "password": "contraseña_segura",
    "nombre_completo": "Juan Pérez"
}
```

**Respuesta (201):**
```json
{
    "error": false,
    "mensaje": "Usuario registrado exitosamente",
    "usuario": {
        "id": 1,
        "username": "usuario",
        "email": "usuario@example.com",
        "supabase_uid": "uuid-aqui"
    }
}
```

#### Iniciar sesión
```
POST /api/auth/login/
Content-Type: application/json

{
    "email": "usuario@example.com",
    "password": "contraseña_segura"
}
```

**Respuesta (200):**
```json
{
    "error": false,
    "mensaje": "Login exitoso",
    "access_token": "token-jwt-aqui",
    "usuario": {
        "id": 1,
        "username": "usuario",
        "email": "usuario@example.com",
        "nombre_completo": "Juan Pérez",
        "rol": "usuario"
    }
}
```

#### Obtener información del usuario actual
```
GET /api/auth/me/
Authorization: Token <token-aqui>
```

#### Cerrar sesión
```
POST /api/auth/logout/
Authorization: Token <token-aqui>
```

### Materiales (CRUD Principal)

#### Listar materiales
```
GET /api/materiales/
Authorization: Token <token-aqui>
```

**Parámetros de filtro:**
- `search=keyword` - Buscar por nombre, código, descripción
- `categoria=1` - Filtrar por ID de categoría
- `estado=disponible` - Filtrar por estado (disponible, no_disponible, descontinuado)
- `disponible=true` - Materiales con cantidad > 0
- `page=1` - Paginación

**Respuesta (200):**
```json
{
    "count": 7,
    "next": null,
    "previous": null,
    "results": [
        {
            "id": 1,
            "nombre": "Cable Ethernet Cat6",
            "codigo": "ETH-CAT6-001",
            "descripcion": "Cable de red categoria 6",
            "categoria": 1,
            "categoria_nombre": "Electrónica",
            "precio": "12.50",
            "cantidad": 100,
            "unidad_medida": "metro",
            "estado": "disponible",
            "proveedor": "TechSupply Inc.",
            "creado_en": "2024-06-02T10:30:00Z",
            "actualizado_en": "2024-06-02T10:30:00Z",
            "creado_por": 1,
            "creado_por_nombre": "admin"
        }
    ]
}
```

#### Crear material
```
POST /api/materiales/
Authorization: Token <token-aqui>
Content-Type: application/json

{
    "nombre": "Tubo de Acero",
    "codigo": "TUB-ACE-001",
    "categoria": 2,
    "precio": "85.00",
    "cantidad": 25,
    "unidad_medida": "metro",
    "estado": "disponible",
    "proveedor": "Aceros Premium",
    "descripcion": "Tubo de acero inoxidable 1 pulgada"
}
```

**Validaciones:**
- Nombre: no vacío, máx 255 caracteres
- Código: único, no vacío
- Precio: no negativo
- Cantidad: no negativa
- Categoría: debe existir

#### Obtener material específico
```
GET /api/materiales/{id}/
Authorization: Token <token-aqui>
```

#### Editar material
```
PUT /api/materiales/{id}/
Authorization: Token <token-aqui>
Content-Type: application/json

{
    "nombre": "Tubo de Acero Actualizado",
    "codigo": "TUB-ACE-001",
    "categoria": 2,
    "precio": "90.00",
    "cantidad": 30,
    "unidad_medida": "metro",
    "estado": "disponible"
}
```

#### Editar parcialmente
```
PATCH /api/materiales/{id}/
Authorization: Token <token-aqui>
Content-Type: application/json

{
    "cantidad": 30,
    "precio": "90.00"
}
```

#### Eliminar material
```
DELETE /api/materiales/{id}/
Authorization: Token <token-aqui>
```

#### Actualizar cantidad de material
```
POST /api/materiales/{id}/actualizar_cantidad/
Authorization: Token <token-aqui>
Content-Type: application/json

{
    "cantidad": 50,
    "tipo": "ajuste"  # Opciones: ajuste, entrada, salida
}
```

#### Ver historial de cambios
```
GET /api/materiales/{id}/historial/
Authorization: Token <token-aqui>
```

**Respuesta:**
```json
{
    "count": 2,
    "next": null,
    "previous": null,
    "results": [
        {
            "id": 1,
            "material": 1,
            "material_nombre": "Cable Ethernet Cat6",
            "accion": "edicion",
            "usuario": 1,
            "usuario_nombre": "admin",
            "valores_anteriores": {"cantidad": 100},
            "valores_nuevos": {"cantidad": 95},
            "fecha": "2024-06-02T11:00:00Z"
        }
    ]
}
```

#### Obtener estadísticas
```
GET /api/materiales/estadisticas/
Authorization: Token <token-aqui>
```

**Respuesta:**
```json
{
    "total_materiales": 7,
    "materiales_disponibles": 6,
    "materiales_sin_stock": 1,
    "valor_total_inventario": 3500.50,
    "distribucion_por_categoria": [
        {
            "id": 1,
            "nombre": "Electrónica",
            "cantidad_materiales": 2
        }
    ]
}
```

### Categorías

#### Listar categorías
```
GET /api/categorias/
Authorization: Token <token-aqui>
```

#### Crear categoría
```
POST /api/categorias/
Authorization: Token <token-aqui>
Content-Type: application/json

{
    "nombre": "Nueva Categoría",
    "descripcion": "Descripción de la categoría"
}
```

#### Editar categoría
```
PUT /api/categorias/{id}/
Authorization: Token <token-aqui>
Content-Type: application/json

{
    "nombre": "Categoría Actualizada",
    "descripcion": "Nueva descripción"
}
```

#### Eliminar categoría
```
DELETE /api/categorias/{id}/
Authorization: Token <token-aqui>
```

## 🧪 Ejecutar Pruebas

```bash
# Todas las pruebas
python manage.py test

# Pruebas de un app específico
python manage.py test api

# Pruebas con verbosidad
python manage.py test api -v 2

# Pruebas de una clase específica
python manage.py test api.tests.MaterialAPITestCase

# Pruebas de un método específico
python manage.py test api.tests.MaterialAPITestCase.test_crear_material
```

## 📊 Panel Administrativo

Accede a `http://localhost:8000/admin/` con:
- Usuario: `admin`
- Contraseña: `admin123`

Desde aquí puedes:
- Gestionar materiales
- Gestionar categorías
- Ver historial de cambios
- Gestionar usuarios
- Gestionar acceso

## 🗄️ Estructura de Base de Datos

### Tablas principales

**Categorias**
```
id (PK)
nombre (VARCHAR 100, UNIQUE)
descripcion (TEXT)
creado_en (DATETIME)
actualizado_en (DATETIME)
```

**Materiales**
```
id (PK)
nombre (VARCHAR 255)
codigo (VARCHAR 50, UNIQUE)
categoria_id (FK)
precio (DECIMAL 10,2)
cantidad (INT)
unidad_medida (VARCHAR 50)
estado (VARCHAR 20)
proveedor (VARCHAR 255)
creado_en (DATETIME)
actualizado_en (DATETIME)
creado_por_id (FK User)
```

**HistorialMaterial**
```
id (PK)
material_id (FK)
accion (VARCHAR 20)
usuario_id (FK)
valores_anteriores (JSON)
valores_nuevos (JSON)
fecha (DATETIME)
```

**UsuarioSupabase**
```
id (PK)
usuario_django_id (FK User, UNIQUE)
supabase_uid (VARCHAR 255, UNIQUE)
email (EMAIL)
nombre_completo (VARCHAR 255)
rol (VARCHAR 50)
activo (BOOLEAN)
creado_en (DATETIME)
actualizado_en (DATETIME)
```

## 🔐 Seguridad

- Autenticación con tokens
- Validación de datos en serializers
- CORS configurado
- Campos read-only donde es necesario
- Auditoría completa de cambios
- Contraseñas hasheadas

## 📝 Configuración de Supabase

1. Crear proyecto en [Supabase](https://supabase.com)
2. Obtener:
   - Project URL
   - Anon Key
   - JWT Secret
3. Configurar en `.env`:
   ```
   SUPABASE_URL=https://tu-proyecto.supabase.co
   SUPABASE_KEY=tu-anon-key
   SUPABASE_JWT_SECRET=tu-jwt-secret
   ```

## 🐛 Solución de Problemas

### Error de conexión a base de datos
```bash
# Verificar que MariaDB está corriendo
mysql -u optiobra_user -p123456 -h 127.0.0.1 optiobra

# Reinstalar driver MySQL
pip install --upgrade mysql-connector-python
```

### Error de migraciones
```bash
# Eliminar migraciones y recrear
rm api/migrations/000*.py
python manage.py makemigrations
python manage.py migrate
```

### Puerto 8000 en uso
```bash
python manage.py runserver 8001
```

## 📦 Archivos Importantes

- `settings.py` - Configuración principal
- `urls.py` - Rutas de la API
- `models.py` - Modelos de datos
- `views.py` - Vistas y ViewSets
- `serializers.py` - Validaciones
- `services.py` - Lógica de autenticación
- `tests.py` - Pruebas unitarias
- `requirements.txt` - Dependencias

## 🔄 Flujo de Autenticación

1. Usuario se registra con email/contraseña
2. Se crea en Supabase y en Django
3. Usuario inicia sesión
4. Obtiene JWT token
5. Usa token en header `Authorization: Token <token>`
6. Todos los cambios se registran en historial

## 📈 Escalabilidad

- Índices en campos frecuentes
- Paginación automática
- Filtros optimizados
- JSON para datos complejos
- Auditoría sin afectar performance

## 📞 Soporte

Para problemas o preguntas sobre el backend, revisar:
1. Logs de Django (settings.py)
2. Console del navegador
3. Respuestas de error de API
4. Documentación de DRF: https://www.django-rest-framework.org/
5. Documentación de Django: https://docs.djangoproject.com/

---

**Desarrollado con Django REST Framework** ⚡

| GET    | /api/reportes        | Generar reportes               | Reportes                |
| GET    | /api/presupuestos    | Consultar presupuestos         | Presupuestos            |
| POST   | /api/estimaciones    | Generar estimaciones IA        | Inteligencia Artificial |
| POST   | /api/avance          | Crear avance de obra           | Avance de obra          |
| PUT    | /api/avance/{id}     | Editar avance de obra          | Avance de obra          |
| DELETE | /api/avance/{id}     | Borrar avance de obra          | Avance de obra          |
