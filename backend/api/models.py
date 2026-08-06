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
    ubicacion = models.CharField(max_length=150, blank=True, null=True)
    responsable = models.CharField(max_length=255, blank=True, null=True)
    estado = models.CharField(max_length=20, choices=ESTADO_CHOICES, default='pendiente')
    avance = models.IntegerField(default=0, validators=[MinValueValidator(0), MaxValueValidator(100)])
    porcentaje_avance = models.IntegerField(default=0)
    fecha_inicio = models.DateField(null=True, blank=True)
    fecha_fin_estimada = models.DateField(null=True, blank=True)
    fecha_fin = models.DateField(null=True, blank=True)
    presupuesto = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True, validators=[MinValueValidator(0)])
    creado_en = models.DateTimeField(auto_now_add=True)
    actualizado_en = models.DateTimeField(auto_now=True)
    creado_por = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='proyectos_creados')

    class Meta:
        verbose_name_plural = "Proyectos"
        ordering = ['-creado_en']

    def __str__(self):
        return f"{self.nombre} ({self.get_estado_display()})"


class AvanceObra(models.Model):
    """Avances de obra asociados a un proyecto"""
    proyecto = models.ForeignKey(Proyecto, on_delete=models.CASCADE, related_name='avances')
    actividad = models.CharField(max_length=200)
    descripcion = models.TextField(blank=True, null=True)
    porcentaje = models.IntegerField()
    responsable = models.CharField(max_length=100)
    fecha = models.DateField()
    creado_en = models.DateTimeField(auto_now_add=True)
    actualizado_en = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = "Avances de Obra"
        ordering = ['-fecha']

    def __str__(self):
        return f"{self.actividad} - {self.proyecto.nombre}"


class Trabajador(models.Model):
    """Modelo de trabajadores de la empresa"""
    nombre = models.CharField(max_length=255)
    dni = models.CharField(max_length=20, unique=True)
    rol = models.CharField(max_length=100)
    telefono = models.CharField(max_length=50)
    estado = models.CharField(max_length=20, choices=[('Activo', 'Activo'), ('Inactivo', 'Inactivo')], default='Activo')
    creado_en = models.DateTimeField(auto_now_add=True)
    actualizado_en = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = "Trabajadores"
        ordering = ['-creado_en']

    def __str__(self):
        return self.nombre


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


class PerfilUsuario(models.Model):
    """Perfil extendido para los usuarios del sistema"""
    usuario = models.OneToOneField(User, on_delete=models.CASCADE, related_name='perfil')
    telefono = models.CharField(max_length=50, blank=True, null=True)
    departamento = models.CharField(max_length=100, blank=True, null=True)
    cargo = models.CharField(max_length=100, blank=True, null=True)
    avatar_url = models.URLField(max_length=500, blank=True, null=True)
    direccion = models.CharField(max_length=255, blank=True, null=True)
    creado_en = models.DateTimeField(auto_now_add=True)
    actualizado_en = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = "Perfiles de Usuario"
        ordering = ['-creado_en']

    def __str__(self):
        return f"Perfil de {self.usuario.username}"


class ConfiguracionEmpresa(models.Model):
    """Configuración institucional de la empresa u obra"""
    nombre_empresa = models.CharField(max_length=200, default='OptiObra S.A.S.')
    nit_runc = models.CharField(max_length=50, default='900.000.000-1')
    direccion = models.CharField(max_length=255, default='Calle Principal #123')
    telefono = models.CharField(max_length=50, default='+57 300 000 0000')
    email_contacto = models.EmailField(default='contacto@optiobra.local')
    moneda_principal = models.CharField(max_length=10, default='COP')
    logo_url = models.URLField(max_length=500, blank=True, null=True)
    creado_en = models.DateTimeField(auto_now_add=True)
    actualizado_en = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = "Configuraciones de Empresa"

    def __str__(self):
        return self.nombre_empresa


class ConfiguracionSistema(models.Model):
    """Configuraciones globales y parámetros del sistema"""
    FORMATO_FECHA_CHOICES = [
        ('YYYY-MM-DD', 'YYYY-MM-DD'),
        ('DD/MM/YYYY', 'DD/MM/YYYY'),
        ('MM/DD/YYYY', 'MM/DD/YYYY'),
    ]

    alerta_stock_minimo_defecto = models.IntegerField(default=10, validators=[MinValueValidator(0)])
    dias_notificacion_vencimiento = models.IntegerField(default=30, validators=[MinValueValidator(1)])
    modo_mantenimiento = models.BooleanField(default=False)
    formato_fecha = models.CharField(max_length=20, choices=FORMATO_FECHA_CHOICES, default='YYYY-MM-DD')
    notificaciones_email = models.BooleanField(default=True)
    creado_en = models.DateTimeField(auto_now_add=True)
    actualizado_en = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = "Configuraciones del Sistema"

    def __str__(self):
        return f"Configuración del Sistema (Mantenimiento: {self.modo_mantenimiento})"


class Reporte(models.Model):
    """Auditoría e historial de reportes generados en el sistema"""
    TIPO_CHOICES = [
        ('inventario', 'Inventario General'),
        ('stock_bajo', 'Materiales con Stock Bajo'),
        ('proyectos_avances', 'Avances de Proyectos'),
        ('costos_inventario', 'Costos e Valorización'),
        ('trabajadores', 'Personal y Trabajadores'),
    ]

    FORMATO_CHOICES = [
        ('json', 'JSON'),
        ('pdf', 'PDF'),
        ('excel', 'Excel'),
        ('csv', 'CSV'),
    ]

    ESTADO_CHOICES = [
        ('completado', 'Completado'),
        ('error', 'Error'),
    ]

    titulo = models.CharField(max_length=200)
    tipo_reporte = models.CharField(max_length=50, choices=TIPO_CHOICES)
    formato = models.CharField(max_length=20, choices=FORMATO_CHOICES, default='json')
    parametros = models.JSONField(null=True, blank=True)
    solicitado_por = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='reportes_solicitados')
    fecha_generacion = models.DateTimeField(auto_now_add=True)
    estado = models.CharField(max_length=20, choices=ESTADO_CHOICES, default='completado')
    resumen_datos = models.JSONField(null=True, blank=True)

    class Meta:
        verbose_name_plural = "Reportes Generados"
        ordering = ['-fecha_generacion']

    def __str__(self):
        return f"Reporte: {self.titulo} ({self.tipo_reporte}) - {self.fecha_generacion.strftime('%Y-%m-%d %H:%M')}"

