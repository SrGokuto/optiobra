from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    dependencies = [
        ('api', '0010_reporte_ia'),
    ]

    operations = [
        migrations.CreateModel(
            name='Alerta',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('tipo', models.CharField(default='tarea_vencida', max_length=50)),
                ('mensaje', models.TextField()),
                ('leida', models.BooleanField(default=False)),
                ('creado_en', models.DateTimeField(auto_now_add=True)),
                ('admin', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='alertas', to='auth.user')),
                ('tarea', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='alertas', to='api.tarea')),
            ],
            options={
                'verbose_name_plural': 'Alertas',
                'ordering': ['-creado_en'],
            },
        ),
        migrations.AddConstraint(
            model_name='alerta',
            constraint=models.UniqueConstraint(fields=('admin', 'tarea', 'tipo'), name='alerta_admin_tarea_tipo_unica'),
        ),
    ]