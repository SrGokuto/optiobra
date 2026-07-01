import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Trabajador {
  id: number;
  nombre: string;
  dni: string;
  rol: string;
  telefono: string;
  estado: string;
}

@Component({
  selector: 'app-trabajadores',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './trabajadores.html',
  styleUrls: ['./trabajadores.scss']
})
export class Trabajadores {

  /*==========================
      MENÚ
  ==========================*/

  menuAbierto = true;

  toggleMenu() {
    this.menuAbierto = !this.menuAbierto;
  }

  navigateTo(ruta: string) {
    // Implementar navegación según tu router
    console.log('Navegar a:', ruta);
  }

  /*==========================
      FILTROS
  ==========================*/

  textoBusqueda = '';
  rolSeleccionado = '';

  roles: string[] = [
    'Ingeniero',
    'Arquitecto',
    'Maestro de obra',
    'Supervisor',
    'Albañil',
    'Electricista',
    'Plomero',
    'Carpintero'
  ];

  /*==========================
      DATOS
  ==========================*/

  trabajadores: Trabajador[] = [
    { id: 1, nombre: 'Juan Pérez García',   dni: '12345678', rol: 'Maestro de obra', telefono: '967 854 321', estado: 'Activo'   },
    { id: 2, nombre: 'María Fernández',     dni: '87654321', rol: 'Ingeniero',       telefono: '912 345 678', estado: 'Activo'   },
    { id: 3, nombre: 'Carlos López',        dni: '23456789', rol: 'Operario',        telefono: '989 765 432', estado: 'Activo'   },
    { id: 4, nombre: 'Luis Rodríguez',      dni: '34567890', rol: 'Electricista',    telefono: '923 456 789', estado: 'Activo'   },
    { id: 5, nombre: 'Ana Martínez',        dni: '45678901', rol: 'Arquitecto',      telefono: '944 567 890', estado: 'Inactivo' },
  ];

  trabajadoresFiltrados: Trabajador[] = [...this.trabajadores];

  /*==========================
      PAGINACIÓN
  ==========================*/

  paginaActual = 1;
  porPagina = 5;

  get totalPaginas(): number {
    return Math.ceil(this.trabajadoresFiltrados.length / this.porPagina);
  }

  get paginas(): number[] {
    return Array.from({ length: this.totalPaginas }, (_, i) => i + 1);
  }

  // Páginas visibles con puntos suspensivos cuando hay muchas páginas
  get paginasVisible(): Array<number | string> {
    const total = this.totalPaginas;
    if (total <= 5) return this.paginas;

    const current = this.paginaActual;
    const visible: Array<number | string> = [];

    if (current <= 3) {
      visible.push(1, 2, 3, '...', total);
    } else if (current >= total - 2) {
      visible.push(1, '...', total - 2, total - 1, total);
    } else {
      visible.push(1, '...', current - 1, current, current + 1, '...', total);
    }

    return visible;
  }

  onPageClick(p: number | string) {
    if (p === '...') return;
    this.cambiarPagina(Number(p));
  }

  get trabajadoresPaginados(): Trabajador[] {
    const inicio = (this.paginaActual - 1) * this.porPagina;
    return this.trabajadoresFiltrados.slice(inicio, inicio + this.porPagina);
  }

  cambiarPagina(pagina: number) {
    // Acepta cualquier valor y lo clampa dentro del rango válido
    const clamped = Math.max(1, Math.min(pagina, Math.max(1, this.totalPaginas)));
    this.paginaActual = clamped;
  }

  min(a: number, b: number): number {
    return Math.min(a, b);
  }

  /*==========================
      BUSCADOR
  ==========================*/

  filtrarTrabajadores() {
    this.paginaActual = 1;
    this.trabajadoresFiltrados = this.trabajadores.filter(t => {
      const coincideNombre = t.nombre
        .toLowerCase()
        .includes(this.textoBusqueda.toLowerCase());
      const coincideRol =
        this.rolSeleccionado === '' || t.rol === this.rolSeleccionado;
      return coincideNombre && coincideRol;
    });
  }

  /*==========================
      MODAL NUEVO
  ==========================*/

  mostrarModal = false;

  nuevo: Trabajador = {
    id: 0, nombre: '', dni: '', rol: '', telefono: '', estado: 'Activo'
  };

  nuevoTrabajador() {
    this.mostrarModal = true;
  }

  cerrarModal() {
    this.mostrarModal = false;
    this.nuevo = { id: 0, nombre: '', dni: '', rol: '', telefono: '', estado: 'Activo' };
  }

  guardarTrabajador() {
    const nuevoId = this.trabajadores.length > 0
      ? Math.max(...this.trabajadores.map(t => t.id)) + 1
      : 1;
    this.trabajadores.push({ ...this.nuevo, id: nuevoId });
    this.filtrarTrabajadores();
    this.cerrarModal();
  }

  /*==========================
      EDITAR
  ==========================*/

  mostrarEditar = false;

  trabajadorEditar: Trabajador = {
    id: 0, nombre: '', dni: '', rol: '', telefono: '', estado: 'Activo'
  };

  editarTrabajador(trabajador: Trabajador) {
    this.trabajadorEditar = { ...trabajador };
    this.mostrarEditar = true;
  }

  cerrarEditar() {
    this.mostrarEditar = false;
  }

  actualizarTrabajador() {
    const index = this.trabajadores.findIndex(t => t.id === this.trabajadorEditar.id);
    if (index !== -1) {
      this.trabajadores[index] = { ...this.trabajadorEditar };
    }
    this.filtrarTrabajadores();
    this.cerrarEditar();
  }

  /*==========================
      ELIMINAR
  ==========================*/

  mostrarEliminar = false;
  idEliminar = 0;

  eliminarTrabajador(id: number) {
    this.idEliminar = id;
    this.mostrarEliminar = true;
  }

  cancelarEliminar() {
    this.mostrarEliminar = false;
    this.idEliminar = 0;
  }

  confirmarEliminar() {
    this.trabajadores = this.trabajadores.filter(t => t.id !== this.idEliminar);
    this.filtrarTrabajadores();
    this.cancelarEliminar();
  }
}