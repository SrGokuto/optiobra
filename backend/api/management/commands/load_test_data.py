"""
Comando para cargar datos iniciales de prueba
Uso: python manage.py load_test_data
"""
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from api.models import Categoria, Material, UsuarioSupabase
from decimal import Decimal


class Command(BaseCommand):
    help = 'Cargar datos iniciales de prueba'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Iniciando carga de datos de prueba...'))

        # Crear categorías
        categorias_data = [
            {'nombre': 'Electrónica', 'descripcion': 'Componentes electrónicos y dispositivos'},
            {'nombre': 'Herrería', 'descripcion': 'Materiales para trabajos en metal'},
            {'nombre': 'Carpintería', 'descripcion': 'Maderas y accesorios para carpintería'},
            {'nombre': 'Plomería', 'descripcion': 'Tuberías y accesorios de plomería'},
            {'nombre': 'Pintura', 'descripcion': 'Pinturas y productos de acabado'},
        ]

        categorias = {}
        for cat_data in categorias_data:
            cat, created = Categoria.objects.get_or_create(
                nombre=cat_data['nombre'],
                defaults={'descripcion': cat_data['descripcion']}
            )
            categorias[cat_data['nombre']] = cat
            if created:
                self.stdout.write(f"✓ Categoría creada: {cat.nombre}")
            else:
                self.stdout.write(f"• Categoría ya existe: {cat.nombre}")

        # Crear usuario administrador
        admin_user, created = User.objects.get_or_create(
            username='admin',
            defaults={
                'email': 'admin@optiobra.local',
                'is_staff': True,
                'is_superuser': True
            }
        )
        if created:
            admin_user.set_password('admin123')
            admin_user.save()
            self.stdout.write("✓ Usuario admin creado (contraseña: admin123)")
        else:
            self.stdout.write("• Usuario admin ya existe")

        # Crear usuario de prueba
        test_user, created = User.objects.get_or_create(
            username='usuario_prueba',
            defaults={
                'email': 'usuario@optiobra.local',
                'first_name': 'Usuario',
                'last_name': 'Prueba'
            }
        )
        if created:
            test_user.set_password('prueba123')
            test_user.save()
            self.stdout.write("✓ Usuario de prueba creado (contraseña: prueba123)")
        else:
            self.stdout.write("• Usuario de prueba ya existe")

        # Crear materiales de prueba
        materiales_data = [
            {
                'nombre': 'Cable Ethernet Cat6',
                'codigo': 'ETH-CAT6-001',
                'categoria': 'Electrónica',
                'precio': Decimal('12.50'),
                'cantidad': 100,
                'unidad_medida': 'metro',
                'estado': 'disponible',
                'proveedor': 'TechSupply Inc.',
                'descripcion': 'Cable de red categoria 6, 100% cobre'
            },
            {
                'nombre': 'Resistencia 1/4W 1K',
                'codigo': 'RES-1K-001',
                'categoria': 'Electrónica',
                'precio': Decimal('0.25'),
                'cantidad': 500,
                'unidad_medida': 'unidad',
                'estado': 'disponible',
                'proveedor': 'Electronics Plus',
                'descripcion': 'Resistencia de 1 kilo ohmio, 1/4 watt'
            },
            {
                'nombre': 'Tubo Acero Inoxidable 1"',
                'codigo': 'TUB-ACE-001',
                'categoria': 'Herrería',
                'precio': Decimal('85.00'),
                'cantidad': 25,
                'unidad_medida': 'metro',
                'estado': 'disponible',
                'proveedor': 'Aceros Premium',
                'descripcion': 'Tubo de acero inoxidable de 1 pulgada'
            },
            {
                'nombre': 'Pintura Latex Blanco',
                'codigo': 'PINT-LAT-001',
                'categoria': 'Pintura',
                'precio': Decimal('15.99'),
                'cantidad': 50,
                'unidad_medida': 'galón',
                'estado': 'disponible',
                'proveedor': 'ColorTec',
                'descripcion': 'Pintura latex de excelente cobertura'
            },
            {
                'nombre': 'Madera Pino 1x4"',
                'codigo': 'MAD-PIN-001',
                'categoria': 'Carpintería',
                'precio': Decimal('8.75'),
                'cantidad': 200,
                'unidad_medida': 'pie de tabla',
                'estado': 'disponible',
                'proveedor': 'Maderas Selectas',
                'descripcion': 'Madera de pino seco, de buena calidad'
            },
            {
                'nombre': 'Tubería PVC 2"',
                'codigo': 'TUB-PVC-001',
                'categoria': 'Plomería',
                'precio': Decimal('4.50'),
                'cantidad': 0,
                'unidad_medida': 'metro',
                'estado': 'no_disponible',
                'proveedor': 'Plomería Express',
                'descripcion': 'Tubería PVC de 2 pulgadas, cedula 40'
            },
            {
                'nombre': 'Tornillo Acero 3/8"x2.5"',
                'codigo': 'TOR-ACE-001',
                'categoria': 'Herrería',
                'precio': Decimal('0.75'),
                'cantidad': 1000,
                'unidad_medida': 'caja',
                'estado': 'disponible',
                'proveedor': 'Suministros Industriales',
                'descripcion': 'Tornillos de acero galvanizado'
            },
        ]

        for mat_data in materiales_data:
            categoria = categorias[mat_data.pop('categoria')]
            mat, created = Material.objects.get_or_create(
                codigo=mat_data['codigo'],
                defaults={
                    **mat_data,
                    'categoria': categoria,
                    'creado_por': admin_user
                }
            )
            if created:
                self.stdout.write(f"✓ Material creado: {mat.nombre}")
            else:
                self.stdout.write(f"• Material ya existe: {mat.nombre}")

        self.stdout.write(
            self.style.SUCCESS('\n¡Datos de prueba cargados exitosamente!')
        )
        self.stdout.write('\nAcceso al admin:')
        self.stdout.write('  URL: http://localhost:8000/admin/')
        self.stdout.write('  Usuario: admin')
        self.stdout.write('  Contraseña: admin123')
        self.stdout.write('\nUsuario de prueba para API:')
        self.stdout.write('  Email: usuario@optiobra.local')
        self.stdout.write('  Contraseña: prueba123')
