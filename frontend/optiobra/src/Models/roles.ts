export const ROL_USUARIO = 'usuario';
export const ROL_OBRERO = 'obrero';
export const ROL_ARQUITECTO = 'arquitecto';
export const ROL_MAESTRO_OBRA = 'maestro_obra';
export const ROL_SUPERVISOR = 'supervisor';
export const ROL_INGENIERO = 'ingeniero';
export const ROL_ADMIN = 'admin';

export const ROLES_GESTION = [
  ROL_ARQUITECTO,
  ROL_MAESTRO_OBRA,
  ROL_SUPERVISOR,
  ROL_INGENIERO,
  ROL_ADMIN,
];

export const ROLES_OBREROS = [ROL_OBRERO, ...ROLES_GESTION];

export const ROLES_ADMIN = [ROL_ADMIN];

export const NIVEL_ROL: Record<string, number> = {
  [ROL_USUARIO]: 10,
  [ROL_OBRERO]: 20,
  [ROL_ARQUITECTO]: 30,
  [ROL_MAESTRO_OBRA]: 30,
  [ROL_SUPERVISOR]: 40,
  [ROL_INGENIERO]: 40,
  [ROL_ADMIN]: 100,
};

export function nivelRol(rol?: string): number {
  return NIVEL_ROL[rol ?? ''] ?? NIVEL_ROL[ROL_USUARIO];
}

export function esRol(rol: string | undefined, ...roles: string[]): boolean {
  return !!rol && roles.includes(rol);
}

export function tieneRolMinimo(rol: string | undefined, rolObjetivo: string): boolean {
  return nivelRol(rol) >= nivelRol(rolObjetivo);
}
