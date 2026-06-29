# 📋 CHECKLIST DE DEMOSTRACIÓN - Sprint 1

## ✅ Requisitos Técnicos

### 1. **Módulo Funcional y No Solo Diseño**
- [x] CRUD de Materiales totalmente funcional
- [x] 5 endpoints implementados: GET, POST, PUT, DELETE, actualizar_cantidad
- [x] Base de datos persistente con MariaDB
- [x] Datos se guardan y recuperan correctamente

### 2. **Módulo Corresponde al Objetivo del Sprint 1**
- [x] Sistema de gestión de materiales implementado
- [x] Autenticación funcional con Supabase
- [x] Base de datos local MariaDB
- [x] Endpoints según especificación entregada

### 3. **Autenticación Funcional**
- [x] Sistema de registro de usuarios
- [x] Sistema de login con validación
- [x] Integración con Supabase
- [x] Token JWT para proteger endpoints
- [x] Logout funcional

### 4. **Validación de Inicio de Sesión**
- [x] Valida email formato correcto
- [x] Valida contraseña mínima 6 caracteres
- [x] Retorna error si credenciales incorrectas
- [x] Mensajes claros en español
- [x] Códigos de estado HTTP correctos (401, 400)

### 5. **Mensajes Claros en Errores**
- [x] "Email o contraseña incorrectos" en login fallido
- [x] "El email ya está registrado" en registro duplicado
- [x] "El email es requerido" si falta
- [x] "La contraseña debe tener al menos 6 caracteres"
- [x] Validaciones de campos específicas en cada operación

### 6. **Registro de Nuevos Usuarios**
- [x] Endpoint POST /api/auth/register/ funcional
- [x] Crea usuario en Supabase
- [x] Crea relación en base de datos local
- [x] Retorna información del usuario creado
- [x] Genera username único automáticamente

### 7. **Validación de Campos Obligatorios en Registro**
- [x] Email requerido y validado
- [x] Contraseña requerida y con longitud mínima
- [x] Formato de email validado (@, .)
- [x] Mensaje claro para cada validación
- [x] Retorna error 400 con detalles

### 8. **Datos de Registro se Almacenan Correctamente**
- [x] Usuarios guardados en Supabase
- [x] Relación guardada en tabla UsuarioSupabase
- [x] Datos recuperables desde base de datos
- [x] Contraseñas hasheadas (no en texto plano)
- [x] Email único (sin duplicados)

### 9. **CRUD Principal Identificado Claramente**
- [x] Materiales es el CRUD principal
- [x] Tabla bien estructurada en models.py
- [x] Documentación clara en README.md
- [x] Modelos relacionados (Categoría, Historial)
- [x] Nombre y código único por material

### 10. **CRUD Permite Crear Registros**
- [x] POST /api/materiales/ funcional
- [x] Validaciones de campos obligatorios
- [x] Retorna material creado con ID
- [x] Registra en historial automáticamente
- [x] Código de estado 201 (Created)

### 11. **CRUD Permite Listar/Consultar Registros**
- [x] GET /api/materiales/ retorna lista paginada
- [x] Búsqueda por nombre, código, descripción
- [x] Filtros por categoría, estado, disponibilidad
- [x] Ordenamiento por nombre, precio, fecha
- [x] Incluye información de categoría y usuario

### 12. **CRUD Permite Editar Registros**
- [x] PUT /api/materiales/{id}/ completo
- [x] PATCH /api/materiales/{id}/ parcial
- [x] Validaciones igual que creación
- [x] Retorna material actualizado
- [x] Registra cambios en historial

### 13. **CRUD Permite Eliminar Registros**
- [x] DELETE /api/materiales/{id}/ funcional
- [x] Retorna 204 No Content
- [x] Registra eliminación en historial
- [x] No recuperable (borrado permanente)

### 14. **Frontend Conectado con Backend**
- [ ] Angular conecta a endpoints Django
- [ ] Usa interceptor para agregar token
- [ ] Servicios creados (auth, material)
- [ ] Manejo de errores implementado
- [ ] CORS configurado correctamente

### 15. **Datos Mostrados Provienen del Backend**
- [ ] Materiales se cargan desde /api/materiales/
- [ ] Categorías desde /api/categorias/
- [ ] Usuario actual desde /api/auth/me/
- [ ] No hay datos hardcodeados
- [ ] Paginación funcional

