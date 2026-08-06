export interface Proyecto {
  id: number;
  nombre: string;
  descripcion?: string;
  direccion?: string;
  ubicacion: string;
  responsable?: string;
  estado: 'Pendiente' | 'En progreso' | 'Completado' | 'pendiente' | 'en_proceso' | 'finalizado' | 'cancelado';
  avance: number;
  porcentaje_avance: number;
  avances_count: number;
  fecha_inicio: string;
  fecha_fin: string;
  fecha_fin_estimada?: string;
  presupuesto?: string;
  creado_en: string;
  actualizado_en: string;
  creado_por?: number;
  creado_por_nombre?: string;
}

export interface ProyectoPayload {
  nombre: string;
  descripcion?: string;
  ubicacion: string;
  direccion?: string;
  responsable?: string;
  estado: Proyecto['estado'];
  avance: number;
  porcentaje_avance: number;
  fecha_inicio: string;
  fecha_fin: string;
  fecha_fin_estimada?: string;
  presupuesto?: string;
}

export interface ProyectoPaginado {
  count: number;
  next: string | null;
  previous: string | null;
  results: Proyecto[];
}

export interface FiltroProyecto {
  search?: string;
  estado?: string;
  page?: number;
}

export const ESTADOS_PROYECTO: Proyecto['estado'][] = [
  'Pendiente',
  'En progreso',
  'Completado',
  'pendiente',
  'en_proceso',
  'finalizado',
  'cancelado',
];
