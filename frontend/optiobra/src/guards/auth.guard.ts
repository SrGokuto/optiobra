import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../Services/auth.service';

export const authGuard: CanActivateFn = async () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated() && !authService.usuarioActual.value) {
    const ok = await authService.cargarUsuarioActual();
    if (!ok) {
      return router.createUrlTree(['/login']);
    }
  }

  if (authService.isAuthenticated()) {
    return true;
  }

  return router.createUrlTree(['/login']);
};

export const guestGuard: CanActivateFn = async () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated() && !authService.usuarioActual.value) {
    await authService.cargarUsuarioActual();
  }

  if (!authService.isAuthenticated()) {
    return true;
  }

  return router.createUrlTree(['/dashboard']);
};

export function rolGuard(roles: string[]): CanActivateFn {
  return async () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (!authService.isAuthenticated()) {
      return router.createUrlTree(['/login']);
    }

    if (!authService.usuarioActual.value) {
      const ok = await authService.cargarUsuarioActual();
      if (!ok) {
        return router.createUrlTree(['/login']);
      }
    }

    if (authService.esRol(...roles)) {
      return true;
    }

    return router.createUrlTree(['/dashboard']);
  };
}