### 16. **Acciones Reflejadas en Base de Datos**
- [x] CREATE Material → Base de datos actualizada
- [x] UPDATE Material → Registra cambios
- [x] DELETE Material → Historial conserva registro
- [x] Cantidad actualizada correctamente
- [x] Timestamps automáticos

### 17. **Código Actualizado en Repositorio**
- [x] Repositorio en GitHub
- [x] Rama development/jeonardo
- [x] Commits significativos
- [x] README.md documentado
- [x] .gitignore configurado

### 18. **Estructura Ordenada del Proyecto**
- [x] Carpeta `/api/` con modelos, vistas, serializers
- [x] Carpeta `/config/` con configuración
- [x] Carpeta `/api/management/commands/` para utilidades
- [x] Archivos de configuración (.env, requirements.txt)
- [x] Documentación (README.md, INTEGRACION_FRONTEND.md)

### 19. **Sistema Ejecuta Sin Errores Críticos**
- [x] Servidor inicia sin errores: `python manage.py runserver`
- [x] Migraciones aplican correctamente
- [x] No hay errores de importación
- [x] Conecta correctamente a MariaDB
- [x] Endpoints responden sin excepciones

### 20. **Pruebas Iniciales del Módulo**
- [x] Suite completa de tests unitarios (tests.py)
- [x] 20+ test cases implementados
- [x] Tests de modelos, vistas, API
- [x] Validaciones probadas
- [x] Ejecutar con: `python manage.py test`

### 21. **Equipo Sabe Explicar Qué Funciona y Qué Falta**
- [x] Documentación de endpoints completada
- [x] Guía de integración frontend creada
- [x] Instrucciones de setup claras
- [x] Problemas conocidos documentados
- [x] Roadmap de funcionalidades futuras

### 22. **Todos/Mayoría de Integrantes Participan**
- [x] Commits en repositorio
- [x] Código comentado y documentado
- [x] División clara de responsabilidades
- [x] Pruebas ejecutables por cualquiera
- [x] Setup automatizado (init.sh)

---

## 🚀 DEMOSTRACIÓN PASO A PASO

### **Paso 1: Preparación (5 min)**

```bash
# 1. Abrir terminal en /home/jeonardo/optiobra/backend
cd backend

# 2. Activar entorno virtual
source venv/bin/activate

# 3. Iniciar servidor
python manage.py runserver
```

**Mostrar:**
- ✅ Servidor inicia sin errores
- ✅ Mensaje "Starting development server at http://127.0.0.1:8000/"

---

### **Paso 2: Autenticación (10 min)**

#### **2.1 Acceder al Admin**
```
Abrir: http://localhost:8000/admin/
Usuario: admin
Contraseña: admin123
```

**Mostrar:**
- ✅ Dashboard administrativo
- ✅ Usuarios, Materiales, Categorías creados
- ✅ Historial de cambios

#### **2.2 Registro de Usuario (Postman o cURL)**
```bash
curl -X POST http://localhost:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo@optiobra.local",
    "password": "demo123456",
    "nombre_completo": "Usuario Demo"
  }'
```

**Mostrar:**
- ✅ Respuesta 201 Created
- ✅ Usuario creado con supabase_uid
- ✅ Email único validado

#### **2.3 Login**
```bash
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo@optiobra.local",
    "password": "demo123456"
  }'
```

**Mostrar:**
- ✅ Retorna access_token
- ✅ Información del usuario
- ✅ Rol asignado

**Guardar token para los siguientes pasos**

---

### **Paso 3: CRUD de Materiales (15 min)**

#### **3.1 Listar Materiales (GET)**
```bash
curl -X GET "http://localhost:8000/api/materiales/?search=cable" \
  -H "Authorization: Token YOUR_TOKEN"
```

**Mostrar:**
- ✅ Lista de 7 materiales de ejemplo
- ✅ Paginación (10 por página)
- ✅ Búsqueda funciona
- ✅ Información completa (nombre, precio, cantidad)

#### **3.2 Crear Material (POST)**
```bash
curl -X POST http://localhost:8000/api/materiales/ \
  -H "Authorization: Token YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Lamina de Aluminio",
    "codigo": "LAM-ALU-DEMO",
    "categoria": 1,
    "precio": "45.50",
    "cantidad": 20,
    "unidad_medida": "placa",
    "estado": "disponible",
    "proveedor": "Metales Premium",
    "descripcion": "Lámina de aluminio 2mm de espesor"
  }'
```

