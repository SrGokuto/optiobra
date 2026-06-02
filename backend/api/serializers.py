from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Material, Categoria, HistorialMaterial, UsuarioSupabase


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
