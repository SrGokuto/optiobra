import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../components/sidebar/sidebar';
import { TareaService } from '../../../Services/tarea.service';
import { UsuarioService } from '../../../Services/usuario.service';
import { ProyectoService } from '../../../Services/proyecto.service';
import { Tarea, TareaPayload, ESTADOS_TAREA, PRIORIDADES_TAREA } from '../../../Models/tarea';
import { Usuario } from '../../../Models/usuario-sistema';
import { Proyecto } from '../../../Models/proyecto';
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
  trabajadores: Usuario[] = [];
  proyectos: Proyecto[] = [];
  cargando = false;
  error = '';
  mensaje = '';

  textoBusqueda = '';
  trabajadorSeleccionado = '';
  estadoSeleccionado = '';
  proyectoSeleccionado = '';
  mostrarNuevaModal = false;
  mostrarModal = false;
  guardando = false;

  esObrero = false;

  nueva: TareaPayload = {
    titulo: '',
    descripcion: '',
    proyecto: 0,
    obrero: 0,
    estado: 'pendiente',
    prioridad: 'media',
    fecha_limite: null,
  };

  paginaActual = 1;
  porPagina = 5;

  readonly estados = ESTADOS_TAREA;
  readonly prioridades = PRIORIDADES_TAREA;

  constructor(
    private tareaService: TareaService,
    private usuarioService: UsuarioService,
    private proyectoService: ProyectoService,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.esObrero = this.authService.esRol('obrero');
    if (!this.esObrero) {
      this.cargarTrabajadores();
      this.cargarProyectos();
    }
    this.cargarTareas();
  }

  toggleMenu() {
    this.menuAbierto = !this.menuAbierto;
  }

  cargarTrabajadores(): void {
    this.usuarioService.getUsuarios({ rol: 'obrero' }).subscribe({
      next: (response) => {
        this.trabajadores = response.results;
      },
      error: () => {},
    });
  }

  cargarProyectos(): void {
    this.proyectoService.getProyectos().subscribe({
      next: (response) => {
        this.proyectos = response.results;
      },
      error: () => {},
    });
  }

  cargarTareas(): void {
    this.cargando = true;
    this.error = '';

    const filtros: { obrero?: number; estado?: string; proyecto?: number } = {};
    if (this.trabajadorSeleccionado) {
      filtros.obrero = Number(this.trabajadorSeleccionado);
    }
    if (this.estadoSeleccionado) {
      filtros.estado = this.estadoSeleccionado;
    }
    if (this.proyectoSeleccionado) {
      filtros.proyecto = Number(this.proyectoSeleccionado);
    }

    this.tareaService.getTodasLasTareas(filtros).subscribe({
      next: (tareas) => {
        this.tareas = tareas;
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
        t.obrero_nombre.toLowerCase().includes(this.textoBusqueda.toLowerCase()) ||
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

  seleccionarProyecto(value: string) {
    this.proyectoSeleccionado = value;
    this.cargarTareas();
  }

  /* MODAL NUEVA TAREA */

  abrirNuevaTarea() {
    this.nueva = {
      titulo: '',
      descripcion: '',
      proyecto: 0,
      obrero: 0,
      estado: 'pendiente',
      prioridad: 'media',
      fecha_limite: null,
    };
    this.error = '';
    this.mensaje = '';
    this.mostrarNuevaModal = true;
  }

  cerrarNuevaTarea() {
    this.mostrarNuevaModal = false;
  }

  guardarTarea() {
    this.error = '';
    this.mensaje = '';

    if (!this.nueva.titulo.trim()) {
      this.error = 'El título es obligatorio';
      return;
    }
    if (!this.nueva.proyecto) {
      this.error = 'Selecciona un proyecto';
      return;
    }
    if (!this.nueva.obrero) {
      this.error = 'Selecciona un obrero';
      return;
    }

    this.guardando = true;

    const payload: TareaPayload = {
      titulo: this.nueva.titulo.trim(),
      descripcion: this.nueva.descripcion || '',
      proyecto: Number(this.nueva.proyecto),
      obrero: Number(this.nueva.obrero),
      estado: this.nueva.estado,
      prioridad: this.nueva.prioridad,
      fecha_limite: this.nueva.fecha_limite || null,
    };

    this.tareaService.crearTarea(payload).subscribe({
      next: () => {
        this.guardando = false;
        this.mensaje = 'Tarea creada correctamente';
        this.mostrarNuevaModal = false;
        this.cargarTareas();
      },
      error: (err) => {
        this.guardando = false;
        this.error = AuthService.extraerMensajeError(err);
      },
    });
  }

  /* MODAL DETALLE */

  tareaSeleccionada: Tarea | null = null;
  mostrarConfirmarCompletar = false;
  tareaCompletar: Tarea | null = null;

  verDetalle(tarea: Tarea) {
    this.tareaSeleccionada = tarea;
    this.mostrarModal = true;
  }

  cerrarModal() {
    this.mostrarModal = false;
    this.tareaSeleccionada = null;
  }

  marcarCompletada(tarea: Tarea) {
    this.tareaCompletar = tarea;
    this.mostrarConfirmarCompletar = true;
  }

  cancelarCompletar() {
    this.mostrarConfirmarCompletar = false;
    this.tareaCompletar = null;
  }

  confirmarCompletar() {
    if (!this.tareaCompletar) return;

    const tarea = this.tareaCompletar;
    this.cancelarCompletar();

    this.tareaService.completarTarea(tarea.id).subscribe({
      next: () => {
        this.mensaje = 'Tarea marcada como completada';
        this.cargarTareas();
      },
      error: (err) => {
        this.error = AuthService.extraerMensajeError(err);
      },
    });
  }

  puedeCompletar(tarea: Tarea): boolean {
    return tarea.estado !== 'completada' && tarea.estado !== 'cancelada';
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
