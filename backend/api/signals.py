from django.db.models.signals import post_delete, post_save
from django.dispatch import receiver

from .models import Tarea, recalcular_avance_proyecto


@receiver(post_save, sender=Tarea)
def tarea_guardada(sender, instance, **kwargs):
    """Recalcula el avance del proyecto al crear o actualizar una tarea."""
    if instance.proyecto_id:
        recalcular_avance_proyecto(instance.proyecto)


@receiver(post_delete, sender=Tarea)
def tarea_eliminada(sender, instance, **kwargs):
    """Recalcula el avance del proyecto al eliminar una tarea."""
    if instance.proyecto_id:
        recalcular_avance_proyecto(instance.proyecto)