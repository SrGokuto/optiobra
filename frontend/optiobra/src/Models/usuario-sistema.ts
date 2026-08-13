export interface Usuario {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  nombre_completo: string;
  rol: string;
  activo: boolean;
  supabase_uid: string | null;
  perfil: PerfilUsuario;
  is_staff: boolean;
  is_superuser: boolean;
  date_joined: string;
}

export interface PerfilUsuario {
  id: number;
  telefono: string;
  departamento: string;
  cargo: string;
  avatar_url: string;
  direccion: string;
}

export interface UsuarioPayload {
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  nombre_completo?: string;
  rol?: string;
  password?: string;
  telefono?: string;
  departamento?: string;
  cargo?: string;
  direccion?: string;
  avatar_url?: string;
}

export interface UsuarioPaginado {
  count: number;
  next: string | null;
  previous: string | null;
  results: Usuario[];
}
