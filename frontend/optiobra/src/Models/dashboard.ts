export interface ProyectoResumen {
  id: number;
  nombre: string;
  estado: string;
  porcentaje_avance: number;
}

export interface DashboardEstadisticas {
  rol: string;
  mensaje?: string;
  dashboard_basico?: boolean;
  // Obrero
  total_tareas_pendientes?: number;
  total_tareas_en_progreso?: number;
  total_tareas_completadas?: number;
  // Gestión
  total_proyectos?: number;
  proyectos_en_progreso?: number;
  total_materiales?: number;
  total_obreros?: number;
  avance_promedio?: number;
  proyectos_recientes?: ProyectoResumen[];
}