from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.exceptions import ValidationError
from django.shortcuts import get_object_or_404
from django.contrib.auth.models import User
from django.db.models import Q, Avg, Sum, Count, F
import logging
import secrets

from .models import (
    Material, Categoria, HistorialMaterial, UsuarioSupabase,
    Proyecto, PerfilUsuario,
    ConfiguracionEmpresa, ConfiguracionSistema, Reporte, Tarea,
    ConversacionIA, MensajeIA,
)
from .serializers import (
    MaterialSerializer, CategoriaSerializer, HistorialMaterialSerializer,
    ProyectoSerializer,
    PerfilUsuarioSerializer, UsuarioDetalleSerializer, UsuarioCreateUpdateSerializer,
    ConfiguracionEmpresaSerializer, ConfiguracionSistemaSerializer, ConfiguracionGeneralSerializer,
    ReporteSerializer, GenerarReporteSerializer, TareaSerializer,
    ConversacionIASerializer, MensajeIASerializer,
)
from .roles import (
    EsAdmin, EsGestion, EsObreroOMas, MaterialesPermiso, TareasPermiso,
    UsuariosPermiso, obtener_rol, es_rol, rol_minimo, nivel_rol, ADMIN, OBRERO, USUARIO,
    ARQUITECTO, MAESTRO_OBRA, SUPERVISOR, INGENIERO,
    ROLES_ADMIN,
)
from .services import SupabaseAuthService

logger = logging.getLogger(__name__)
auth_service = SupabaseAuthService()


class CategoriaViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestionar categorías de materiales
    """
    queryset = Categoria.objects.all()
    serializer_class = CategoriaSerializer
    permission_classes = [MaterialesPermiso]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['nombre', 'descripcion']
    ordering_fields = ['nombre', 'creado_en']
    ordering = ['nombre']

    def get_queryset(self):
        """Obtener categorías con búsqueda"""
        queryset = super().get_queryset()
        search = self.request.query_params.get('search', '')
        if search:
            queryset = queryset.filter(
                Q(nombre__icontains=search) | Q(descripcion__icontains=search)
            )
        return queryset


class MaterialViewSet(viewsets.ModelViewSet):
    """
    ViewSet para el CRUD de materiales
    Endpoints disponibles:
    - GET /api/materiales/ - Listar materiales
    - POST /api/materiales/ - Crear material
    - GET /api/materiales/{id}/ - Obtener material
    - PUT /api/materiales/{id}/ - Editar material
    - PATCH /api/materiales/{id}/ - Editar parcialmente
    - DELETE /api/materiales/{id}/ - Eliminar material
    """
    queryset = Material.objects.all().select_related('categoria', 'creado_por')
    serializer_class = MaterialSerializer
    permission_classes = [MaterialesPermiso]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['nombre', 'codigo', 'descripcion', 'proveedor']
    ordering_fields = ['nombre', 'precio', 'cantidad', 'creado_en']
    ordering = ['-creado_en']

    def get_queryset(self):
        """Obtener materiales con filtros avanzados"""
        queryset = super().get_queryset()
        
        # Filtro por categoría
        categoria_id = self.request.query_params.get('categoria', '')
        if categoria_id:
            queryset = queryset.filter(categoria_id=categoria_id)
        
        # Filtro por estado
        estado = self.request.query_params.get('estado', '')
        if estado:
            queryset = queryset.filter(estado=estado)
        
        # Filtro por disponibilidad
        disponible = self.request.query_params.get('disponible', '')
        if disponible.lower() == 'true':
            queryset = queryset.filter(cantidad__gt=0, estado='disponible')
        elif disponible.lower() == 'false':
            queryset = queryset.filter(Q(cantidad__lte=0) | Q(estado__in=['no_disponible', 'descontinuado']))
        
        return queryset

    def perform_create(self, serializer):
        print("USER:", self.request.user)
        print("AUTH:", self.request.auth)
        """Crear material y registrar en historial"""
        material = serializer.save(creado_por=self.request.user)
        
        # Registrar en historial
        HistorialMaterial.objects.create(
            material=material,
            accion='creacion',
            usuario=self.request.user,
            valores_nuevos={
                'nombre': material.nombre,
                'codigo': material.codigo,
                'precio': str(material.precio),
                'cantidad': material.cantidad,
            }
        )
        
        logger.info(f"Material creado: {material.nombre} por {self.request.user.username}")

    def perform_update(self, serializer):
        """Actualizar material y registrar cambios en historial"""
        material_anterior = self.get_object()
        valores_anteriores = {
            'nombre': material_anterior.nombre,
            'codigo': material_anterior.codigo,
            'precio': str(material_anterior.precio),
            'cantidad': material_anterior.cantidad,
            'estado': material_anterior.estado,
        }
        
        material = serializer.save()
        
        valores_nuevos = {
            'nombre': material.nombre,
            'codigo': material.codigo,
            'precio': str(material.precio),
            'cantidad': material.cantidad,
            'estado': material.estado,
        }
        
        # Registrar en historial
        HistorialMaterial.objects.create(
            material=material,
            accion='edicion',
            usuario=self.request.user,
            valores_anteriores=valores_anteriores,
            valores_nuevos=valores_nuevos
        )
        
        logger.info(f"Material actualizado: {material.nombre} por {self.request.user.username}")

    def perform_destroy(self, instance):
        """Eliminar material y registrar en historial"""
        material_nombre = instance.nombre
        material_id = instance.id
        
        HistorialMaterial.objects.create(
            material=instance,
            accion='eliminacion',
            usuario=self.request.user,
            valores_anteriores={
                'nombre': instance.nombre,
                'codigo': instance.codigo,
                'precio': str(instance.precio),
            }
        )
        
        instance.delete()
        logger.info(f"Material eliminado: {material_nombre} (ID: {material_id}) por {self.request.user.username}")

    @action(detail=True, methods=['post'], permission_classes=[MaterialesPermiso])
    def actualizar_cantidad(self, request, pk=None):
        """
        Actualizar cantidad de un material
        POST /api/materiales/{id}/actualizar_cantidad/
        Body: {"cantidad": 50, "tipo": "ajuste"}
        """
        material = self.get_object()
        nueva_cantidad = request.data.get('cantidad')
        tipo_cambio = request.data.get('tipo', 'ajuste')  # ajuste, entrada, salida
        
        if nueva_cantidad is None:
            return Response(
                {'error': 'El campo cantidad es requerido'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            nueva_cantidad = int(nueva_cantidad)
            if nueva_cantidad < 0:
                return Response(
                    {'error': 'La cantidad no puede ser negativa'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        except (ValueError, TypeError):
            return Response(
                {'error': 'La cantidad debe ser un número entero'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        cantidad_anterior = material.cantidad
        material.cantidad = nueva_cantidad
        material.save()
        
        # Registrar en historial
        HistorialMaterial.objects.create(
            material=material,
            accion='cambio_cantidad',
            usuario=request.user,
            valores_anteriores={'cantidad': cantidad_anterior},
            valores_nuevos={'cantidad': nueva_cantidad, 'tipo': tipo_cambio}
        )
        
        serializer = self.get_serializer(material)
        return Response({
            'mensaje': 'Cantidad actualizada exitosamente',
            'material': serializer.data
        })

    @action(detail=True, methods=['get'], permission_classes=[MaterialesPermiso])
    def historial(self, request, pk=None):
        """
        Obtener historial de cambios de un material
        GET /api/materiales/{id}/historial/
        """
        material = self.get_object()
        historial = material.historial.all()
        
        page = self.paginate_queryset(historial)
        if page is not None:
            serializer = HistorialMaterialSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = HistorialMaterialSerializer(historial, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], permission_classes=[MaterialesPermiso])
    def estadisticas(self, request):
        """
        Obtener estadísticas de materiales
        GET /api/materiales/estadisticas/
        """
        total_materiales = Material.objects.count()
        total_valor_inventario = sum(
            m.precio * m.cantidad for m in Material.objects.all()
        )
        materiales_disponibles = Material.objects.filter(
            cantidad__gt=0, estado='disponible'
        ).count()
        materiales_sin_stock = Material.objects.filter(cantidad=0).count()
        
        categorias = Categoria.objects.annotate(
            cantidad_materiales=__import__('django.db.models', fromlist=['Count']).Count('materiales')
        ).values('id', 'nombre', 'cantidad_materiales')
        
        return Response({
            'total_materiales': total_materiales,
            'materiales_disponibles': materiales_disponibles,
            'materiales_sin_stock': materiales_sin_stock,
            'valor_total_inventario': float(total_valor_inventario),
            'distribucion_por_categoria': list(categorias),
        })


class DashboardViewSet(viewsets.ViewSet):
    """ViewSet para estadísticas del dashboard"""
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['get'])
    def estadisticas(self, request):
        """
        GET /api/dashboard/estadisticas/
        Retorna resumen general para el dashboard.
        """
        rol = obtener_rol(request.user)
        if es_rol(request.user, USUARIO):
            return Response({
                'rol': rol,
                'mensaje': 'Bienvenido a OptiObra. Tu cuenta no tiene permisos de gestión aún.',
                'dashboard_basico': True,
            })

        if es_rol(request.user, OBRERO):
            return Response({
                'rol': rol,
                'mensaje': 'Dashboard del obrero',
                'total_tareas_pendientes': Tarea.objects.filter(obrero=request.user, estado='pendiente').count(),
                'total_tareas_en_progreso': Tarea.objects.filter(obrero=request.user, estado='en_progreso').count(),
                'total_tareas_completadas': Tarea.objects.filter(obrero=request.user, estado='completada').count(),
                'total_materiales': Material.objects.count(),
            })

        total_proyectos = Proyecto.objects.count()
        proyectos_en_progreso = Proyecto.objects.filter(estado='en_proceso').count()
        total_materiales = Material.objects.count()
        total_obreros = User.objects.filter(usuariosupabase__rol=OBRERO).count()

        avance = Proyecto.objects.aggregate(promedio=Avg('porcentaje_avance'))
        avance_promedio = round(avance['promedio'] or 0)

        proyectos_recientes = Proyecto.objects.all()[:5].values(
            'id', 'nombre', 'estado', 'porcentaje_avance'
        )

        return Response({
            'rol': rol,
            'total_proyectos': total_proyectos,
            'proyectos_en_progreso': proyectos_en_progreso,
            'total_materiales': total_materiales,
            'total_obreros': total_obreros,
            'avance_promedio': avance_promedio,
            'proyectos_recientes': list(proyectos_recientes),
        })


class ProyectoViewSet(viewsets.ModelViewSet):
    """
    ViewSet para el CRUD de proyectos
    Endpoints disponibles:
    - GET /api/proyectos/ - Listar proyectos
    - POST /api/proyectos/ - Crear proyecto
    - GET /api/proyectos/{id}/ - Obtener proyecto
    - PUT /api/proyectos/{id}/ - Editar proyecto
    - PATCH /api/proyectos/{id}/ - Editar parcialmente
    - DELETE /api/proyectos/{id}/ - Eliminar proyecto
    """
    queryset = Proyecto.objects.all().select_related('creado_por')
    serializer_class = ProyectoSerializer
    permission_classes = [EsGestion]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['nombre', 'descripcion', 'responsable', 'direccion', 'ubicacion']
    ordering_fields = ['nombre', 'estado', 'avance', 'porcentaje_avance', 'creado_en', 'fecha_inicio']
    ordering = ['-creado_en']

    def get_queryset(self):
        """Obtener proyectos con filtros avanzados"""
        queryset = super().get_queryset()

        estado = self.request.query_params.get('estado', '')
        if estado:
            queryset = queryset.filter(estado=estado)

        search = self.request.query_params.get('search', '')
        if search:
            queryset = queryset.filter(
                Q(nombre__icontains=search) |
                Q(descripcion__icontains=search) |
                Q(responsable__icontains=search)
            )

        return queryset

    def perform_create(self, serializer):
        """Crear proyecto y registrar usuario"""
        proyecto = serializer.save(creado_por=self.request.user)
        logger.info(f"Proyecto creado: {proyecto.nombre} por {self.request.user.username}")

    def perform_update(self, serializer):
        """Actualizar proyecto"""
        proyecto = serializer.save()
        logger.info(f"Proyecto actualizado: {proyecto.nombre} por {self.request.user.username}")

    def perform_destroy(self, instance):
        """Eliminar proyecto"""
        nombre = instance.nombre
        instance.delete()
        logger.info(f"Proyecto eliminado: {nombre} por {self.request.user.username}")

    @action(detail=True, methods=['post'], permission_classes=[EsGestion])
    def estimaciones(self, request, pk=None):
        """
        Generar reporte ejecutivo IA para un proyecto
        POST /api/proyectos/{id}/estimaciones/
        """
        from services.ai.context_builder import ContextBuilder
        from services.ai.intelligence_client import IntelligenceClient

        proyecto = self.get_object()
        context_builder = ContextBuilder()
        client = IntelligenceClient()

        try:
            context = context_builder.build_project_context(proyecto.id)
            result = client.generate_executive_report_sync(context)
            return Response(result)
        except Exception as e:
            logger.error("Error generando estimaciones para proyecto %d: %s", pk, str(e))
            return Response(
                {
                    'success': False,
                    'error': 'GENERATION_ERROR',
                    'message': 'Error al generar el reporte de inteligencia',
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class TareaViewSet(viewsets.ModelViewSet):
    """ViewSet para gestionar tareas asignadas a obreros (usuarios)"""
    queryset = Tarea.objects.select_related('proyecto', 'obrero').all()
    serializer_class = TareaSerializer
    permission_classes = [TareasPermiso]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['titulo', 'descripcion', 'obrero__username', 'obrero__usuariosupabase__nombre_completo', 'proyecto__nombre']
    ordering_fields = ['titulo', 'estado', 'prioridad', 'fecha_limite', 'creado_en']
    ordering = ['-creado_en']

    def get_queryset(self):
        queryset = super().get_queryset()

        if es_rol(self.request.user, OBRERO):
            queryset = queryset.filter(obrero=self.request.user)

        obrero = self.request.query_params.get('obrero', '')
        if obrero:
            queryset = queryset.filter(obrero_id=obrero)
        estado = self.request.query_params.get('estado', '')
        if estado:
            queryset = queryset.filter(estado=estado)
        proyecto = self.request.query_params.get('proyecto', '')
        if proyecto:
            queryset = queryset.filter(proyecto_id=proyecto)
        return queryset

    def perform_create(self, serializer):
        serializer.save(creado_por=self.request.user)

    @action(detail=True, methods=['post'], permission_classes=[EsObreroOMas])
    def completar(self, request, pk=None):
        """
        Marcar una tarea como completada.
        POST /api/tareas/{id}/completar/
        El obrero solo puede completar tareas que le fueron asignadas.
        """
        tarea = self.get_object()

        if es_rol(request.user, OBRERO) and tarea.obrero != request.user:
            return Response(
                {'error': 'No puedes completar una tarea que no te fue asignada'},
                status=status.HTTP_403_FORBIDDEN
            )

        if tarea.estado == 'cancelada':
            return Response(
                {'error': 'Una tarea cancelada no puede marcarse como completada'},
                status=status.HTTP_400_BAD_REQUEST
            )

        tarea.estado = 'completada'
        tarea.save()
        logger.info(f"Tarea completada: {tarea.titulo} por {request.user.username}")

        serializer = self.get_serializer(tarea)
        return Response(serializer.data)


class AuthViewSet(viewsets.ViewSet):
    """
    ViewSet para autenticación con Supabase
    """
    permission_classes = [AllowAny]

    @action(detail=False, methods=['post'])
    def register(self, request):
        """
        Registrar nuevo usuario
        POST /api/auth/register/
        Body: {
            "email": "usuario@example.com",
            "password": "contraseña_segura",
            "nombre_completo": "Juan Pérez"
        }
        """
        email = request.data.get('email', '').strip()
        password = request.data.get('password', '').strip()
        nombre_completo = request.data.get('nombre_completo', '').strip()
        
        # Validaciones
        if not email:
            return Response(
                {'error': 'El email es requerido'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if not password or len(password) < 6:
            return Response(
                {'error': 'La contraseña debe tener al menos 6 caracteres'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if '@' not in email or '.' not in email:
            return Response(
                {'error': 'Ingrese un email válido'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Verificar si el usuario ya existe
        if UsuarioSupabase.objects.filter(email=email).exists():
            return Response(
                {'error': 'El email ya está registrado en el sistema'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        result = auth_service.register_user(email, password, nombre_completo)
        
        if result['error']:
            return Response(result, status=status.HTTP_400_BAD_REQUEST)
        
        return Response(result, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['post'])
    def login(self, request):
        """
        Iniciar sesión
        POST /api/auth/login/
        Body: {
            "email": "usuario@example.com",
            "password": "contraseña"
        }
        """
        email = request.data.get('email', '').strip()
        password = request.data.get('password', '').strip()
        
        if not email:
            return Response(
                {'error': 'El email es requerido'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if not password:
            return Response(
                {'error': 'La contraseña es requerida'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        result = auth_service.login_user(email, password)
        
        if result['error']:
            return Response(result, status=status.HTTP_401_UNAUTHORIZED)
        
        token = result.get('access_token', '')
        print(f"\n{'='*60}")
        print(f"ACCESS TOKEN: {token}")
        print(f"{'='*60}\n")
        
        return Response(result, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'])
    def refresh(self, request):
        """
        Renovar sesión
        POST /api/auth/refresh/
        Body: {
            "refresh_token": "token_de_refresco"
        }
        """
        refresh_token = request.data.get('refresh_token', '').strip()

        if not refresh_token:
            return Response(
                {'error': 'El campo refresh_token es requerido'},
                status=status.HTTP_400_BAD_REQUEST
            )

        result = auth_service.refresh_token(refresh_token)

        if result['error']:
            return Response(result, status=status.HTTP_401_UNAUTHORIZED)

        return Response(result, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated]) # cambiar a IsAuthenticated en produccion
    def logout(self, request):
        """
        Cerrar sesión
        POST /api/auth/logout/
        """
        try:
            usuario_supabase = UsuarioSupabase.objects.get(
                usuario_django=request.user
            )
            result = auth_service.logout_user(usuario_supabase.supabase_uid)
            return Response(result)
        except UsuarioSupabase.DoesNotExist:
            return Response(
                {'error': 'Usuario no encontrado'},
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def me(self, request):
        """
        Obtener información del usuario autenticado
        GET /api/auth/me/
        """
        usuario_data = {
            'id': request.user.id,
            'username': request.user.username,
            'email': request.user.email,
            'nombre_completo': None,
            'rol': None,
            'activo': None,
            'perfil': None,
        }

        try:
            usuario_supabase = UsuarioSupabase.objects.get(
                usuario_django=request.user
            )
            usuario_data['nombre_completo'] = usuario_supabase.nombre_completo
            usuario_data['rol'] = usuario_supabase.rol
            usuario_data['activo'] = usuario_supabase.activo
        except UsuarioSupabase.DoesNotExist:
            pass

        perfil = getattr(request.user, 'perfil', None)
        if perfil:
            usuario_data['perfil'] = PerfilUsuarioSerializer(perfil).data

        return Response(usuario_data)


class UsuarioViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestión completa de usuarios del sistema (CRUD)
    Endpoints:
    - GET /api/usuarios/ : Listar usuarios
    - POST /api/usuarios/ : Crear usuario
    - GET /api/usuarios/{id}/ : Consultar usuario
    - PUT/PATCH /api/usuarios/{id}/ : Actualizar usuario
    - DELETE /api/usuarios/{id}/ : Desactivar usuario
    - GET /api/usuarios/perfil/ : Consultar perfil actual
    - POST /api/usuarios/{id}/cambiar_estado/ : Activar/desactivar usuario
    - POST /api/usuarios/{id}/cambiar_rol/ : Asignar nuevo rol
    """
    queryset = User.objects.all().select_related('usuariosupabase', 'perfil')
    permission_classes = [UsuariosPermiso]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['username', 'email', 'first_name', 'last_name', 'usuariosupabase__nombre_completo']
    ordering_fields = ['username', 'email', 'date_joined']
    ordering = ['-date_joined']

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return UsuarioCreateUpdateSerializer
        return UsuarioDetalleSerializer

    def get_queryset(self):
        queryset = super().get_queryset()

        rol_filtro = self.request.query_params.get('rol', '')
        if not es_rol(self.request.user, *ROLES_ADMIN) and rol_filtro != OBRERO:
            # Los roles de gestión solo ven/manejan usuarios bajo su cargo,
            # excepto al listar obreros (requeridos para asignar tareas).
            queryset = queryset.filter(
                Q(id=self.request.user.id) |
                Q(usuariosupabase__creado_por=self.request.user)
            )

        if rol_filtro:
            queryset = queryset.filter(usuariosupabase__rol=rol_filtro)
        activo = self.request.query_params.get('activo', '')
        if activo.lower() == 'true':
            queryset = queryset.filter(is_active=True, usuariosupabase__activo=True)
        elif activo.lower() == 'false':
            queryset = queryset.filter(Q(is_active=False) | Q(usuariosupabase__activo=False))
        return queryset

    def perform_create(self, serializer):
        data = serializer.validated_data
        nombre_completo = data.pop('nombre_completo', f"{data.get('first_name', '')} {data.get('last_name', '')}".strip())
        rol = data.pop('rol', 'usuario')
        dni = data.pop('dni', '')
        telefono = data.pop('telefono', '')
        departamento = data.pop('departamento', '')
        cargo = data.pop('cargo', '')
        direccion = data.pop('direccion', '')

        if not rol_minimo(self.request.user, ADMIN):
            # Quien no es admin solo puede asignar roles de nivel inferior o igual al suyo
            if rol in ROLES_ADMIN:
                raise PermissionError('No puedes asignar el rol de administrador')
            if nivel_rol(rol) > nivel_rol(obtener_rol(self.request.user)):
                raise PermissionError('No puedes asignar un rol superior al tuyo')

        password = data.pop('password', None)
        user = User.objects.create(**data)
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        user.save()

        supabase_password = password if password else secrets.token_urlsafe(12)
        supabase_result = auth_service.create_supabase_user(
            email=user.email,
            password=supabase_password,
            nombre_completo=nombre_completo
        )

        if supabase_result.get('error'):
            user.delete()
            raise ValidationError(supabase_result.get('mensaje', 'Error al crear usuario en Supabase'))

        supabase_uid = supabase_result['supabase_uid']

        # Crear relación de Supabase
        UsuarioSupabase.objects.create(
            usuario_django=user,
            supabase_uid=supabase_uid,
            email=user.email,
            nombre_completo=nombre_completo or user.username,
            rol=rol,
            activo=True,
            creado_por=self.request.user
        )

        # Crear Perfil
        PerfilUsuario.objects.create(
            usuario=user,
            dni=dni,
            telefono=telefono,
            departamento=departamento,
            cargo=cargo,
            direccion=direccion
        )

    def perform_update(self, serializer):
        data = serializer.validated_data
        nombre_completo = data.pop('nombre_completo', None)
        rol = data.pop('rol', None)
        dni = data.pop('dni', None)
        telefono = data.pop('telefono', None)
        departamento = data.pop('departamento', None)
        cargo = data.pop('cargo', None)
        direccion = data.pop('direccion', None)
        avatar_url = data.pop('avatar_url', None)
        password = data.pop('password', None)

        if not rol_minimo(self.request.user, ADMIN) and rol is not None:
            if rol in ROLES_ADMIN:
                raise PermissionError('No puedes asignar el rol de administrador')
            if nivel_rol(rol) > nivel_rol(obtener_rol(self.request.user)):
                raise PermissionError('No puedes asignar un rol superior al tuyo')

        user = serializer.save()
        if password:
            user.set_password(password)
            user.save()

        if hasattr(user, 'usuariosupabase'):
            if nombre_completo is not None:
                user.usuariosupabase.nombre_completo = nombre_completo
            if rol is not None:
                user.usuariosupabase.rol = rol
            user.usuariosupabase.save()

        perfil, _ = PerfilUsuario.objects.get_or_create(usuario=user)
        if dni is not None:
            perfil.dni = dni
        if telefono is not None:
            perfil.telefono = telefono
        if departamento is not None:
            perfil.departamento = departamento
        if cargo is not None:
            perfil.cargo = cargo
        if direccion is not None:
            perfil.direccion = direccion
        if avatar_url is not None:
            perfil.avatar_url = avatar_url
        perfil.save()

    def perform_destroy(self, instance):
        """Desactivación lógica de usuario"""
        instance.is_active = False
        instance.save()
        if hasattr(instance, 'usuariosupabase'):
            instance.usuariosupabase.activo = False
            instance.usuariosupabase.save()

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def perfil(self, request):
        """GET /api/usuarios/perfil/ - Obtener perfil del usuario autenticado"""
        serializer = UsuarioDetalleSerializer(request.user)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], permission_classes=[EsAdmin])
    def cambiar_estado(self, request, pk=None):
        """POST /api/usuarios/{id}/cambiar_estado/ Body: {"activo": true/false} (solo admin)"""
        user = self.get_object()
        nuevo_estado = request.data.get('activo')
        if nuevo_estado is None:
            return Response({'error': 'El campo activo es requerido'}, status=status.HTTP_400_BAD_REQUEST)
        
        user.is_active = bool(nuevo_estado)
        user.save()
        if hasattr(user, 'usuariosupabase'):
            user.usuariosupabase.activo = bool(nuevo_estado)
            user.usuariosupabase.save()

        return Response({
            'mensaje': f'Estado del usuario actualizado a: {"Activo" if user.is_active else "Inactivo"}',
            'usuario': UsuarioDetalleSerializer(user).data
        })

    @action(detail=True, methods=['post'], permission_classes=[EsAdmin])
    def cambiar_rol(self, request, pk=None):
        """POST /api/usuarios/{id}/cambiar_rol/ Body: {"rol": "..."} (solo admin)"""
        user = self.get_object()
        nuevo_rol = request.data.get('rol')
        if not nuevo_rol:
            return Response({'error': 'El campo rol es requerido'}, status=status.HTTP_400_BAD_REQUEST)

        usuario_sb, _ = UsuarioSupabase.objects.get_or_create(
            usuario_django=user,
            defaults={'supabase_uid': f"local-{user.id}", 'email': user.email}
        )
        usuario_sb.rol = nuevo_rol
        usuario_sb.save()

        return Response({
            'mensaje': f'Rol actualizado exitosamente a: {nuevo_rol}',
            'usuario': UsuarioDetalleSerializer(user).data
        })


