export interface Proyecto {
  id: number;
  nombre: string;
  ubicacion: string;
  fecha_inicio: string;
  fecha_fin: string;
  estado: 'Pendiente' | 'En progreso' | 'Completado';
  porcentaje_avance: number;
  avances_count: number;
}

export interface ProyectoPayload {
  nombre: string;
  ubicacion: string;
  fecha_inicio: string;
  fecha_fin: string;
  estado: Proyecto['estado'];
  porcentaje_avance: number;
}

export interface ProyectoPaginado {
  count: number;
  next: string | null;
  previous: string | null;
  results: Proyecto[];
}
