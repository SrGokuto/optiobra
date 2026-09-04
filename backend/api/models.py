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


class UsuarioSupabase(models.Model):
    """Relación entre usuarios de Django y Supabase"""
    usuario_django = models.OneToOneField(User, on_delete=models.CASCADE)
    supabase_uid = models.CharField(max_length=255, unique=True)
    email = models.EmailField()
    nombre_completo = models.CharField(max_length=255, blank=True)
    rol = models.CharField(max_length=50, default='usuario')
    activo = models.BooleanField(default=True)
    creado_por = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='obreros_registrados')
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
    dni = models.CharField(max_length=20, blank=True, null=True)
    telefono = models.CharField(max_length=50, blank=True, null=True)
    departamento = models.CharField(max_length=100, blank=True, null=True)
    cargo = models.CharField(max_length=100, blank=True, null=True)
    avatar_url = models.TextField(blank=True, null=True)
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
        ('ia_ejecutivo', 'Reporte Ejecutivo IA'),
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
    contenido = models.TextField(null=True, blank=True)
    proyecto = models.ForeignKey(
        Proyecto,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='reportes_ia',
    )

    class Meta:
        verbose_name_plural = "Reportes Generados"
        ordering = ['-fecha_generacion']

    def __str__(self):
        return f"Reporte: {self.titulo} ({self.tipo_reporte}) - {self.fecha_generacion.strftime('%Y-%m-%d %H:%M')}"


class Tarea(models.Model):
    """Tareas asignadas a un obrero (usuario con rol 'obrero') dentro de un proyecto"""
    ESTADO_CHOICES = [
        ('pendiente', 'Pendiente'),
        ('en_progreso', 'En progreso'),
        ('completada', 'Completada'),
        ('cancelada', 'Cancelada'),
    ]
    PRIORIDAD_CHOICES = [
        ('baja', 'Baja'),
        ('media', 'Media'),
        ('alta', 'Alta'),
        ('urgente', 'Urgente'),
    ]

    titulo = models.CharField(max_length=200)
    descripcion = models.TextField(blank=True, null=True)
    proyecto = models.ForeignKey(Proyecto, on_delete=models.CASCADE, related_name='tareas')
    obrero = models.ForeignKey(User, on_delete=models.CASCADE, related_name='tareas_asignadas')
    estado = models.CharField(max_length=20, choices=ESTADO_CHOICES, default='pendiente')
    prioridad = models.CharField(max_length=20, choices=PRIORIDAD_CHOICES, default='media')
    fecha_limite = models.DateField(blank=True, null=True)
    creado_por = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='tareas_creadas')
    creado_en = models.DateTimeField(auto_now_add=True)
    actualizado_en = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = "Tareas"
        ordering = ['-creado_en']

    def __str__(self):
        return self.titulo


class Alerta(models.Model):
    """Alerta persistente para usuarios administradores."""
    TIPO_TAREA_VENCIDA = 'tarea_vencida'

    admin = models.ForeignKey(User, on_delete=models.CASCADE, related_name='alertas')
    tarea = models.ForeignKey(Tarea, on_delete=models.CASCADE, related_name='alertas')
    tipo = models.CharField(max_length=50, default=TIPO_TAREA_VENCIDA)
    mensaje = models.TextField()
    leida = models.BooleanField(default=False)
    creado_en = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = 'Alertas'
        ordering = ['-creado_en']
        constraints = [
            models.UniqueConstraint(fields=['admin', 'tarea', 'tipo'], name='alerta_admin_tarea_tipo_unica'),
        ]

    def __str__(self):
        return self.mensaje


def recalcular_avance_proyecto(proyecto) -> None:
    """Recalcula el avance de un proyecto a partir de sus tareas.

    El 100% del proyecto se reparte entre todas sus tareas: el avance es el
    porcentaje de tareas completadas sobre el total. Se obtiene con una
    consulta directa a las tareas del proyecto.
    """
    tareas = Tarea.objects.filter(proyecto=proyecto)
    total = tareas.count()
    completadas = tareas.filter(estado='completada').count()
    avance = round((completadas / total) * 100) if total > 0 else 0

    if proyecto.avance != avance or proyecto.porcentaje_avance != avance:
        proyecto.avance = avance
        proyecto.porcentaje_avance = avance
        proyecto.save(update_fields=['avance', 'porcentaje_avance', 'actualizado_en'])


class ConversacionIA(models.Model):
    """Conversación del asistente IA (módulo de proyectos).

    Persiste el hilo de chat para poder retomarlo, junto con la descripción
    del proyecto que se quiere construir y la lista de materiales a estimar.
    """
    TIPO_CHOICES = [
        ('proyectos', 'Asistente de proyectos'),
    ]

    usuario = models.ForeignKey(User, on_delete=models.CASCADE, related_name='conversaciones_ia')
    titulo = models.CharField(max_length=200, blank=True, default='')
    tipo = models.CharField(max_length=50, choices=TIPO_CHOICES, default='proyectos')
    descripcion_proyecto = models.TextField(blank=True, null=True)
    materiales = models.JSONField(default=list, blank=True)
    materiales_sugeridos = models.JSONField(default=list, blank=True)
    creado_en = models.DateTimeField(auto_now_add=True)
    actualizado_en = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = "Conversaciones IA"
        ordering = ['-actualizado_en']

    def __str__(self):
        return self.titulo or f"Conversación #{self.id}"


class MensajeIA(models.Model):
    """Mensaje dentro de una conversación del asistente IA."""
    ROL_CHOICES = [
        ('usuario', 'Usuario'),
        ('asistente', 'Asistente'),
    ]

    conversacion = models.ForeignKey(ConversacionIA, on_delete=models.CASCADE, related_name='mensajes')
    rol = models.CharField(max_length=20, choices=ROL_CHOICES)
    contenido = models.TextField()
    creado_en = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = "Mensajes IA"
        ordering = ['creado_en']

    def __str__(self):
        return f"{self.rol}: {self.contenido[:50]}"

