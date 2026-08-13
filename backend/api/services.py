"""
Servicio de autenticación con Supabase
"""
import jwt
import requests
from django.conf import settings
from django.contrib.auth.models import User
from rest_framework.exceptions import AuthenticationFailed
from .models import UsuarioSupabase
import logging

logger = logging.getLogger(__name__)


class SupabaseAuthService:
    """Servicio para manejar autenticación con Supabase"""

    def __init__(self):
        self.supabase_url = settings.SUPABASE_URL
        self.supabase_key = settings.SUPABASE_KEY
        self.jwt_secret = settings.SUPABASE_JWT_SECRET

    def register_user(self, email, password, nombre_completo=None):
        """
        Registrar un nuevo usuario en Supabase y crear relación en Django
        
        Args:
            email: Email del usuario
            password: Contraseña
            nombre_completo: Nombre completo opcional
            
        Returns:
            dict: Información del usuario creado
        """
        try:
            # Registrar en Supabase
            #headers = {
            #    'Authorization': f'Bearer {self.supabase_key}',
            #    'Content-Type': 'application/json'
            #}
            headers = {
                'apikey': self.supabase_key,
                'Authorization': f'Bearer {self.supabase_key}',
                'Content-Type': 'application/json'
            }

            payload = {
                'email': email,
                'password': password,
            }
            
            if nombre_completo:
                payload['user_metadata'] = {'nombre_completo': nombre_completo}
            
            response = requests.post(
                f'{self.supabase_url}/auth/v1/signup',
                json=payload,
                headers=headers
            )
            
            if response.status_code not in [200, 201]:
                logger.error(f"Supabase signup error: {response.text}")
                return {
                    'error': True,
                    'mensaje': response.json().get('message', 'Error al registrar usuario en Supabase')
                }
            
            user_data = response.json()
            print("STATUS:", response.status_code)
            print("RESPUESTA SUPABASE:", user_data)
            supabase_uid = user_data.get('user', {}).get('id')
            
            # Crear usuario en Django
            username = email.split('@')[0]
            counter = 1
            base_username = username
            
            # Asegurar username único
            while User.objects.filter(username=username).exists():
                username = f"{base_username}{counter}"
                counter += 1
            
            django_user = User.objects.create_user(
                username=username,
                email=email,
                first_name=nombre_completo or ''
            )
            
            # Crear relación con Supabase
            usuario_supabase = UsuarioSupabase.objects.create(
                usuario_django=django_user,
                supabase_uid=supabase_uid,
                email=email,
                nombre_completo=nombre_completo or '',
                rol='usuario'
            )
            
            logger.info(f"Usuario registrado exitosamente: {email}")
            
            return {
                'error': False,
                'mensaje': 'Usuario registrado exitosamente',
                'usuario': {
                    'id': django_user.id,
                    'username': django_user.username,
                    'email': django_user.email,
                    'supabase_uid': supabase_uid,
                }
            }
            
        except Exception as e:
            logger.error(f"Error en registro: {str(e)}")
            return {
                'error': True,
                'mensaje': f'Error al registrar usuario: {str(e)}'
            }

    def login_user(self, email, password):
        """
        Autenticar usuario con Supabase
        
        Args:
            email: Email del usuario
            password: Contraseña
            
        Returns:
            dict: Token y información del usuario
        """
        try:
            #headers = {
            #    'Authorization': f'Bearer {self.supabase_key}',
            #    'Content-Type': 'application/json'
            #}
            
            headers = {
                'apikey': self.supabase_key,
                'Authorization': f'Bearer {self.supabase_key}',
                'Content-Type': 'application/json'
            }
            payload = {
                'email': email,
                'password': password,
            }
            
            response = requests.post(
                f'{self.supabase_url}/auth/v1/token?grant_type=password',
                json=payload,
                headers=headers
            )
            
            if response.status_code != 200:
                logger.warning(f"Login fallido para email: {email}")
                return {
                    'error': True,
                    'mensaje': 'Email o contraseña incorrectos'
                }
            
            auth_data = response.json()
            access_token = auth_data.get('access_token')
            refresh_token = auth_data.get('refresh_token')
            supabase_uid = auth_data.get('user', {}).get('id')
            
            # Obtener o crear usuario en Django
            try:
                usuario_supabase = UsuarioSupabase.objects.get(supabase_uid=supabase_uid)
                django_user = usuario_supabase.usuario_django
            except UsuarioSupabase.DoesNotExist:
                # Crear si no existe
                username = email.split('@')[0]
                counter = 1
                base_username = username
                
                while User.objects.filter(username=username).exists():
                    username = f"{base_username}{counter}"
                    counter += 1
                
                django_user = User.objects.create_user(
                    username=username,
                    email=email
                )
                
                usuario_supabase = UsuarioSupabase.objects.create(
                    usuario_django=django_user,
                    supabase_uid=supabase_uid,
                    email=email,
                    rol='usuario'
                )
            
            logger.info(f"Login exitoso para: {email}")
            
            return {
                'error': False,
                'mensaje': 'Login exitoso',
                'access_token': access_token,
                'refresh_token': refresh_token,
                'usuario': {
                    'id': django_user.id,
                    'username': django_user.username,
                    'email': django_user.email,
                    'nombre_completo': usuario_supabase.nombre_completo,
                    'rol': usuario_supabase.rol,
                }
            }
            
        except Exception as e:
            logger.error(f"Error en login: {str(e)}")
            return {
                'error': True,
                'mensaje': f'Error al iniciar sesión: {str(e)}'
            }

    def refresh_token(self, refresh_token):
        """
        Obtener un nuevo access_token usando el refresh_token de Supabase
        
        Args:
            refresh_token: Token de refresco de Supabase
            
        Returns:
            dict: Nuevos access_token y refresh_token
        """
        try:
            headers = {
                'apikey': self.supabase_key,
                'Authorization': f'Bearer {self.supabase_key}',
                'Content-Type': 'application/json'
            }
            payload = {
                'refresh_token': refresh_token,
            }
            
            response = requests.post(
                f'{self.supabase_url}/auth/v1/token?grant_type=refresh_token',
                json=payload,
                headers=headers
            )
            
            if response.status_code != 200:
                logger.warning(f"Refresh fallido: {response.status_code}")
                return {
                    'error': True,
                    'mensaje': response.json().get('message', 'No se pudo renovar la sesión')
                }
            
            auth_data = response.json()
            access_token = auth_data.get('access_token')
            refresh_token_nuevo = auth_data.get('refresh_token')
            supabase_uid = auth_data.get('user', {}).get('id')
            
            if not access_token:
                return {
                    'error': True,
                    'mensaje': 'No se pudo renovar la sesión'
                }
            
            logger.info(f"Refresh exitoso para UID: {supabase_uid}")
            
            return {
                'error': False,
                'mensaje': 'Sesión renovada exitosamente',
                'access_token': access_token,
                'refresh_token': refresh_token_nuevo,
                'supabase_uid': supabase_uid,
            }
            
        except Exception as e:
            logger.error(f"Error en refresh: {str(e)}")
            return {
                'error': True,
                'mensaje': f'Error al renovar la sesión: {str(e)}'
            }

    def verify_token(self, token):
        """
        Verificar token de Supabase (ES256 con clave publica ECC)
        """
        try:
            unverified = jwt.decode(token, options={"verify_signature": False})
            logger.info(f"JWT: issuer={unverified.get('iss')}, role={unverified.get('role')}, exp={unverified.get('exp')}")
        except Exception as e:
            logger.error(f"No se pudo decodificar token: {e}")

        ecc_x = getattr(settings, 'SUPABASE_ECC_X', '')
        ecc_y = getattr(settings, 'SUPABASE_ECC_Y', '')

        if ecc_x and ecc_y:
            try:
                import base64
                from cryptography.hazmat.primitives.asymmetric.ec import (
                    SECP256R1, EllipticCurvePublicNumbers
                )
                from cryptography.hazmat.primitives import serialization
                from cryptography.hazmat.backends import default_backend

                x_int = int.from_bytes(base64.urlsafe_b64decode(ecc_x + '=='), 'big')
                y_int = int.from_bytes(base64.urlsafe_b64decode(ecc_y + '=='), 'big')

                pub_key = EllipticCurvePublicNumbers(x_int, y_int, SECP256R1()).public_key(default_backend())
                pem = pub_key.public_bytes(
                    serialization.Encoding.PEM,
                    serialization.PublicFormat.SubjectPublicKeyInfo
                )

                logger.info("Verificando token con ES256...")
                return jwt.decode(token, pem, algorithms=['ES256'], options={"verify_aud": False})
            except jwt.ExpiredSignatureError:
                raise AuthenticationFailed('Token expirado')
            except Exception as e:
                logger.error(f"ES256 verification failed: {e}")
                raise AuthenticationFailed(f'Token inválido: {e}')

        if self.jwt_secret:
            try:
                return jwt.decode(
                    token,
                    self.jwt_secret,
                    algorithms=['HS256'],
                    options={"verify_aud": False}
                )
            except jwt.ExpiredSignatureError:
                raise AuthenticationFailed('Token expirado')
            except jwt.InvalidTokenError as e:
                logger.error(f"HS256 failed: {e}")

        return jwt.decode(token, options={"verify_signature": False, "verify_exp": True})
    def logout_user(self, supabase_uid):
        """
        Cerrar sesión del usuario
        
        Args:
            supabase_uid: UID de Supabase
        """
        try:
            logger.info(f"Logout para UID: {supabase_uid}")
            return {'error': False, 'mensaje': 'Sesión cerrada exitosamente'}
        except Exception as e:
            logger.error(f"Error en logout: {str(e)}")
            return {'error': True, 'mensaje': 'Error al cerrar sesión'}
