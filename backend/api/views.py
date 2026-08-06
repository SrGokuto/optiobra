from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.shortcuts import get_object_or_404
from django.db.models import Q
import logging

from .models import Material, Categoria, HistorialMaterial, UsuarioSupabase, Proyecto
from .serializers import MaterialSerializer, CategoriaSerializer, HistorialMaterialSerializer, ProyectoSerializer
from .services import SupabaseAuthService

logger = logging.getLogger(__name__)
auth_service = SupabaseAuthService()


class CategoriaViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestionar categorías de materiales
    """
    queryset = Categoria.objects.all()
    serializer_class = CategoriaSerializer
    permission_classes = [IsAuthenticated]
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
    permission_classes = [IsAuthenticated]
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

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
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

    @action(detail=True, methods=['get'], permission_classes=[IsAuthenticated])
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

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
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
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['nombre', 'descripcion', 'responsable', 'direccion']
    ordering_fields = ['nombre', 'estado', 'avance', 'creado_en', 'fecha_inicio']
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
        
        return Response(result, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
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
        try:
            usuario_supabase = UsuarioSupabase.objects.get(
                usuario_django=request.user
            )
            return Response({
                'id': request.user.id,
                'username': request.user.username,
                'email': request.user.email,
                'nombre_completo': usuario_supabase.nombre_completo,
                'rol': usuario_supabase.rol,
                'activo': usuario_supabase.activo,
            })
        except UsuarioSupabase.DoesNotExist:
            return Response({
                'id': request.user.id,
                'username': request.user.username,
                'email': request.user.email,
            })
