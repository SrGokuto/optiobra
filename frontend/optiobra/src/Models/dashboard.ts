export interface ProyectoResumen {
  id: number;
  nombre: string;
  estado: 'Pendiente' | 'En progreso' | 'Completado';
  porcentaje_avance: number;
}

export interface DashboardEstadisticas {
  total_proyectos: number;
  proyectos_en_progreso: number;
  total_materiales: number;
  total_trabajadores: number;
  avance_promedio: number;
  valor_total_inventario: number;
  proyectos_recientes: ProyectoResumen[];
}
