export interface Categoria {
  id: number;
  nombre: string;
  descripcion?: string;
}

export interface Material {
  id: number;
  nombre: string;
  descripcion?: string;
  codigo: string;
  categoria: number;
  categoria_nombre?: string;
  precio: string;
  cantidad: number;
  unidad_medida: string;
  estado: 'disponible' | 'no_disponible' | 'descontinuado';
  proveedor?: string;
}

export interface MaterialPaginado {
  count: number;
  next: string | null;
  previous: string | null;
  results: Material[];
}

export interface FiltroMaterial {
  search?: string;
  categoria?: number;
  estado?: string;
  page?: number;
}

export interface MaterialPayload {
  nombre: string;
  codigo: string;
  categoria: number;
  precio: string;
  cantidad: number;
  unidad_medida: string;
  estado: Material['estado'];
  descripcion?: string;
  proveedor?: string;
}

export const ESTADOS_MATERIAL: Material['estado'][] = [
  'disponible',
  'no_disponible',
  'descontinuado',
];

export const UNIDADES = [
  'unidad',
  'Bulto (50kg)',
  'm³',
  'Varilla (9m)',
  'Galón',
  'Metro',
  'Kg',
  'Litro',
];
