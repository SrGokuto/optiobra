from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed

from .models import UsuarioSupabase
from .services import SupabaseAuthService


class SupabaseJWTAuthentication(BaseAuthentication):

    def authenticate(self, request):
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')

        if not auth_header:
            return None

        token = self._extract_token(auth_header)

        if not token:
            return None

        auth_service = SupabaseAuthService()

        try:
            payload = auth_service.verify_token(token)
        except Exception:
            raise AuthenticationFailed("Token inválido")

        supabase_uid = payload.get('sub')

        if not supabase_uid:
            raise AuthenticationFailed('Token inválido: sin sub')

        try:
            usuario_supabase = UsuarioSupabase.objects.select_related(
                'usuario_django'
            ).get(supabase_uid=supabase_uid)

        except UsuarioSupabase.DoesNotExist:
            raise AuthenticationFailed('Usuario no registrado en el sistema')

        if not usuario_supabase.activo:
            raise AuthenticationFailed('Usuario desactivado')

        django_user = usuario_supabase.usuario_django

        if not django_user or not django_user.is_active:
            raise AuthenticationFailed('Usuario Django inválido')

        return (django_user, token)

    def _extract_token(self, auth_header):
        parts = auth_header.split()

        if len(parts) != 2:
            return None

        prefix, token = parts[0], parts[1]

        if prefix.lower() in ('bearer', 'token'):
            return token

        return None

    def authenticate_header(self, request):
        return 'Bearer'