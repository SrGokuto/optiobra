from django.core.management.base import BaseCommand

from api.alertas import generar_alertas_tareas_vencidas


class Command(BaseCommand):
    help = 'Genera alertas para tareas vencidas sin completar'

    def handle(self, *args, **options):
        creadas = generar_alertas_tareas_vencidas()
        self.stdout.write(self.style.SUCCESS(f'Alertas nuevas creadas: {creadas}'))
