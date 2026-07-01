import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../components/sidebar/sidebar';
import { AvanceObraService } from '../../../Services/avance-obra.service';
import { ProyectoService } from '../../../Services/proyecto.service';
import { AvanceObra as AvanceObraModel, AvanceObraPayload } from '../../../Models/avance-obra';
import { Proyecto } from '../../../Models/proyecto';
import { AuthService } from '../../../Services/auth.service';

@Component({
  selector: 'app-avance-obra',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  templateUrl: './avance-obra.html',
  styleUrls: ['./avance-obra.scss']
})
export class AvanceObraComponent implements OnInit {
  menuAbierto = true;
  mostrarModal = false;
  mostrarEliminar = false;
  modoEdicion = false;
  idEliminar = 0;

  avances: AvanceObraModel[] = [];
  proyectos: Proyecto[] = [];
  selectedProyecto = 'Todos los proyectos';
  cargando = false;
  error = '';
  mensaje = '';

  nuevoAvance: AvanceObraPayload = {
    proyecto: 0,
    fecha: new Date().toISOString().slice(0, 10),
    actividad: '',
    porcentaje: 0,
    responsable: '',
  };

  avanceSeleccionado: AvanceObraModel | null = null;

  constructor(
    private avanceObraService: AvanceObraService,
    private proyectoService: ProyectoService,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.cargarProyectos();
    this.cargarAvances();
  }

  toggleMenu() {
    this.menuAbierto = !this.menuAbierto;
  }

  cargarProyectos(): void {
    this.proyectoService.getProyectos().subscribe({
      next: (response) => {
        this.proyectos = response.results;
      },
      error: () => {
        this.error = 'No se pudieron cargar los proyectos';
      },
    });
  }

  cargarAvances(): void {
    this.cargando = true;
    this.error = '';

    const filtros: { proyecto?: number } = {};
    if (this.selectedProyecto !== 'Todos los proyectos') {
      const proyecto = this.proyectos.find(p => p.nombre === this.selectedProyecto);
      if (proyecto) filtros.proyecto = proyecto.id;
    }

    this.avanceObraService.getAvances(filtros).subscribe({
      next: (response) => {
        this.avances = response.results;
        this.cargando = false;
      },
      error: () => {
        this.error = 'No se pudieron cargar los avances';
        this.cargando = false;
      },
    });
  }

  get proyectosDisponibles(): string[] {
    return [
      'Todos los proyectos',
      ...this.proyectos.map(p => p.nombre),
    ];
  }

  get avancesFiltrados(): AvanceObraModel[] {
    return this.avances;
  }

  get avancePromedio(): number {
    if (this.avances.length === 0) return 0;
    const total = this.avances.reduce((sum, a) => sum + a.porcentaje, 0);
    return Math.round(total / this.avances.length);
  }

  get tareasCompletas(): number {
    return this.avances.filter(a => a.porcentaje >= 100).length;
  }

  get tareasPendientes(): number {
    return this.avances.filter(a => a.porcentaje < 100).length;
  }

  get estadisticas() {
    return [
      { icon: 'folder', titulo: 'Proyectos en progreso', valor: this.proyectos.length, detalle: 'proyectos', color: 'amber' },
      { icon: 'trending_up', titulo: 'Avance promedio', valor: `${this.avancePromedio}%`, detalle: '+5% este mes', success: true, color: 'emerald' },
      { icon: 'check_circle', titulo: 'Tareas completadas', valor: this.tareasCompletas, detalle: 'tareas', color: 'blue' },
      { icon: 'schedule', titulo: 'Tareas pendientes', valor: this.tareasPendientes, detalle: 'tareas', warning: true, color: 'orange' },
    ];
  }

  seleccionarProyecto(value: string) {
    this.selectedProyecto = value;
    this.cargarAvances();
  }

  abrirNuevoAvance() {
    this.modoEdicion = false;
    this.avanceSeleccionado = null;
    this.nuevoAvance = {
      proyecto: this.proyectos[0]?.id ?? 0,
      fecha: new Date().toISOString().slice(0, 10),
      actividad: '',
      porcentaje: 0,
      responsable: '',
    };
    this.mostrarModal = true;
  }

  cerrarModal() {
    this.mostrarModal = false;
  }

  guardarAvance() {
    if (!this.nuevoAvance.actividad || !this.nuevoAvance.responsable || !this.nuevoAvance.proyecto) {
      this.error = 'Completa todos los campos obligatorios';
      return;
    }

    this.mensaje = '';
    this.error = '';

    const request = this.modoEdicion && this.avanceSeleccionado
      ? this.avanceObraService.editarAvance(this.avanceSeleccionado.id, this.nuevoAvance)
      : this.avanceObraService.crearAvance(this.nuevoAvance);

    request.subscribe({
      next: () => {
        this.mensaje = this.modoEdicion ? 'Avance actualizado correctamente' : 'Avance creado correctamente';
        this.cerrarModal();
        this.cargarAvances();
      },
      error: (err) => {
        this.error = AuthService.extraerMensajeError(err);
      },
    });
  }

  editarAvance(avance: AvanceObraModel) {
    this.modoEdicion = true;
    this.avanceSeleccionado = { ...avance };
    this.nuevoAvance = {
      proyecto: avance.proyecto,
      fecha: avance.fecha,
      actividad: avance.actividad,
      porcentaje: avance.porcentaje,
      responsable: avance.responsable,
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
    this.avanceObraService.eliminarAvance(this.idEliminar).subscribe({
      next: () => {
        this.mensaje = 'Avance eliminado correctamente';
        this.cancelarEliminar();
        this.cargarAvances();
      },
      error: (err) => {
        this.error = AuthService.extraerMensajeError(err);
        this.cancelarEliminar();
      },
    });
  }
}
