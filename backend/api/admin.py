from django.contrib import admin
from .models import (
    Material, Categoria, HistorialMaterial, UsuarioSupabase,
    PerfilUsuario, ConfiguracionEmpresa, ConfiguracionSistema, Reporte
)


@admin.register(Categoria)
class CategoriaAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'creado_en', 'actualizado_en')
    search_fields = ('nombre', 'descripcion')
    readonly_fields = ('creado_en', 'actualizado_en')
    ordering = ('nombre',)


@admin.register(Material)
class MaterialAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'codigo', 'categoria', 'precio', 'cantidad', 'estado', 'creado_en')
    list_filter = ('estado', 'categoria', 'creado_en')
    search_fields = ('nombre', 'codigo', 'descripcion', 'proveedor')
    readonly_fields = ('creado_en', 'actualizado_en', 'creado_por')
    
    fieldsets = (
        ('Información Básica', {
            'fields': ('nombre', 'codigo', 'descripcion', 'categoria')
        }),
        ('Inventario', {
            'fields': ('cantidad', 'unidad_medida', 'precio', 'proveedor')
        }),
        ('Estado', {
            'fields': ('estado',)
        }),
        ('Auditoría', {
            'fields': ('creado_por', 'creado_en', 'actualizado_en'),
            'classes': ('collapse',)
        }),
    )
    
    def save_model(self, request, obj, form, change):
        if not change:
            obj.creado_por = request.user
        super().save_model(request, obj, form, change)


@admin.register(HistorialMaterial)
class HistorialMaterialAdmin(admin.ModelAdmin):
    list_display = ('material', 'accion', 'usuario', 'fecha')
    list_filter = ('accion', 'fecha', 'usuario')
    search_fields = ('material__nombre', 'usuario__username')
    readonly_fields = ('material', 'accion', 'usuario', 'valores_anteriores', 'valores_nuevos', 'fecha')
    ordering = ('-fecha',)
    
    def has_add_permission(self, request):
        return False
    
    def has_delete_permission(self, request, obj=None):
        return False


@admin.register(UsuarioSupabase)
class UsuarioSupabaseAdmin(admin.ModelAdmin):
    list_display = ('email', 'supabase_uid', 'rol', 'activo', 'creado_en')
    list_filter = ('rol', 'activo', 'creado_en')
    search_fields = ('email', 'supabase_uid', 'nombre_completo', 'usuario_django__username')
    readonly_fields = ('creado_en', 'actualizado_en')
    
    fieldsets = (
        ('Información de Supabase', {
            'fields': ('supabase_uid', 'email')
        }),
        ('Información del Usuario', {
            'fields': ('usuario_django', 'nombre_completo', 'rol')
        }),
        ('Estado', {
            'fields': ('activo',)
        }),
        ('Auditoría', {
            'fields': ('creado_en', 'actualizado_en'),
            'classes': ('collapse',)
        }),
    )


@admin.register(PerfilUsuario)
class PerfilUsuarioAdmin(admin.ModelAdmin):
    list_display = ('usuario', 'telefono', 'departamento', 'cargo', 'creado_en')
    search_fields = ('usuario__username', 'usuario__email', 'telefono', 'departamento', 'cargo')
    readonly_fields = ('creado_en', 'actualizado_en')


@admin.register(ConfiguracionEmpresa)
class ConfiguracionEmpresaAdmin(admin.ModelAdmin):
    list_display = ('nombre_empresa', 'nit_runc', 'email_contacto', 'telefono', 'moneda_principal')
    readonly_fields = ('creado_en', 'actualizado_en')


@admin.register(ConfiguracionSistema)
class ConfiguracionSistemaAdmin(admin.ModelAdmin):
    list_display = ('alerta_stock_minimo_defecto', 'dias_notificacion_vencimiento', 'modo_mantenimiento', 'formato_fecha')
    readonly_fields = ('creado_en', 'actualizado_en')


@admin.register(Reporte)
class ReporteAdmin(admin.ModelAdmin):
    list_display = ('titulo', 'tipo_reporte', 'formato', 'solicitado_por', 'fecha_generacion', 'estado')
    list_filter = ('tipo_reporte', 'formato', 'estado', 'fecha_generacion')
    search_fields = ('titulo', 'solicitado_por__username')
    readonly_fields = ('fecha_generacion',)

