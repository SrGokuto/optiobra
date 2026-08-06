export interface AvanceObra {
  id: number;
  proyecto: number;
  proyecto_nombre: string;
  actividad: string;
  descripcion?: string;
  porcentaje: number;
  responsable: string;
  fecha: string;
}

export interface AvanceObraPayload {
  proyecto: number;
  actividad: string;
  descripcion?: string;
  porcentaje: number;
  responsable: string;
  fecha: string;
}

export interface AvanceObraPaginado {
  count: number;
  next: string | null;
  previous: string | null;
  results: AvanceObra[];
}
