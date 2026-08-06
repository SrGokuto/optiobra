from datetime import datetime, timedelta, timezone

import jwt
from django.contrib.auth.models import User
from django.test import TestCase, override_settings
from rest_framework import status
from rest_framework.test import APITestCase, APIClient
from decimal import Decimal

from .models import Material, Categoria, HistorialMaterial, UsuarioSupabase

TEST_JWT_SECRET = 'test-jwt-secret-optiobra'


class CategoriaTestCase(TestCase):
    """Pruebas para el modelo Categoría"""
    
    def setUp(self):
        self.categoria = Categoria.objects.create(
            nombre='Electrónica',
            descripcion='Componentes electrónicos'
        )
    
    def test_crear_categoria(self):
        """Probar creación de categoría"""
        self.assertEqual(self.categoria.nombre, 'Electrónica')
        self.assertTrue(Categoria.objects.filter(nombre='Electrónica').exists())
    
    def test_nombre_unico(self):
        """Probar que el nombre de categoría es único"""
        with self.assertRaises(Exception):
            Categoria.objects.create(
                nombre='Electrónica',
                descripcion='Duplicada'
            )


class MaterialTestCase(TestCase):
    """Pruebas para el modelo Material"""
    
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            password='testpass123'
        )
        self.categoria = Categoria.objects.create(
            nombre='Herrería',
            descripcion='Materiales para herrería'
        )
        self.material = Material.objects.create(
            nombre='Tubo de Acero',
            codigo='TUB-001',
            categoria=self.categoria,
            precio=Decimal('50.00'),
            cantidad=10,
            creado_por=self.user
        )
    
    def test_crear_material(self):
        """Probar creación de material"""
        self.assertEqual(self.material.nombre, 'Tubo de Acero')
        self.assertEqual(self.material.codigo, 'TUB-001')
        self.assertEqual(self.material.cantidad, 10)
    
    def test_codigo_unico(self):
        """Probar que el código es único"""
        with self.assertRaises(Exception):
            Material.objects.create(
                nombre='Otro Material',
                codigo='TUB-001',
                categoria=self.categoria,
                precio=Decimal('30.00'),
                cantidad=5,
                creado_por=self.user
            )
    
    def test_material_str(self):
        """Probar la representación en string"""
        self.assertEqual(str(self.material), 'Tubo de Acero (TUB-001)')