**Mostrar:**
- ✅ Respuesta 201 Created
- ✅ Material creado con ID
- ✅ Campos validados
- ✅ Entrada en historial creada

#### **3.3 Obtener Material (GET específico)**
```bash
curl -X GET "http://localhost:8000/api/materiales/LAST_ID/" \
  -H "Authorization: Token YOUR_TOKEN"
```

**Mostrar:**
- ✅ Detalles completos del material
- ✅ Categoría_nombre incluida
- ✅ Usuario que lo creó

#### **3.4 Editar Material (PUT)**
```bash
curl -X PUT http://localhost:8000/api/materiales/LAST_ID/ \
  -H "Authorization: Token YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Lámina de Aluminio Premium",
    "codigo": "LAM-ALU-DEMO",
    "categoria": 1,
    "precio": "48.00",
    "cantidad": 25,
    "unidad_medida": "placa",
    "estado": "disponible"
  }'
```

**Mostrar:**
- ✅ Material actualizado
- ✅ Cambios registrados en historial
- ✅ Valores anteriores vs nuevos guardados

#### **3.5 Actualizar Cantidad**
```bash
curl -X POST "http://localhost:8000/api/materiales/LAST_ID/actualizar_cantidad/" \
  -H "Authorization: Token YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "cantidad": 15,
    "tipo": "salida"
  }'
```

**Mostrar:**
- ✅ Cantidad actualizada (25 → 15)
- ✅ Historial registra la salida
- ✅ Tipo de movimiento guardado

#### **3.6 Ver Historial**
```bash
curl -X GET "http://localhost:8000/api/materiales/LAST_ID/historial/" \
  -H "Authorization: Token YOUR_TOKEN"
```

**Mostrar:**
- ✅ Todas las acciones del material
- ✅ Creación, edición, cambio de cantidad
- ✅ Usuario y fecha de cada cambio
- ✅ Valores anteriores vs nuevos

#### **3.7 Ver Estadísticas**
```bash
curl -X GET "http://localhost:8000/api/materiales/estadisticas/" \
  -H "Authorization: Token YOUR_TOKEN"
```

**Mostrar:**
- ✅ Total de materiales
- ✅ Disponibles vs sin stock
- ✅ Valor total del inventario
- ✅ Distribución por categoría

#### **3.8 Eliminar Material (DELETE)**
```bash
curl -X DELETE "http://localhost:8000/api/materiales/LAST_ID/" \
  -H "Authorization: Token YOUR_TOKEN"
```

**Mostrar:**
- ✅ Respuesta 204 No Content
- ✅ Material desaparece de lista
- ✅ Historial conserva registro de eliminación

---

### **Paso 4: Validaciones y Manejo de Errores (5 min)**

#### **4.1 Crear sin Campo Obligatorio**
```bash
curl -X POST http://localhost:8000/api/materiales/ \
  -H "Authorization: Token YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "codigo": "TEST-001",
    "categoria": 1,
    "precio": "10.00"
  }'
```

**Mostrar:**
- ✅ Error 400 Bad Request
- ✅ Mensaje: "El nombre del material no puede estar vacío"

#### **4.2 Código Duplicado**
```bash
curl -X POST http://localhost:8000/api/materiales/ \
  -H "Authorization: Token YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Material Duplicado",
    "codigo": "ETH-CAT6-001",
    "categoria": 1,
    "precio": "10.00",
    "cantidad": 10
  }'
```

**Mostrar:**
- ✅ Error 400
- ✅ Mensaje: "El código 'ETH-CAT6-001' ya existe en el sistema"

#### **4.3 Precio Negativo**
```bash
curl -X POST http://localhost:8000/api/materiales/ \
  -H "Authorization: Token YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Material Invalido",
    "codigo": "INVALID-001",
    "categoria": 1,
    "precio": "-10.00",
    "cantidad": 10
  }'
```

**Mostrar:**
- ✅ Error 400
- ✅ Mensaje: "El precio no puede ser negativo"

#### **4.4 Sin Autenticación**
```bash
curl -X GET "http://localhost:8000/api/materiales/"
```

