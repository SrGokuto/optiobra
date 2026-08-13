export interface Tarea {
  id: number;
  titulo: string;
  descripcion?: string;
  proyecto: number;
  proyecto_nombre: string;
  trabajador_asignado: number;
  trabajador_nombre: string;
  estado: 'pendiente' | 'en_progreso' | 'completada' | 'cancelada';
  prioridad: 'baja' | 'media' | 'alta' | 'urgente';
  fecha_limite?: string;
  creado_en: string;
  actualizado_en: string;
}

export interface TareaPaginado {
  count: number;
  next: string | null;
  previous: string | null;
  results: Tarea[];
}

export const ESTADOS_TAREA: Tarea['estado'][] = [
  'pendiente',
  'en_progreso',
  'completada',
  'cancelada',
];

export const PRIORIDADES_TAREA: Tarea['prioridad'][] = [
  'baja',
  'media',
  'alta',
  'urgente',
];