class MaterialAPITestCase(APITestCase):
    """Pruebas para los endpoints de Material"""
    
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.categoria = Categoria.objects.create(
            nombre='Electrónica',
            descripcion='Componentes'
        )
        self.material = Material.objects.create(
            nombre='Cable USB',
            codigo='CABLE-001',
            categoria=self.categoria,
            precio=Decimal('5.99'),
            cantidad=50,
            creado_por=self.user
        )
        self.client.force_authenticate(user=self.user)
    
    def test_listar_materiales(self):
        """Probar GET /api/materiales/"""
        response = self.client.get('/api/materiales/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('results', response.json() or response.json().get('count') is not None)
    
    def test_crear_material(self):
        """Probar POST /api/materiales/"""
        data = {
            'nombre': 'Resistencia 1K',
            'codigo': 'RES-001',
            'categoria': self.categoria.id,
            'precio': '0.50',
            'cantidad': 100,
            'unidad_medida': 'unidad',
            'estado': 'disponible'
        }
        response = self.client.post('/api/materiales/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(Material.objects.filter(codigo='RES-001').exists())
    
    def test_crear_material_sin_nombre(self):
        """Probar validación de nombre obligatorio"""
        data = {
            'nombre': '',
            'codigo': 'TEST-001',
            'categoria': self.categoria.id,
            'precio': '10.00',
            'cantidad': 5
        }
        response = self.client.post('/api/materiales/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_obtener_material(self):
        """Probar GET /api/materiales/{id}/"""
        response = self.client.get(f'/api/materiales/{self.material.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['nombre'], 'Cable USB')
    
    def test_actualizar_material(self):
        """Probar PUT /api/materiales/{id}/"""
        data = {
            'nombre': 'Cable USB Actualizado',
            'codigo': self.material.codigo,
            'categoria': self.categoria.id,
            'precio': '7.99',
            'cantidad': 75,
            'unidad_medida': 'unidad',
            'estado': 'disponible'
        }
        response = self.client.put(f'/api/materiales/{self.material.id}/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        self.material.refresh_from_db()
        self.assertEqual(self.material.nombre, 'Cable USB Actualizado')
        self.assertEqual(self.material.precio, Decimal('7.99'))
    
    def test_eliminar_material(self):
        """Probar DELETE /api/materiales/{id}/"""
        material_id = self.material.id
        response = self.client.delete(f'/api/materiales/{material_id}/')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Material.objects.filter(id=material_id).exists())
    
    def test_actualizar_cantidad(self):
        """Probar endpoint actualizar_cantidad"""
        data = {'cantidad': 30, 'tipo': 'ajuste'}
        response = self.client.post(
            f'/api/materiales/{self.material.id}/actualizar_cantidad/',
            data,
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        self.material.refresh_from_db()
        self.assertEqual(self.material.cantidad, 30)
    
    def test_obtener_historial(self):
        """Probar endpoint historial"""
        response = self.client.get(f'/api/materiales/{self.material.id}/historial/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
    
    def test_obtener_estadisticas(self):
        """Probar endpoint estadísticas"""
        response = self.client.get('/api/materiales/estadisticas/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertIn('total_materiales', data)
        self.assertIn('materiales_disponibles', data)
        self.assertIn('valor_total_inventario', data)


class CategoriaAPITestCase(APITestCase):
    """Pruebas para los endpoints de Categoría"""
    
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            password='testpass123'
        )
        self.categoria = Categoria.objects.create(
            nombre='Plomería',
            descripcion='Materiales de plomería'
        )
        self.client.force_authenticate(user=self.user)
    
    def test_listar_categorias(self):
        """Probar GET /api/categorias/"""
        response = self.client.get('/api/categorias/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
    
    def test_crear_categoria(self):
        """Probar POST /api/categorias/"""
        data = {
            'nombre': 'Carpintería',
            'descripcion': 'Materiales para carpintería'
        }
        response = self.client.post('/api/categorias/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(Categoria.objects.filter(nombre='Carpintería').exists())


@override_settings(SUPABASE_JWT_SECRET=TEST_JWT_SECRET)
class SupabaseJWTAuthenticationTestCase(APITestCase):
    """Pruebas del flujo real de autenticación con JWT de Supabase"""

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='jwtuser',
            email='jwt@example.com',
            password='testpass123',
        )
        self.supabase_uid = '11111111-2222-3333-4444-555555555555'
        UsuarioSupabase.objects.create(
            usuario_django=self.user,
            supabase_uid=self.supabase_uid,
            email='jwt@example.com',
            nombre_completo='Usuario JWT',
            rol='usuario',
        )
        self.categoria = Categoria.objects.create(nombre='JWT Test')
        Material.objects.create(
            nombre='Material JWT',
            codigo='JWT-001',
            categoria=self.categoria,
            precio=Decimal('10.00'),
            cantidad=5,
            creado_por=self.user,
        )

    def _make_token(self, supabase_uid=None, expired=False):
        exp = datetime.now(timezone.utc) + (
            timedelta(seconds=-10) if expired else timedelta(hours=1)
        )
        payload = {
            'sub': supabase_uid or self.supabase_uid,
            'aud': 'authenticated',
            'exp': exp,
        }
        return jwt.encode(payload, TEST_JWT_SECRET, algorithm='HS256')

    def test_materiales_con_bearer_token(self):
        token = self._make_token()
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        response = self.client.get('/api/materiales/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_materiales_con_token_prefix_compatibilidad(self):
        token = self._make_token()
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {token}')
        response = self.client.get('/api/materiales/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_materiales_sin_token(self):
        response = self.client.get('/api/materiales/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_materiales_con_token_expirado(self):
        token = self._make_token(expired=True)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        response = self.client.get('/api/materiales/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_materiales_con_usuario_no_registrado(self):
        token = self._make_token(supabase_uid='99999999-9999-9999-9999-999999999999')
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        response = self.client.get('/api/materiales/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_auth_me_con_bearer_token(self):
        token = self._make_token()
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        response = self.client.get('/api/auth/me/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['email'], 'jwt@example.com')
        self.assertEqual(response.data['nombre_completo'], 'Usuario JWT')


class AuthAPITestCase(APITestCase):
    """Pruebas para los endpoints de autenticación"""
    
    def setUp(self):
        self.client = APIClient()
    
    def test_login_fallido_credenciales_incorrectas(self):
        """Probar login con credenciales incorrectas"""
        data = {
            'email': 'noexiste@example.com',
            'password': 'password_incorrecta'
        }
        response = self.client.post('/api/auth/login/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_registro_sin_email(self):
        """Probar registro sin email"""
        data = {
            'password': 'password123'
        }
        response = self.client.post('/api/auth/register/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_registro_contraseña_corta(self):
        """Probar registro con contraseña muy corta"""
        data = {
            'email': 'test@example.com',
            'password': '123'
        }
        response = self.client.post('/api/auth/register/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class HistorialMaterialTestCase(TestCase):
    """Pruebas para el historial de materiales"""
    
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            password='testpass123'
        )
        self.categoria = Categoria.objects.create(nombre='Test')
        self.material = Material.objects.create(
            nombre='Material Test',
            codigo='TEST-001',
            categoria=self.categoria,
            precio=Decimal('10.00'),
            cantidad=5,
            creado_por=self.user
        )
    
    def test_crear_entrada_historial(self):
        """Probar creación de entrada en historial"""
        historial = HistorialMaterial.objects.create(
            material=self.material,
            accion='edicion',
            usuario=self.user,
            valores_anteriores={'cantidad': 5},
            valores_nuevos={'cantidad': 10}
        )
        self.assertEqual(historial.accion, 'edicion')
        self.assertEqual(historial.material.id, self.material.id)


class UsuarioAPITestCase(APITestCase):
    """Pruebas para los endpoints del módulo Usuarios"""

    def setUp(self):
        self.client = APIClient()
        self.admin_user = User.objects.create_superuser(
            username='admin_test',
            email='admin@test.local',
            password='password123'
        )
        self.normal_user = User.objects.create_user(
            username='user_test',
            email='user@test.local',
            password='password123'
        )
        self.client.force_authenticate(user=self.admin_user)

    def test_listar_usuarios(self):
        """Probar GET /api/usuarios/"""
        response = self.client.get('/api/usuarios/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_crear_usuario(self):
        """Probar POST /api/usuarios/"""
        data = {
            'username': 'nuevo_usuario',
            'email': 'nuevo@test.local',
            'password': 'Password123!',
            'nombre_completo': 'Nuevo Usuario Test',
            'rol': 'supervisor',
            'telefono': '3001234567',
            'departamento': 'Ingeniería'
        }
        response = self.client.post('/api/usuarios/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(username='nuevo_usuario').exists())

    def test_perfil_usuario_autenticado(self):
        """Probar GET /api/usuarios/perfil/"""
        response = self.client.get('/api/usuarios/perfil/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['username'], 'admin_test')

    def test_cambiar_estado_usuario(self):
        """Probar POST /api/usuarios/{id}/cambiar_estado/"""
        response = self.client.post(
            f'/api/usuarios/{self.normal_user.id}/cambiar_estado/',
            {'activo': False},
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.normal_user.refresh_from_db()
        self.assertFalse(self.normal_user.is_active)

    def test_cambiar_rol_usuario(self):
        """Probar POST /api/usuarios/{id}/cambiar_rol/"""
        response = self.client.post(
            f'/api/usuarios/{self.normal_user.id}/cambiar_rol/',
            {'rol': 'bodeguero'},
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)


class ConfiguracionAPITestCase(APITestCase):
    """Pruebas para los endpoints del módulo Configuración"""

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='config_user',
            password='password123'
        )
        self.client.force_authenticate(user=self.user)

    def test_obtener_configuracion_general(self):
        """Probar GET /api/configuracion/"""
        response = self.client.get('/api/configuracion/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('empresa', response.data)
        self.assertIn('sistema', response.data)

    def test_actualizar_configuracion_empresa(self):
        """Probar PUT /api/configuracion/empresa/"""
        data = {
            'nombre_empresa': 'OptiObra Constructora S.A.S.',
            'nit_runc': '901.123.456-7',
            'direccion': 'Av. Central #45-67',
            'telefono': '+57 311 999 8888',
            'email_contacto': 'contacto@constructora.local',
            'moneda_principal': 'COP'
        }
        response = self.client.put('/api/configuracion/empresa/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['nombre_empresa'], 'OptiObra Constructora S.A.S.')

    def test_actualizar_configuracion_sistema(self):
        """Probar PUT /api/configuracion/sistema/"""
        data = {
            'alerta_stock_minimo_defecto': 15,
            'dias_notificacion_vencimiento': 15,
            'modo_mantenimiento': False,
            'formato_fecha': 'DD/MM/YYYY',
            'notificaciones_email': True
        }
        response = self.client.put('/api/configuracion/sistema/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['alerta_stock_minimo_defecto'], 15)


class ReporteAPITestCase(APITestCase):
    """Pruebas para los endpoints del módulo Reportes"""

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='report_user',
            password='password123'
        )
        self.client.force_authenticate(user=self.user)

    def test_reporte_inventario(self):
        """Probar GET /api/reportes/inventario/"""
        response = self.client.get('/api/reportes/inventario/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('total_materiales', response.data)
        self.assertIn('valor_total_inventario', response.data)

    def test_reporte_stock_bajo(self):
        """Probar GET /api/reportes/stock_bajo/"""
        response = self.client.get('/api/reportes/stock_bajo/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('total_criticos', response.data)

    def test_reporte_proyectos(self):
        """Probar GET /api/reportes/proyectos/"""
        response = self.client.get('/api/reportes/proyectos/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('total_proyectos', response.data)

    def test_reporte_trabajadores(self):
        """Probar GET /api/reportes/trabajadores/"""
        response = self.client.get('/api/reportes/trabajadores/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('total_trabajadores', response.data)