**Mostrar:**
- ✅ Error 401 Unauthorized
- ✅ Mensaje: "Authentication credentials were not provided"

---

### **Paso 5: Base de Datos (5 min)**

#### **5.1 Ver Datos en Admin**
```
Abrir: http://localhost:8000/admin/api/material/
```

**Mostrar:**
- ✅ Todos los materiales listados
- ✅ Filtros por categoría, estado
- ✅ Búsqueda por nombre/código

#### **5.2 Ver Historial en Admin**
```
Abrir: http://localhost:8000/admin/api/historialmaterial/
```

**Mostrar:**
- ✅ Todas las acciones registradas
- ✅ Creación, ediciones, eliminaciones
- ✅ Usuario y fecha de cada acción
- ✅ Valores anteriores y nuevos

#### **5.3 Datos Persistentes**
- Reiniciar servidor sin perder datos
- Crear material, reiniciar, verificar que sigue ahí

**Mostrar:**
- ✅ Base de datos es persistente
- ✅ MariaDB guarda datos correctamente

---

### **Paso 6: Pruebas Automatizadas (5 min)**

```bash
# Ejecutar todas las pruebas
python manage.py test

# O específicamente
python manage.py test api -v 2
```

**Mostrar:**
- ✅ 20+ tests ejecutados
- ✅ Todos pasan correctamente
- ✅ Cobertura de:
  - Modelos
  - Serializers
  - Endpoints CRUD
  - Validaciones
  - Autenticación

---

### **Paso 7: Documentación (2 min)**

**Mostrar archivos:**

1. **README.md** - Documentación completa
   - Instalación
   - Endpoints
   - Ejemplos
   - Troubleshooting

2. **INTEGRACION_FRONTEND.md** - Cómo conectar Angular
   - Servicios
   - Interceptores
   - Ejemplos de código

3. **DATABASE_SETUP.md** - Setup de base de datos
   - Creación de BD
   - Estructura de tablas
   - Backup/Restore

4. **postman_collection.json** - Para probar en Postman
   - 20+ requests predefinidas
   - Variables de entorno

---

## 📊 RESUMEN DE CUMPLIMIENTO

| # | Requisito | Estado | Evidencia |
|---|-----------|--------|-----------|
| 1 | Módulo funcional | ✅ | CRUD completo funcionando |
| 2 | Corresponde a Sprint 1 | ✅ | Materiales + Auth + BD |
| 3 | Autenticación | ✅ | Login/Registro con Supabase |
| 4 | Validación login | ✅ | Error 401 con mensaje |
| 5 | Mensajes de error | ✅ | Mensajes en español |
| 6 | Registro de usuarios | ✅ | POST /api/auth/register/ |
| 7 | Validación campos | ✅ | Email, password, requeridos |
| 8 | Datos guardados | ✅ | BD persistente |
| 9 | CRUD identificado | ✅ | Materiales es principal |
| 10 | Crear | ✅ | POST /api/materiales/ |
| 11 | Listar | ✅ | GET /api/materiales/ |
| 12 | Editar | ✅ | PUT/PATCH /api/materiales/{id}/ |
| 13 | Eliminar | ✅ | DELETE /api/materiales/{id}/ |
| 14 | Frontend conectado | 🔄 | En progreso (Angular) |
| 15 | Datos del backend | 🔄 | Listos endpoints |
| 16 | Acciones reflejadas | ✅ | BD actualizada en tiempo real |
| 17 | Código en repositorio | ✅ | GitHub branch development |
| 18 | Estructura ordenada | ✅ | Carpetas organizadas |
| 19 | Sin errores críticos | ✅ | Server inicia OK |
| 20 | Pruebas | ✅ | 20+ tests unitarios |
| 21 | Explicación | ✅ | Documentación completa |
| 22 | Participación equipo | ✅ | Commits en repositorio |

---

## 🎯 NOTAS IMPORTANTES

1. **Token para pruebas:** Guardar el token del login para usar en todas las peticiones
2. **Admin panel:** Accesible en http://localhost:8000/admin
3. **Datos de prueba:** Ya precargados al ejecutar `load_test_data`
4. **CORS:** Configurado para Angular en localhost:4200
5. **Supabase:** Opcionales credenciales si no se configura

---

**Demostración: ~45-60 minutos**
**Backend Completado: ✅ 100%**
