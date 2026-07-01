import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Avance {
  id: number;
  fecha: string;
  proyecto: string;
  actividad: string;
  avance: number;
  responsable: string;
}

@Component({
  selector: 'app-avance-obra',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './avance-obra.html',
  styleUrls: ['./avance-obra.scss']
})
export class AvanceObra {
  menuAbierto = true;
  selectedProyecto = 'Todos los proyectos';
  mostrarModal = false;
  mostrarEliminar = false;
  modoEdicion = false;
  idEliminar = 0;

  nuevoAvance: Omit<Avance, 'id'> = {
    fecha: new Date().toISOString().slice(0, 10),
    proyecto: 'Edificio A',
    actividad: '',
    avance: 0,
    responsable: ''
  };

  avanceSeleccionado: Avance | null = null;

  proyectos = [
    { nombre: 'Edificio A', avance: 75 },
    { nombre: 'Casa Residencial', avance: 60 },
    { nombre: 'Puente San Martín', avance: 30 },
    { nombre: 'Almacén Central', avance: 0 },
    { nombre: 'Colegio Primaria', avance: 100 }
  ];

  avancesRecientes: Avance[] = [
    { id: 1, fecha: '2024-05-24', proyecto: 'Edificio A', actividad: 'Vaciado de columnas', avance: 78, responsable: 'Juan Pérez' },
    { id: 2, fecha: '2024-05-24', proyecto: 'Casa Residencial', actividad: 'Instalación eléctrica', avance: 60, responsable: 'María Fernández' },
    { id: 3, fecha: '2024-05-23', proyecto: 'Puente San Martín', actividad: 'Fundición de losa', avance: 30, responsable: 'Carlos López' },
    { id: 4, fecha: '2024-05-22', proyecto: 'Almacén Central', actividad: 'Limpieza de terreno', avance: 0, responsable: 'Luis Rodríguez' },
    { id: 5, fecha: '2024-05-21', proyecto: 'Colegio Primaria', actividad: 'Acabados finales', avance: 100, responsable: 'Ana Martínez' }
  ];

  get proyectosDisponibles(): string[] {
    return [
      'Todos los proyectos',
      ...Array.from(new Set(this.proyectos.map((p) => p.nombre)))
    ];
  }

  get avancesFiltrados(): Avance[] {
    return this.selectedProyecto === 'Todos los proyectos'
      ? this.avancesRecientes
      : this.avancesRecientes.filter((avance) => avance.proyecto === this.selectedProyecto);
  }

  get avancePromedio(): number {
    if (this.avancesRecientes.length === 0) {
      return 0;
    }
    const total = this.avancesRecientes.reduce((sum, avance) => sum + avance.avance, 0);
    return Math.round(total / this.avancesRecientes.length);
  }

  get tareasCompletas(): number {
    return this.avancesRecientes.filter((avance) => avance.avance >= 100).length;
  }

  get tareasPendientes(): number {
    return this.avancesRecientes.filter((avance) => avance.avance < 100).length;
  }

  get estadisticas() {
    return [
      {
        icon: 'folder',
        titulo: 'Proyectos en progreso',
        valor: this.proyectos.length,
        detalle: 'proyectos',
        color: 'amber'
      },
      {
        icon: 'trending_up',
        titulo: 'Avance promedio',
        valor: `${this.avancePromedio}%`,
        detalle: '+5% este mes',
        success: true,
        color: 'emerald'
      },
      {
        icon: 'check_circle',
        titulo: 'Tareas completadas',
        valor: this.tareasCompletas,
        detalle: 'tareas',
        color: 'blue'
      },
      {
        icon: 'schedule',
        titulo: 'Tareas pendientes',
        valor: this.tareasPendientes,
        detalle: 'tareas',
        warning: true,
        color: 'orange'
      }
    ];
  }

  toggleMenu() {
    this.menuAbierto = !this.menuAbierto;
  }

  seleccionarProyecto(value: string) {
    this.selectedProyecto = value;
  }

  abrirNuevoAvance() {
    this.modoEdicion = false;
    this.avanceSeleccionado = null;
    this.nuevoAvance = {
      fecha: new Date().toISOString().slice(0, 10),
      proyecto: this.proyectos[0]?.nombre ?? 'Edificio A',
      actividad: '',
      avance: 0,
      responsable: ''
    };
    this.mostrarModal = true;
  }

  cerrarModal() {
    this.mostrarModal = false;
  }

  guardarAvance() {
    if (this.modoEdicion && this.avanceSeleccionado) {
      const index = this.avancesRecientes.findIndex((item) => item.id === this.avanceSeleccionado?.id);
      if (index !== -1) {
        this.avancesRecientes[index] = {
          ...this.avanceSeleccionado,
          fecha: this.nuevoAvance.fecha,
          proyecto: this.nuevoAvance.proyecto,
          actividad: this.nuevoAvance.actividad,
          avance: Number(this.nuevoAvance.avance),
          responsable: this.nuevoAvance.responsable
        };
      }
    } else {
      const nuevoId = this.avancesRecientes.length > 0
        ? Math.max(...this.avancesRecientes.map((avance) => avance.id)) + 1
        : 1;

      this.avancesRecientes = [
        {
          id: nuevoId,
          fecha: this.nuevoAvance.fecha,
          proyecto: this.nuevoAvance.proyecto,
          actividad: this.nuevoAvance.actividad,
          avance: Number(this.nuevoAvance.avance),
          responsable: this.nuevoAvance.responsable
        },
        ...this.avancesRecientes
      ];
    }

    this.cerrarModal();
  }

  editarAvance(avance: Avance) {
    this.modoEdicion = true;
    this.avanceSeleccionado = { ...avance };
    this.nuevoAvance = {
      fecha: avance.fecha,
      proyecto: avance.proyecto,
      actividad: avance.actividad,
      avance: avance.avance,
      responsable: avance.responsable
    };
    this.mostrarModal = true;
  }

  eliminarAvance(id: number) {
    this.idEliminar = id;
    this.mostrarEliminar = true;
  }

  cancelarEliminar() {
    this.mostrarEliminar = false;
    this.idEliminar = 0;
  }

  confirmarEliminar() {
    this.avancesRecientes = this.avancesRecientes.filter((avance) => avance.id !== this.idEliminar);
    this.cancelarEliminar();
  }
}
