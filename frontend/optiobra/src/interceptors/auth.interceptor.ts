import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { from, lastValueFrom } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../Services/auth.service';
import { environment } from '../environments/environment';

const MAX_REINTENTOS = 1;
const MARCADOR_REINTENTO = 'x-auth-reintento';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const esLogin = req.url.includes('/auth/login/');
  const esRegister = req.url.includes('/auth/register/');
  const esRefresh = req.url.includes('/auth/refresh/');

  if (esLogin || esRegister || esRefresh) {
    return next(req);
  }

  const request = adjuntarToken(req, authService);

  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status !== 401) {
        throw error;
      }

      const yaReintentado = req.headers.has(MARCADOR_REINTENTO);
      if (yaReintentado) {
        authService.clearSession();
        router.navigate(['/login']);
        throw error;
      }

      return from(reintentarConTokenNuevo(req, authService, next, router));
    }),
  );
};

function adjuntarToken(
  req: HttpRequest<unknown>,
  authService: AuthService,
): HttpRequest<unknown> {
  const token = authService.getToken();
  if (token && req.url.startsWith(environment.apiUrl)) {
    return req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    });
  }
  return req;
}

async function reintentarConTokenNuevo(
  req: HttpRequest<unknown>,
  authService: AuthService,
  next: HttpHandlerFn,
  router: Router,
): Promise<HttpEvent<unknown>> {
  const refrescado = await authService.refrescarToken();

  if (!refrescado) {
    if (!authService.getToken()) {
      authService.clearSession();
      router.navigate(['/login']);
    }
    throw new Error('Sesión expirada');
  }

  const reintento = req.clone({
    setHeaders: { [MARCADOR_REINTENTO]: String(MAX_REINTENTOS) },
  });

  return lastValueFrom(next(adjuntarToken(reintento, authService)));
}