class ConfiguracionViewSet(viewsets.ViewSet):
    """
    ViewSet para parámetros de configuración del sistema y empresa
    Endpoints:
    - GET /api/configuracion/ : Obtener toda la configuración
    - GET /api/configuracion/empresa/ : Obtener datos de la empresa
    - PUT /api/configuracion/empresa/ : Actualizar datos de la empresa
    - GET /api/configuracion/sistema/ : Obtener parámetros del sistema
    - PUT /api/configuracion/sistema/ : Actualizar parámetros del sistema
    """
    permission_classes = [EsGestion]

    def _get_empresa(self):
        empresa, _ = ConfiguracionEmpresa.objects.get_or_create(id=1)
        return empresa

    def _get_sistema(self):
        sistema, _ = ConfiguracionSistema.objects.get_or_create(id=1)
        return sistema

    def list(self, request):
        """GET /api/configuracion/"""
        empresa = self._get_empresa()
        sistema = self._get_sistema()
        return Response({
            'empresa': ConfiguracionEmpresaSerializer(empresa).data,
            'sistema': ConfiguracionSistemaSerializer(sistema).data,
        })

    @staticmethod
    def _filtrar_vacios(data):
        """Elimina campos vacíos o nulos para no sobrescribir valores existentes."""
        return {k: v for k, v in data.items() if v not in (None, '')}

    @action(detail=False, methods=['get', 'put', 'patch'])
    def empresa(self, request):
        empresa = self._get_empresa()
        if request.method == 'GET':
            serializer = ConfiguracionEmpresaSerializer(empresa)
            return Response(serializer.data)

        data = self._filtrar_vacios(request.data)
        serializer = ConfiguracionEmpresaSerializer(empresa, data=data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get', 'put', 'patch'])
    def sistema(self, request):
        sistema = self._get_sistema()
        if request.method == 'GET':
            serializer = ConfiguracionSistemaSerializer(sistema)
            return Response(serializer.data)

        data = self._filtrar_vacios(request.data)
        serializer = ConfiguracionSistemaSerializer(sistema, data=data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ReporteViewSet(viewsets.ModelViewSet):
    """
    ViewSet para generación y consulta de reportes analíticos del sistema
    Endpoints:
    - GET /api/reportes/ : Historial de reportes
    - POST /api/reportes/ : Generar/registrar reporte
    - GET /api/reportes/inventario/ : Reporte de inventario en tiempo real
    - GET /api/reportes/stock_bajo/ : Reporte de materiales con stock bajo
    - GET /api/reportes/proyectos/ : Reporte de avances de proyectos
    - GET /api/reportes/trabajadores/ : Reporte de personal
    """
    queryset = Reporte.objects.all().select_related('solicitado_por')
    serializer_class = ReporteSerializer
    permission_classes = [EsGestion]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['titulo', 'tipo_reporte', 'formato']
    ordering_fields = ['fecha_generacion', 'tipo_reporte']
    ordering = ['-fecha_generacion']

    def perform_create(self, serializer):
        serializer.save(solicitado_por=self.request.user)

    @action(detail=False, methods=['get'])
    def inventario(self, request):
        """GET /api/reportes/inventario/"""
        total_materiales = Material.objects.count()
        materiales = Material.objects.select_related('categoria').all()
        valor_total = sum(m.precio * m.cantidad for m in materiales)
        por_categoria = Categoria.objects.annotate(
            total_items=Count('materiales'),
            valor_categoria=Sum(F('materiales__precio') * F('materiales__cantidad'))
        ).values('id', 'nombre', 'total_items', 'valor_categoria')

        desglose = [{
            'id': cat['id'],
            'nombre': cat['nombre'],
            'total_items': cat['total_items'],
            'valor_categoria': float(cat['valor_categoria'] or 0)
        } for cat in por_categoria]

        resumen = {
            'total_materiales': total_materiales,
            'valor_total_inventario': float(valor_total),
            'desglose_categorias': desglose
        }

        Reporte.objects.create(
            titulo='Reporte Analítico de Inventario',
            tipo_reporte='inventario',
            formato='json',
            solicitado_por=request.user if request.user.is_authenticated else None,
            resumen_datos=resumen
        )

        return Response(resumen)

    @action(detail=False, methods=['get'])
    def stock_bajo(self, request):
        """GET /api/reportes/stock_bajo/"""
        sistema = ConfiguracionSistema.objects.first()
        limite = sistema.alerta_stock_minimo_defecto if sistema else 10

        materiales_criticos = Material.objects.filter(cantidad__lte=limite).select_related('categoria')
        data = [{
            'id': m.id,
            'nombre': m.nombre,
            'codigo': m.codigo,
            'categoria': m.categoria.nombre if m.categoria else 'Sin Categoría',
            'cantidad': m.cantidad,
            'precio': float(m.precio),
            'estado': m.estado
        } for m in materiales_criticos]

        resumen = {
            'umbral_alerta': limite,
            'total_criticos': len(data),
            'materiales': data
        }

        Reporte.objects.create(
            titulo='Reporte de Materiales con Stock Bajo',
            tipo_reporte='stock_bajo',
            formato='json',
            solicitado_por=request.user if request.user.is_authenticated else None,
            resumen_datos=resumen
        )

        return Response(resumen)

    @action(detail=False, methods=['get'])
    def proyectos(self, request):
        """GET /api/reportes/proyectos/"""
        total_proyectos = Proyecto.objects.count()
        proyectos = Proyecto.objects.annotate(total_tareas=Count('tareas')).values(
            'id', 'nombre', 'ubicacion', 'estado', 'porcentaje_avance', 'total_tareas', 'fecha_inicio', 'fecha_fin'
        )

        promedio = Proyecto.objects.aggregate(prom=Avg('porcentaje_avance'))['prom'] or 0

        proyectos_list = [{
            'id': p['id'],
            'nombre': p['nombre'],
            'ubicacion': p['ubicacion'],
            'estado': p['estado'],
            'porcentaje_avance': p['porcentaje_avance'],
            'total_tareas': p['total_tareas'],
            'fecha_inicio': str(p['fecha_inicio']) if p['fecha_inicio'] else None,
            'fecha_fin': str(p['fecha_fin']) if p['fecha_fin'] else None,
        } for p in proyectos]

        resumen = {
            'total_proyectos': total_proyectos,
            'promedio_avance_general': round(promedio, 2),
            'proyectos': proyectos_list
        }

        Reporte.objects.create(
            titulo='Reporte General de Proyectos',
            tipo_reporte='proyectos_avances',
            formato='json',
            solicitado_por=request.user if request.user.is_authenticated else None,
            resumen_datos=resumen
        )

        return Response(resumen)

    @action(detail=False, methods=['get'])
    def trabajadores(self, request):
        """GET /api/reportes/trabajadores/ (personal = usuarios con rol obrero)"""
        obreros = User.objects.filter(
            usuariosupabase__isnull=False,
            usuariosupabase__rol=OBRERO
        )
        total_trabajadores = obreros.count()
        activos = obreros.filter(is_active=True).count()
        inactivos = obreros.filter(is_active=False).count()
        por_rol = User.objects.filter(
            usuariosupabase__isnull=False,
            usuariosupabase__rol__in=[OBRERO, ARQUITECTO, MAESTRO_OBRA, SUPERVISOR, INGENIERO]
        ).values('usuariosupabase__rol').annotate(total=Count('id'))

        resumen = {
            'total_trabajadores': total_trabajadores,
            'activos': activos,
            'inactivos': inactivos,
            'distribucion_por_rol': [
                {
                    'rol': p['usuariosupabase__rol'],
                    'total': p['total']
                } for p in por_rol
            ]
        }

        Reporte.objects.create(
            titulo='Reporte de Personal y Trabajadores',
            tipo_reporte='trabajadores',
            formato='json',
            solicitado_por=request.user if request.user.is_authenticated else None,
            resumen_datos=resumen
        )

        return Response(resumen)



class AsistenteIAViewSet(viewsets.ModelViewSet):
    """
    Conversaciones del asistente IA (módulo de proyectos).
    Endpoints:
    - GET/POST /api/ia/asistentes/  - Listar/Crear conversaciones
    - GET/PATCH/DELETE /api/ia/asistentes/{id}/
    - GET/POST /api/ia/asistentes/{id}/mensajes/
    - POST /api/ia/asistentes/{id}/materiales/
    - POST /api/ia/asistentes/{id}/estimar/
    """
    queryset = ConversacionIA.objects.select_related('usuario').all()
    serializer_class = ConversacionIASerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None

    def get_queryset(self):
        return super().get_queryset().filter(usuario=self.request.user)

    def perform_create(self, serializer):
        serializer.save(usuario=self.request.user)

    @action(detail=True, methods=['get', 'post'])
    def mensajes(self, request, pk=None):
        conversacion = self.get_object()

        if request.method == 'GET':
            mensajes = conversacion.mensajes.all().order_by('creado_en')
            return Response(MensajeIASerializer(mensajes, many=True).data)

        contenido = (request.data.get('contenido') or '').strip()
        if not contenido:
            return Response({'error': 'El contenido es requerido'}, status=status.HTTP_400_BAD_REQUEST)

        MensajeIA.objects.create(conversacion=conversacion, rol='usuario', contenido=contenido)
        if not conversacion.titulo:
            conversacion.titulo = contenido[:80]
            conversacion.save(update_fields=['titulo', 'actualizado_en'])

        historial = [
            {'rol': m.rol, 'contenido': m.contenido}
            for m in conversacion.mensajes.all().order_by('creado_en')
        ]

        from services.ai.intelligence_client import IntelligenceClient
        client = IntelligenceClient()
        result = client.send_assistant_message_sync(historial)

        if result.get('success'):
            sugeridos = result.get('materiales', []) or []
            respuesta = MensajeIA.objects.create(
                conversacion=conversacion,
                rol='asistente',
                contenido=result.get('reply', ''),
            )
            if sugeridos:
                conversacion.materiales_sugeridos = sugeridos
                conversacion.save(update_fields=['materiales_sugeridos', 'actualizado_en'])
            return Response(
                {
                    'success': True,
                    'mensaje': MensajeIASerializer(respuesta).data,
                    'model': result.get('model', ''),
                    'duration_ms': result.get('duration_ms', 0),
                    'materiales_sugeridos': sugeridos,
                }
            )

        return Response(
            {'success': False, 'error': result.get('error', 'LLM_ERROR'),
             'message': result.get('message', 'No se pudo generar la respuesta')},
            status=status.HTTP_502_BAD_GATEWAY,
        )

    @action(detail=True, methods=['post'])
    def materiales(self, request, pk=None):
        conversacion = self.get_object()
        descripcion = (request.data.get('descripcion_proyecto') or '').strip()
        materiales = request.data.get('materiales', [])

        if not isinstance(materiales, list):
            return Response({'error': 'materiales debe ser una lista'}, status=status.HTTP_400_BAD_REQUEST)

        conversacion.descripcion_proyecto = descripcion or conversacion.descripcion_proyecto
        conversacion.materiales = materiales
        conversacion.save(update_fields=['descripcion_proyecto', 'materiales', 'actualizado_en'])
        return Response(self.get_serializer(conversacion).data)

    @action(detail=True, methods=['post'])
    def materiales_sugeridos(self, request, pk=None):
        """Añade los materiales sugeridos por el modelo a la lista de estimación."""
        conversacion = self.get_object()
        sugeridos = conversacion.materiales_sugeridos or []

        if not sugeridos:
            return Response(
                {'error': 'No hay materiales sugeridos por el asistente todavía'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        actuales = {m.get('nombre', '').strip().lower(): m for m in (conversacion.materiales or [])}
        for mat in sugeridos:
            nombre = (mat.get('nombre') or '').strip()
            if not nombre:
                continue
            clave = nombre.lower()
            if clave in actuales:
                continue
            actuales[clave] = {
                'nombre': nombre,
                'unidad': (mat.get('unidad') or '').strip() or 'unidad',
            }

        conversacion.materiales = list(actuales.values())
        conversacion.save(update_fields=['materiales', 'actualizado_en'])
        return Response(self.get_serializer(conversacion).data)

    @action(detail=True, methods=['post'])
    def estimar(self, request, pk=None):
        conversacion = self.get_object()

        if not conversacion.materiales:
            return Response(
                {'error': 'Añade al menos un material para poder estimar cantidades'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        mensajes = [
            {'rol': m.rol, 'contenido': m.contenido}
            for m in conversacion.mensajes.all().order_by('creado_en')
        ]

        from services.ai.intelligence_client import IntelligenceClient
        client = IntelligenceClient()
        result = client.estimate_materials_sync(
            mensajes,
            conversacion.materiales,
        )

        if result.get('success'):
            respuesta = MensajeIA.objects.create(
                conversacion=conversacion,
                rol='asistente',
                contenido=result.get('reply', ''),
            )
            return Response(
                {
                    'success': True,
                    'mensaje': MensajeIASerializer(respuesta).data,
                    'model': result.get('model', ''),
                    'duration_ms': result.get('duration_ms', 0),
                }
            )

        return Response(
            {'success': False, 'error': result.get('error', 'LLM_ERROR'),
             'message': result.get('message', 'No se pudo estimar los materiales')},
            status=status.HTTP_502_BAD_GATEWAY,
        )
