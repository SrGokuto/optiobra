from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone


class Categoria(models.Model):
    """Categoría de materiales"""
    nombre = models.CharField(max_length=100, unique=True)
    descripcion = models.TextField(blank=True, null=True)
    creado_en = models.DateTimeField(auto_now_add=True)
    actualizado_en = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = "Categorías"
        ordering = ['nombre']

    def __str__(self):
        return self.nombre


class Material(models.Model):
    """Modelo principal de Materiales"""
    ESTADO_CHOICES = [
        ('disponible', 'Disponible'),
        ('no_disponible', 'No Disponible'),
        ('descontinuado', 'Descontinuado'),
    ]

    nombre = models.CharField(max_length=255)
    descripcion = models.TextField(blank=True, null=True)
    codigo = models.CharField(max_length=50, unique=True)
    categoria = models.ForeignKey(Categoria, on_delete=models.PROTECT, related_name='materiales')
    
    precio = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    cantidad = models.IntegerField(default=0, validators=[MinValueValidator(0)])
    unidad_medida = models.CharField(max_length=50, default='unidad')
    
    estado = models.CharField(max_length=20, choices=ESTADO_CHOICES, default='disponible')
    proveedor = models.CharField(max_length=255, blank=True, null=True)
    
    creado_en = models.DateTimeField(auto_now_add=True)
    actualizado_en = models.DateTimeField(auto_now=True)
    creado_por = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='materiales_creados')

    class Meta:
        verbose_name_plural = "Materiales"
        ordering = ['-creado_en']
        indexes = [
            models.Index(fields=['codigo']),
            models.Index(fields=['categoria']),
            models.Index(fields=['estado']),
        ]

    def __str__(self):
        return f"{self.nombre} ({self.codigo})"


class HistorialMaterial(models.Model):
    """Historial de cambios en materiales"""
    ACCION_CHOICES = [
        ('creacion', 'Creación'),
        ('edicion', 'Edición'),
        ('eliminacion', 'Eliminación'),
        ('cambio_cantidad', 'Cambio de Cantidad'),
    ]

    material = models.ForeignKey(Material, on_delete=models.CASCADE, related_name='historial')
    accion = models.CharField(max_length=20, choices=ACCION_CHOICES)
    usuario = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    valores_anteriores = models.JSONField(null=True, blank=True)
    valores_nuevos = models.JSONField(null=True, blank=True)
    fecha = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = "Historial de Materiales"
        ordering = ['-fecha']

    def __str__(self):
        return f"{self.material} - {self.accion} - {self.fecha}"


class Proyecto(models.Model):
    """Modelo de proyectos de construcción"""
    ESTADO_CHOICES = [
        ('pendiente', 'Pendiente'),
        ('en_proceso', 'En Proceso'),
        ('finalizado', 'Finalizado'),
        ('cancelado', 'Cancelado'),
    ]

    nombre = models.CharField(max_length=255)
    descripcion = models.TextField(blank=True, null=True)
    direccion = models.CharField(max_length=255, blank=True, null=True)
    responsable = models.CharField(max_length=255, blank=True, null=True)
    estado = models.CharField(max_length=20, choices=ESTADO_CHOICES, default='pendiente')
    avance = models.IntegerField(default=0, validators=[MinValueValidator(0), MaxValueValidator(100)])
    fecha_inicio = models.DateField(null=True, blank=True)
    fecha_fin_estimada = models.DateField(null=True, blank=True)
    presupuesto = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True, validators=[MinValueValidator(0)])
    creado_en = models.DateTimeField(auto_now_add=True)
    actualizado_en = models.DateTimeField(auto_now=True)
    creado_por = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='proyectos_creados')

    class Meta:
        verbose_name_plural = "Proyectos"
        ordering = ['-creado_en']

    def __str__(self):
        return f"{self.nombre} ({self.get_estado_display()})"


class UsuarioSupabase(models.Model):
    """Relación entre usuarios de Django y Supabase"""
    usuario_django = models.OneToOneField(User, on_delete=models.CASCADE)
    supabase_uid = models.CharField(max_length=255, unique=True)
    email = models.EmailField()
    nombre_completo = models.CharField(max_length=255, blank=True)
    rol = models.CharField(max_length=50, default='usuario')
    activo = models.BooleanField(default=True)
    creado_en = models.DateTimeField(auto_now_add=True)
    actualizado_en = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = "Usuarios Supabase"
        ordering = ['-creado_en']

    def __str__(self):
        return f"{self.email} ({self.supabase_uid})"
