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
  creado_por_id?: number | null;
  creado_por_nombre?: string | null;
}

export interface PerfilUsuario {
  id: number;
  dni: string;
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
  dni?: string;
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
