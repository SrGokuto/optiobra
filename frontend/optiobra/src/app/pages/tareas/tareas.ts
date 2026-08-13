import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../components/sidebar/sidebar';
import { TareaService } from '../../../Services/tarea.service';
import { TrabajadorService } from '../../../Services/trabajador.service';
import { Tarea, ESTADOS_TAREA, PRIORIDADES_TAREA } from '../../../Models/tarea';
import { Trabajador } from '../../../Models/trabajador';
import { AuthService } from '../../../Services/auth.service';

@Component({
  selector: 'app-tareas',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  templateUrl: './tareas.html',
  styleUrls: ['./tareas.scss']
})
export class Tareas implements OnInit {

  menuAbierto = true;
  tareas: Tarea[] = [];
  tareasFiltradas: Tarea[] = [];
  trabajadores: Trabajador[] = [];
  cargando = false;
  error = '';
  mensaje = '';

  textoBusqueda = '';
  trabajadorSeleccionado = '';
  estadoSeleccionado = '';
  mostrarModal = false;

  paginaActual = 1;
  porPagina = 5;

  readonly estados = ESTADOS_TAREA;
  readonly prioridades = PRIORIDADES_TAREA;

  constructor(
    private tareaService: TareaService,
    private trabajadorService: TrabajadorService,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.cargarTrabajadores();
    this.cargarTareas();
  }

  toggleMenu() {
    this.menuAbierto = !this.menuAbierto;
  }

  cargarTrabajadores(): void {
    this.trabajadorService.getTrabajadores({ estado: 'Activo' }).subscribe({
      next: (response) => {
        this.trabajadores = response.results;
      },
      error: () => {},
    });
  }

  cargarTareas(): void {
    this.cargando = true;
    this.error = '';

    const filtros: { trabajador?: number; estado?: string } = {};
    if (this.trabajadorSeleccionado) {
      filtros.trabajador = Number(this.trabajadorSeleccionado);
    }
    if (this.estadoSeleccionado) {
      filtros.estado = this.estadoSeleccionado;
    }

    this.tareaService.getTareas(filtros).subscribe({
      next: (response) => {
        this.tareas = response.results;
        this.tareasFiltradas = [...this.tareas];
        this.cargando = false;
        this.filtrarPorBusqueda();
      },
      error: () => {
        this.error = 'No se pudieron cargar las tareas';
        this.cargando = false;
      },
    });
  }

  /* PAGINACION */

  get totalPaginas(): number {
    return Math.ceil(this.tareasFiltradas.length / this.porPagina);
  }

  get paginas(): number[] {
    return Array.from({ length: this.totalPaginas }, (_, i) => i + 1);
  }

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

  get tareasPaginadas(): Tarea[] {
    const inicio = (this.paginaActual - 1) * this.porPagina;
    return this.tareasFiltradas.slice(inicio, inicio + this.porPagina);
  }

  cambiarPagina(pagina: number) {
    const clamped = Math.max(1, Math.min(pagina, Math.max(1, this.totalPaginas)));
    this.paginaActual = clamped;
  }

  /* BUSCADOR */

  filtrarPorBusqueda() {
    this.paginaActual = 1;
    this.tareasFiltradas = this.tareas.filter(t => {
      const coincideTexto = this.textoBusqueda === '' ||
        t.titulo.toLowerCase().includes(this.textoBusqueda.toLowerCase()) ||
        t.trabajador_nombre.toLowerCase().includes(this.textoBusqueda.toLowerCase()) ||
        t.proyecto_nombre.toLowerCase().includes(this.textoBusqueda.toLowerCase());
      return coincideTexto;
    });
  }

  seleccionarTrabajador(value: string) {
    this.trabajadorSeleccionado = value;
    this.cargarTareas();
  }

  seleccionarEstado(value: string) {
    this.estadoSeleccionado = value;
    this.cargarTareas();
  }

  /* MODAL DETALLE */

  tareaSeleccionada: Tarea | null = null;

  verDetalle(tarea: Tarea) {
    this.tareaSeleccionada = tarea;
    this.mostrarModal = true;
  }

  cerrarModal() {
    this.mostrarModal = false;
    this.tareaSeleccionada = null;
  }

  /* HELPERS DE ESTADO / PRIORIDAD */

  claseEstado(estado: string): string {
    return estado.replace('_', '-');
  }

  clasePrioridad(prioridad: string): string {
    return prioridad;
  }

  fechaFormateada(fecha?: string): string {
    if (!fecha) return 'Sin fecha';
    const d = new Date(fecha);
    return d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  get totalTareas(): number {
    return this.tareasFiltradas.length;
  }

  get tareasPendientes(): number {
    return this.tareasFiltradas.filter(t => t.estado === 'pendiente').length;
  }

  get tareasEnProgreso(): number {
    return this.tareasFiltradas.filter(t => t.estado === 'en_progreso').length;
  }

  get tareasCompletadas(): number {
    return this.tareasFiltradas.filter(t => t.estado === 'completada').length;
  }
}
