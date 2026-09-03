"""
Definición central de roles, jerarquía y permisos del sistema.

Roles disponibles (nivel ascendente):
- usuario:      usuario que se registra por su cuenta (sin permisos de gestión)
- obrero:       ve materiales (solo lectura) y las tareas asignadas a él
- arquitecto:   designa materiales, presupuestos, proyectos, avance de obra
- maestro_obra: mismo nivel que arquitecto
- supervisor:   nivel superior a arquitecto
- ingeniero:    nivel superior a arquitecto
- admin:        administrador principal de la obra (todo)

Cualquier rol NO listado aquí (p. ej. roles heredados de Supabase) se trata
como "usuario" por defecto.
"""
from rest_framework.permissions import BasePermission, SAFE_METHODS

USUARIO = 'usuario'
OBRERO = 'obrero'
ARQUITECTO = 'arquitecto'
MAESTRO_OBRA = 'maestro_obra'
SUPERVISOR = 'supervisor'
INGENIERO = 'ingeniero'
ADMIN = 'admin'

# Jerarquía: a mayor número, mayor nivel de acceso
NIVEL = {
    USUARIO: 10,
    OBRERO: 20,
    ARQUITECTO: 30,
    MAESTRO_OBRA: 30,
    SUPERVISOR: 40,
    INGENIERO: 40,
    ADMIN: 100,
}

ROLES_GESTION = [ARQUITECTO, MAESTRO_OBRA, SUPERVISOR, INGENIERO, ADMIN]
ROLES_OBREROS = [OBRERO, *ROLES_GESTION]
ROLES_ADMIN = [ADMIN]


def nivel_rol(rol):
    """Devuelve el nivel numérico de un rol (por defecto el de 'usuario')."""
    return NIVEL.get(rol, NIVEL[USUARIO])


def obtener_rol(user):
    """Obtiene el rol de un usuario a partir de su relación UsuarioSupabase."""
    if not user or not user.is_authenticated:
        return None
    try:
        rol = user.usuariosupabase.rol
    except Exception:
        return USUARIO
    return rol or USUARIO


def es_rol(user, *roles):
    """Devuelve True si el usuario tiene alguno de los roles dados."""
    return obtener_rol(user) in roles


def rol_minimo(user, rol_objetivo):
    """Devuelve True si el usuario tiene al menos el nivel del rol objetivo."""
    rol = obtener_rol(user)
    return nivel_rol(rol) >= nivel_rol(rol_objetivo)


class TieneRol(BasePermission):
    """Permite el acceso si el usuario tiene un rol de los permitidos."""
    roles_permitidos = ()

    def has_permission(self, request, view):
        return es_rol(request.user, *self.roles_permitidos)


class TieneRolMinimo(BasePermission):
    """Permite el acceso si el usuario alcanza al menos un rol objetivo."""
    rol_objetivo = USUARIO

    def has_permission(self, request, view):
        return rol_minimo(request.user, self.rol_objetivo)


class EsAdmin(BasePermission):
    """Solo administradores."""
    def has_permission(self, request, view):
        return es_rol(request.user, ADMIN)


class EsGestion(BasePermission):
    """Roles de gestión: arquitecto, maestro de obra, supervisor, ingeniero, admin."""
    def has_permission(self, request, view):
        return es_rol(request.user, *ROLES_GESTION)


class EsObreroOMas(BasePermission):
    """Obrero y roles de gestión (lee). No incluye al 'usuario' normal."""
    def has_permission(self, request, view):
        return es_rol(request.user, *ROLES_OBREROS)


class MaterialesPermiso(BasePermission):
    """
    Obrero: solo lectura. Roles de gestión: lectura y escritura.
    'usuario': sin acceso.
    """
    def has_permission(self, request, view):
        rol = obtener_rol(request.user)
        if es_rol(request.user, *ROLES_OBREROS):
            if request.method in SAFE_METHODS:
                return True
            return es_rol(request.user, *ROLES_GESTION)
        return False


class TareasPermiso(BasePermission):
    """
    Obrero: solo lectura de sus propias tareas (filtro en get_queryset).
    Roles de gestión: lectura y escritura.
    """
    def has_permission(self, request, view):
        rol = obtener_rol(request.user)
        if es_rol(request.user, *ROLES_OBREROS):
            if request.method in SAFE_METHODS:
                return True
            return es_rol(request.user, *ROLES_GESTION)
        return False


class UsuariosPermiso(BasePermission):
    """
    Gestión de usuarios: arquitecto, maestro de obra, supervisor, ingeniero y admin.
    Admin puede todo; los demás ven/solo gestionan usuarios bajo su cargo (creado_por).
    """
    def has_permission(self, request, view):
        return es_rol(request.user, *ROLES_GESTION)
