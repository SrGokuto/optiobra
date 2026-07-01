from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Material, Categoria, HistorialMaterial, UsuarioSupabase, Proyecto, AvanceObra, Trabajador


class CategoriaSerializer(serializers.ModelSerializer):
    """Serializer para Categorías"""
    class Meta:
        model = Categoria
        fields = ['id', 'nombre', 'descripcion', 'creado_en', 'actualizado_en']
        read_only_fields = ['creado_en', 'actualizado_en']


class MaterialSerializer(serializers.ModelSerializer):
    """Serializer para Materiales con validaciones completas"""
    categoria_nombre = serializers.CharField(source='categoria.nombre', read_only=True)
    creado_por_nombre = serializers.CharField(source='creado_por.username', read_only=True)

    class Meta:
        model = Material
        fields = [
            'id',
            'nombre',
            'descripcion',
            'codigo',
            'categoria',
            'categoria_nombre',
            'precio',
            'cantidad',
            'unidad_medida',
            'estado',
            'proveedor',
            'creado_en',
            'actualizado_en',
            'creado_por',
            'creado_por_nombre',
        ]
        read_only_fields = ['creado_en', 'actualizado_en', 'creado_por', 'creado_por_nombre']

    def validate_nombre(self, value):
        """Validar que el nombre no esté vacío y tenga longitud válida"""
        if not value or len(value.strip()) == 0:
            raise serializers.ValidationError("El nombre del material no puede estar vacío")
        if len(value) > 255:
            raise serializers.ValidationError("El nombre no puede exceder 255 caracteres")
        return value.strip()

    def validate_codigo(self, value):
        """Validar que el código sea único y válido"""
        if not value or len(value.strip()) == 0:
            raise serializers.ValidationError("El código del material no puede estar vacío")
        
        # Permitir el mismo código en edición
        if self.instance and self.instance.codigo == value:
            return value
        
        # Verificar unicidad
        if Material.objects.filter(codigo=value).exists():
            raise serializers.ValidationError(f"El código '{value}' ya existe en el sistema")
        
        return value.strip().upper()

    def validate_precio(self, value):
        """Validar que el precio sea válido"""
        if value < 0:
            raise serializers.ValidationError("El precio no puede ser negativo")
        return value

    def validate_cantidad(self, value):
        """Validar que la cantidad sea válida"""
        if value < 0:
            raise serializers.ValidationError("La cantidad no puede ser negativa")
        return value

    def validate_categoria(self, value):
        """Validar que la categoría exista"""
        if not Categoria.objects.filter(id=value.id).exists():
            raise serializers.ValidationError("La categoría seleccionada no existe")
        return value

    def validate(self, data):
        """Validaciones a nivel de objeto"""
        if data.get('nombre') and data.get('codigo'):
            # Verificar que nombre y código no sean idénticos
            if data['nombre'].lower() == data['codigo'].lower():
                raise serializers.ValidationError({
                    'codigo': 'El código no puede ser idéntico al nombre'
                })
        return data


class HistorialMaterialSerializer(serializers.ModelSerializer):
    """Serializer para el historial de materiales"""
    usuario_nombre = serializers.CharField(source='usuario.username', read_only=True)
    material_nombre = serializers.CharField(source='material.nombre', read_only=True)

    class Meta:
        model = HistorialMaterial
        fields = [
            'id',
            'material',
            'material_nombre',
            'accion',
            'usuario',
            'usuario_nombre',
            'valores_anteriores',
            'valores_nuevos',
            'fecha',
        ]
        read_only_fields = ['id', 'fecha', 'usuario_nombre', 'material_nombre']


class UsuarioSupabaseSerializer(serializers.ModelSerializer):
    """Serializer para usuarios de Supabase"""
    email_usuario = serializers.EmailField(source='usuario_django.email', read_only=True)
    username = serializers.CharField(source='usuario_django.username', read_only=True)

    class Meta:
        model = UsuarioSupabase
        fields = [
            'id',
            'supabase_uid',
            'email',
            'username',
            'email_usuario',
            'nombre_completo',
            'rol',
            'activo',
            'creado_en',
            'actualizado_en',
        ]
        read_only_fields = ['creado_en', 'actualizado_en', 'username', 'email_usuario']


class UserSerializer(serializers.ModelSerializer):
    """Serializer para usuarios"""
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']
        read_only_fields = ['id']


class ProyectoSerializer(serializers.ModelSerializer):
    """Serializer para Proyectos"""
    avances_count = serializers.IntegerField(source='avances.count', read_only=True)

    class Meta:
        model = Proyecto
        fields = [
            'id', 'nombre', 'ubicacion', 'fecha_inicio', 'fecha_fin',
            'estado', 'porcentaje_avance', 'avances_count',
            'creado_en', 'actualizado_en',
        ]
        read_only_fields = ['creado_en', 'actualizado_en']

    def validate_nombre(self, value):
        if not value or len(value.strip()) == 0:
            raise serializers.ValidationError("El nombre del proyecto no puede estar vacío")
        return value.strip()

    def validate_porcentaje_avance(self, value):
        if value < 0 or value > 100:
            raise serializers.ValidationError("El porcentaje de avance debe estar entre 0 y 100")
        return value


class AvanceObraSerializer(serializers.ModelSerializer):
    """Serializer para Avances de Obra"""
    proyecto_nombre = serializers.CharField(source='proyecto.nombre', read_only=True)

    class Meta:
        model = AvanceObra
        fields = [
            'id', 'proyecto', 'proyecto_nombre', 'actividad', 'descripcion',
            'porcentaje', 'responsable', 'fecha',
            'creado_en', 'actualizado_en',
        ]
        read_only_fields = ['creado_en', 'actualizado_en']

    def validate_actividad(self, value):
        if not value or len(value.strip()) == 0:
            raise serializers.ValidationError("La actividad no puede estar vacía")
        return value.strip()

    def validate_porcentaje(self, value):
        if value < 0 or value > 100:
            raise serializers.ValidationError("El porcentaje debe estar entre 0 y 100")
        return value

    def validate_responsable(self, value):
        if not value or len(value.strip()) == 0:
            raise serializers.ValidationError("El responsable no puede estar vacío")
        return value.strip()


class TrabajadorSerializer(serializers.ModelSerializer):
    """Serializer para Trabajadores"""
    class Meta:
        model = Trabajador
        fields = [
            'id', 'nombre', 'dni', 'rol', 'telefono', 'estado',
            'creado_en', 'actualizado_en',
        ]
        read_only_fields = ['creado_en', 'actualizado_en']

    def validate_nombre(self, value):
        if not value or len(value.strip()) == 0:
            raise serializers.ValidationError("El nombre no puede estar vacío")
        return value.strip()

    def validate_dni(self, value):
        if not value or len(value.strip()) == 0:
            raise serializers.ValidationError("El DNI no puede estar vacío")
        if self.instance and self.instance.dni == value:
            return value
        if Trabajador.objects.filter(dni=value).exists():
            raise serializers.ValidationError(f"El DNI '{value}' ya está registrado")
        return value.strip()

    def validate_telefono(self, value):
        if not value or len(value.strip()) == 0:
            raise serializers.ValidationError("El teléfono no puede estar vacío")
        return value.strip()
