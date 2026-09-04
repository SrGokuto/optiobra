from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0009_conversacionia_materiales_sugeridos'),
    ]

    operations = [
        migrations.AddField(
            model_name='reporte',
            name='contenido',
            field=models.TextField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='reporte',
            name='proyecto',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='reportes_ia', to='api.proyecto'),
        ),
        migrations.AlterField(
            model_name='reporte',
            name='tipo_reporte',
            field=models.CharField(choices=[('inventario', 'Inventario General'), ('stock_bajo', 'Materiales con Stock Bajo'), ('proyectos_avances', 'Avances de Proyectos'), ('costos_inventario', 'Costos e Valorización'), ('trabajadores', 'Personal y Trabajadores'), ('ia_ejecutivo', 'Reporte Ejecutivo IA')], max_length=50),
        ),
    ]