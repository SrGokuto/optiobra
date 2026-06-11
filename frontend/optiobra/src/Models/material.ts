// models/material.model.ts

export interface Material {
  id:             number;
  nombre:         string;
  categoria:      string;
  unidad:         string;
  cantidad:       number;
  precioUnitario: number;
  proyecto:       string;
}

export interface MaterialPaginado {
  materiales:    Material[];
  totalRegistros: number;
  paginaActual:  number;
  totalPaginas:  number;
}

export interface FiltroMaterial {
  busqueda?: string;
  proyecto?: string;
  pagina?:   number;
  limite?:   number;
}

export const CATEGORIAS = [
  'Cemento',
  'Áridos',
  'Ladrillos',
  'Acero',
  'Acabados',
  'Madera',
  'Electricidad',
  'Plomería',
];

export const UNIDADES = [
  'Bulto (50kg)',
  'm³',
  'Unidad',
  'Varilla (9m)',
  'Galón',
  'Metro',
  'Kg',
  'Litro',
];

export const PROYECTOS = [
  'Todos los proyectos',
  'Edificio A',
  'Casa Residencial',
  'Torre B',
  'Conjunto Habitacional',
];