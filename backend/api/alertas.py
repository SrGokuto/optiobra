from django.contrib.auth.models import User
from django.utils import timezone

from .models import Alerta, Tarea, UsuarioSupabase


def generar_alertas_tareas_vencidas() -> int:
    """Crea una alerta por cada tarea vencida para cada administrador."""
    administradores = UsuarioSupabase.objects.filter(
        rol='admin', activo=True
    ).values_list('usuario_django_id', flat=True)
    tareas_vencidas = Tarea.objects.filter(
        fecha_limite__lt=timezone.localdate(),
        estado__in=['pendiente', 'en_progreso'],
    ).select_related('proyecto')

    creadas = 0
    for tarea in tareas_vencidas:
        mensaje = (
            f'La tarea "{tarea.titulo}" del proyecto "{tarea.proyecto.nombre}" '
            f'venció el {tarea.fecha_limite.strftime("%d/%m/%Y")} y no está completada.'
        )
        for admin_id in administradores:
            _, creada = Alerta.objects.get_or_create(
                admin_id=admin_id,
                tarea=tarea,
                tipo=Alerta.TIPO_TAREA_VENCIDA,
                defaults={'mensaje': mensaje},
            )
            creadas += int(creada)
    return creadas
