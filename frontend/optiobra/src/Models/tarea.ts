export interface Tarea {
  id: number;
  titulo: string;
  descripcion?: string;
  proyecto: number;
  proyecto_nombre: string;
  obrero: number;
  obrero_nombre: string;
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

export interface TareaPayload {
  titulo: string;
  descripcion?: string;
  proyecto: number;
  obrero: number;
  estado?: Tarea['estado'];
  prioridad?: Tarea['prioridad'];
  fecha_limite?: string | null;
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
