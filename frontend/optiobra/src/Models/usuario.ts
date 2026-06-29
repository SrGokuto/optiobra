export interface UsuarioAuth {
  id: number;
  username: string;
  email: string;
  nombre_completo?: string;
  rol?: string;
  activo?: boolean;
}

export interface LoginResponse {
  error: boolean;
  mensaje: string;
  access_token?: string;
  usuario?: UsuarioAuth;
}

export interface RegisterPayload {
  email: string;
  password: string;
  nombre_completo?: string;
}

export interface RegisterResponse {
  error: boolean;
  mensaje: string;
  usuario?: UsuarioAuth;
}
