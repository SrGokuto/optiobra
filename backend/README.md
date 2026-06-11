# Definición de rutas de API
| Método | Ruta                 | Descripción                    | Módulo                  |
| ------ | -------------------- | ------------------------------ | ----------------------- |
| POST   | /api/auth/register   | Registrar nuevos usuarios      | Autenticación           |
| POST   | /api/auth/login      | Iniciar sesión en el sistema   | Autenticación           |
| POST   | /api/auth/logout     | Cerrar sesión                  | Autenticación           |
| GET    | /api/usuarios        | Consultar usuarios registrados | Usuarios                |
| POST   | /api/usuarios        | Crear usuarios                 | Usuarios                |
| PUT    | /api/usuarios/{id}   | Actualizar usuarios            | Usuarios                |
| DELETE | /api/usuarios/{id}   | Desactivar usuarios            | Usuarios                |
| GET    | /api/proyectos       | Consultar proyectos            | Proyectos               |
| POST   | /api/proyectos       | Registrar proyectos            | Proyectos               |
| PUT    | /api/proyectos/{id}  | Modificar proyectos            | Proyectos               |
| DELETE | /api/proyectos/{id}  | Eliminar proyectos             | Proyectos               |
| GET    | /api/materiales      | Consultar materiales           | Materiales              |
| POST   | /api/materiales      | Añadir materiales              | Materiales              |
| PUT    | /api/materiales/{id} | Editar materiales              | Materiales              |
| DELETE | /api/materiales/{id} | Eliminar materiales            | Materiales              |
| GET    | /api/trabajadores    | Consultar trabajadores         | Trabajadores            |
| POST   | /api/trabajadores    | Asociar trabajadores a obra    | Trabajadores            |
| GET    | /api/reportes        | Generar reportes               | Reportes                |
| GET    | /api/presupuestos    | Consultar presupuestos         | Presupuestos            |
| POST   | /api/estimaciones    | Generar estimaciones IA        | Inteligencia Artificial |
| POST   | /api/avance          | Crear avance de obra           | Avance de obra          |
| PUT    | /api/avance/{id}     | Editar avance de obra          | Avance de obra          |
| DELETE | /api/avance/{id}     | Borrar avance de obra          | Avance de obra          |
