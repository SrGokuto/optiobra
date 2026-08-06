export interface Reporte {
  id: number;
  titulo: string;
  tipo_reporte: string;
  formato: string;
  parametros: Record<string, unknown>;
  solicitado_por: number;
  solicitado_por_nombre: string;
  fecha_generacion: string;
  estado: string;
  resumen_datos: Record<string, unknown>;
}

export interface ReportePaginado {
  count: number;
  next: string | null;
  previous: string | null;
  results: Reporte[];
}

export interface ReporteInventario {
  total_materiales: number;
  valor_total_inventario: number;
  desglose_categorias: { id: number; nombre: string; total_items: number; valor_categoria: number }[];
}

export interface ReporteStockBajo {
  umbral_alerta: number;
  total_criticos: number;
  materiales: { id: number; nombre: string; codigo: string; categoria: string; cantidad: number; precio: number; estado: string }[];
}

export interface ReporteProyectos {
  total_proyectos: number;
  promedio_avance_general: number;
  proyectos: { id: number; nombre: string; ubicacion: string; estado: string; porcentaje_avance: number; total_avances: number; fecha_inicio: string; fecha_fin: string }[];
}

export interface ReporteTrabajadores {
  total_trabajadores: number;
  activos: number;
  inactivos: number;
  distribucion_por_rol: { rol: string; total: number }[];
}
