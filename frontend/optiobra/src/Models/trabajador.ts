export interface Trabajador {
  id: number;
  nombre: string;
  dni: string;
  rol: string;
  telefono: string;
  estado: 'Activo' | 'Inactivo';
}

export interface TrabajadorPayload {
  nombre: string;
  dni: string;
  rol: string;
  telefono: string;
  estado: Trabajador['estado'];
}

export interface TrabajadorPaginado {
  count: number;
  next: string | null;
  previous: string | null;
  results: Trabajador[];
}
