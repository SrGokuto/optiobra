export interface Proyecto {
  id: number;
  nombre: string;
  descripcion?: string;
  direccion?: string;
  ubicacion: string;
  responsable?: string;
  estado: 'pendiente' | 'en_proceso' | 'finalizado' | 'cancelado';
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
  descripcion?: string | null;
  ubicacion: string;
  direccion?: string | null;
  responsable?: string | null;
  estado: Proyecto['estado'];
  avance: number;
  porcentaje_avance: number;
  fecha_inicio: string | null;
  fecha_fin: string | null;
  fecha_fin_estimada?: string | null;
  presupuesto?: number | null;
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
  'pendiente',
  'en_proceso',
  'finalizado',
  'cancelado',
];

export const ESTADOS_PROYECTO_ETIQUETAS: Record<Proyecto['estado'], string> = {
  pendiente: 'Pendiente',
  en_proceso: 'En Proceso',
  finalizado: 'Finalizado',
  cancelado: 'Cancelado',
};
