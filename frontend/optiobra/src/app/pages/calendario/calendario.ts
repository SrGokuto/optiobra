import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../components/sidebar/sidebar';
import { TareaService } from '../../../Services/tarea.service';
import { UsuarioService } from '../../../Services/usuario.service';
import { ProyectoService } from '../../../Services/proyecto.service';
import { AuthService } from '../../../Services/auth.service';
import { Tarea, TareaPayload, ESTADOS_TAREA, PRIORIDADES_TAREA } from '../../../Models/tarea';
import { Usuario } from '../../../Models/usuario-sistema';
import { Proyecto } from '../../../Models/proyecto';

type VistaCalendario = 'mes' | 'semana' | 'dia';

interface DiaCalendario {
  fecha: Date;
  numero: number;
  esHoy: boolean;
  enPeriodo: boolean;
  tareas: Tarea[];
}

@Component({
  selector: 'app-calendario',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  templateUrl: './calendario.html',
  styleUrls: ['./calendario.scss']
})
export class Calendario implements OnInit {

  menuAbierto = true;
  vista: VistaCalendario = 'mes';
  fechaReferencia = new Date();

  diasSemana = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
  ];

  semanas: DiaCalendario[][] = [];
  diasVista: DiaCalendario[] = [];
  tareasSinFecha: Tarea[] = [];

  tareas: Tarea[] = [];
  tareasFiltradas: Tarea[] = [];
  trabajadores: Usuario[] = [];
  proyectos: Proyecto[] = [];

  trabajadorSeleccionado = '';
  proyectoSeleccionado = '';
  estadoSeleccionado = '';

  cargando = false;
  error = '';
  mensaje = '';

  mostrarNuevaModal = false;
  mostrarModal = false;
  guardando = false;

  esObrero = false;

  tareaArrastrada: Tarea | null = null;
  fechaObjetivo: string | null = null;

  nueva: TareaPayload = {
    titulo: '',
    descripcion: '',
    proyecto: 0,
    obrero: 0,
    estado: 'pendiente',
    prioridad: 'media',
    fecha_limite: null,
  };

  tareaSeleccionada: Tarea | null = null;

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
    this.fechaReferencia = this.inicioPeriodo(this.fechaReferencia, this.vista);
    this.construirVista();
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
    if (this.trabajadorSeleccionado) filtros.obrero = Number(this.trabajadorSeleccionado);
    if (this.estadoSeleccionado) filtros.estado = this.estadoSeleccionado;
    if (this.proyectoSeleccionado) filtros.proyecto = Number(this.proyectoSeleccionado);

    this.tareaService.getTodasLasTareas(filtros).subscribe({
      next: (tareas) => {
        this.tareas = tareas;
        this.aplicarFiltro();
        this.construirVista();
        this.cargando = false;
      },
      error: () => {
        this.error = 'No se pudieron cargar las tareas';
        this.cargando = false;
      },
    });
  }

  aplicarFiltro(): void {
    this.tareasFiltradas = [...this.tareas];
    this.tareasSinFecha = this.tareasFiltradas.filter((t) => !t.fecha_limite);
  }

  seleccionarTrabajador() {
    this.cargarTareas();
  }

  seleccionarProyecto() {
    this.cargarTareas();
  }

  seleccionarEstado() {
    this.cargarTareas();
  }

  cambiarVista(vista: VistaCalendario) {
    this.vista = vista;
    this.fechaReferencia = this.inicioPeriodo(this.fechaReferencia, this.vista);
    this.construirVista();
  }

  cambiarPeriodo(delta: number) {
    const base = new Date(this.fechaReferencia);
    if (this.vista === 'mes') {
      this.fechaReferencia = new Date(base.getFullYear(), base.getMonth() + delta, 1);
    } else if (this.vista === 'semana') {
      this.fechaReferencia = this.sumarDias(base, delta * 7);
    } else {
      this.fechaReferencia = this.sumarDias(base, delta);
    }
    this.construirVista();
  }

  irHoy() {
    this.fechaReferencia = new Date();
    this.fechaReferencia = this.inicioPeriodo(this.fechaReferencia, this.vista);
    this.construirVista();
  }

  private inicioPeriodo(fecha: Date, vista: VistaCalendario): Date {
    if (vista === 'dia') {
      return new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());
    }
    if (vista === 'semana') {
      return this.lunesDe(fecha);
    }
    return new Date(fecha.getFullYear(), fecha.getMonth(), 1);
  }

  private lunesDe(fecha: Date): Date {
    const copia = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());
    const dia = (copia.getDay() + 6) % 7;
    return this.sumarDias(copia, -dia);
  }

  private sumarDias(fecha: Date, dias: number): Date {
    return new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate() + dias);
  }

  construirVista(): void {
    if (this.vista === 'mes') {
      this.construirMes();
    } else if (this.vista === 'semana') {
      this.construirSemana();
    } else {
      this.construirDia();
    }
  }

  private construirMes(): void {
    const anio = this.fechaReferencia.getFullYear();
    const mes = this.fechaReferencia.getMonth();
    const inicio = this.lunesDe(new Date(anio, mes, 1));
    this.semanas = [];
    for (let f = 0; f < 6; f++) {
      const fila: DiaCalendario[] = [];
      for (let c = 0; c < 7; c++) {
        fila.push(this.crearDia(this.sumarDias(inicio, f * 7 + c), mes));
      }
      this.semanas.push(fila);
    }
  }

  private construirSemana(): void {
    const inicio = this.lunesDe(this.fechaReferencia);
    const fila: DiaCalendario[] = [];
    for (let c = 0; c < 7; c++) {
      fila.push(this.crearDia(this.sumarDias(inicio, c)));
    }
    this.semanas = [fila];
  }

  private construirDia(): void {
    const dia = this.crearDia(new Date(this.fechaReferencia));
    this.diasVista = [dia];
  }

  private crearDia(fecha: Date, mesReferencia?: number): DiaCalendario {
    const hoy = new Date();
    const tareas = this.tareasFiltradas
      .filter((t) => t.fecha_limite && this.esMismoDia(this.parseFecha(t.fecha_limite), fecha))
      .sort((a, b) => this.pesoPrioridad(b.prioridad) - this.pesoPrioridad(a.prioridad));
    return {
      fecha,
      numero: fecha.getDate(),
      esHoy: this.esMismoDia(fecha, hoy),
      enPeriodo: mesReferencia === undefined || fecha.getMonth() === mesReferencia,
      tareas,
    };
  }

  private pesoPrioridad(prioridad: Tarea['prioridad']): number {
    return { urgente: 4, alta: 3, media: 2, baja: 1 }[prioridad] ?? 0;
  }

  private parseFecha(fecha?: string): Date | null {
    if (!fecha) return null;
    const [y, m, d] = fecha.slice(0, 10).split('-').map(Number);
    if (!y || !m || !d) return null;
    return new Date(y, m - 1, d);
  }

  private esMismoDia(a?: Date | null, b?: Date | null): boolean {
    if (!a || !b) return false;
    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    );
  }

  private aCadena(fecha: Date): string {
    const y = fecha.getFullYear();
    const m = String(fecha.getMonth() + 1).padStart(2, '0');
    const d = String(fecha.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  get tituloPeriodo(): string {
    const f = this.fechaReferencia;
    if (this.vista === 'mes') {
      return `${this.meses[f.getMonth()]} ${f.getFullYear()}`;
    }
    if (this.vista === 'semana') {
      const lunes = this.lunesDe(f);
      const domingo = this.sumarDias(lunes, 6);
      return `${lunes.getDate()} ${this.meses[lunes.getMonth()].slice(0, 3)} - ${domingo.getDate()} ${this.meses[domingo.getMonth()].slice(0, 3)} ${domingo.getFullYear()}`;
    }
    return `${f.toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}`;
  }

  get tareasEnPeriodo(): Tarea[] {
    if (this.vista === 'dia') {
      return this.diasVista.length ? this.diasVista[0].tareas : [];
    }
    return this.semanas.flat().flatMap((d) => d.tareas);
  }

  get tareasPendientes(): number {
    return this.tareasEnPeriodo.filter((t) => t.estado === 'pendiente').length;
  }

  get tareasEnProgreso(): number {
    return this.tareasEnPeriodo.filter((t) => t.estado === 'en_progreso').length;
  }

  get tareasCompletadas(): number {
    return this.tareasEnPeriodo.filter((t) => t.estado === 'completada').length;
  }

  get totalVisibles(): number {
    return this.tareasFiltradas.length;
  }

  maxChips = 3;

  chipsDe(dia: DiaCalendario): Tarea[] {
    return dia.tareas.slice(0, this.maxChips);
  }

  extrasDe(dia: DiaCalendario): number {
    return dia.tareas.length > this.maxChips ? dia.tareas.length - this.maxChips : 0;
  }

  claseEstado(estado: string): string {
    return estado.replace('_', '-');
  }

  clasePrioridad(prioridad: string): string {
    return prioridad;
  }

  fechaFormateada(fecha?: string | Date): string {
    if (!fecha) return 'Sin fecha';
    const d = fecha instanceof Date ? fecha : this.parseFecha(fecha);
    if (!d) return 'Sin fecha';
    return d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  onDragStart(evento: DragEvent, tarea: Tarea) {
    this.tareaArrastrada = tarea;
    if (evento.dataTransfer) {
      evento.dataTransfer.effectAllowed = 'move';
      evento.dataTransfer.setData('text/plain', String(tarea.id));
    }
  }

  onDragEnd() {
    this.tareaArrastrada = null;
    this.fechaObjetivo = null;
  }

  onDragOver(evento: DragEvent, fecha: Date) {
    evento.preventDefault();
    if (this.tareaArrastrada) {
      evento.dataTransfer!.dropEffect = 'move';
      this.fechaObjetivo = this.aCadena(fecha);
    }
  }

  onDragLeave() {
    this.fechaObjetivo = null;
  }

  onDragOverSinFecha(evento: DragEvent) {
    evento.preventDefault();
    if (this.tareaArrastrada) {
      evento.dataTransfer!.dropEffect = 'move';
      this.fechaObjetivo = 'sin-fecha';
    }
  }

  onDrop(evento: DragEvent, fecha: Date) {
    evento.preventDefault();
    const fechaFija = this.aCadena(fecha);
    this.fechaObjetivo = null;
    if (!this.tareaArrastrada) return;
    const tarea = this.tareaArrastrada;
    this.tareaArrastrada = null;
    if (tarea.fecha_limite && this.esMismoDia(this.parseFecha(tarea.fecha_limite), fecha)) return;
    this.moverTarea(tarea, fechaFija);
  }

  onDropSinFecha(evento: DragEvent) {
    evento.preventDefault();
    this.fechaObjetivo = null;
    if (!this.tareaArrastrada) return;
    const tarea = this.tareaArrastrada;
    this.tareaArrastrada = null;
    if (!tarea.fecha_limite) return;
    this.moverTarea(tarea, null);
  }

  esObjetivo(fecha: Date): boolean {
    return this.fechaObjetivo === this.aCadena(fecha);
  }

  private moverTarea(tarea: Tarea, fechaLimite: string | null) {
    const cambios: Partial<TareaPayload> = { fecha_limite: fechaLimite };
    this.tareaService.actualizarTarea(tarea.id, cambios).subscribe({
      next: () => {
        this.mensaje = `Tarea "${tarea.titulo}" movida ${fechaLimite ? `al ${this.fechaFormateada(fechaLimite)}` : 'a sin fecha'}`;
        this.cargarTareas();
      },
      error: (err) => {
        this.error = AuthService.extraerMensajeError(err);
      },
    });
  }

  abrirNuevaTarea(fecha?: Date) {
    this.nueva = {
      titulo: '',
      descripcion: '',
      proyecto: 0,
      obrero: 0,
      estado: 'pendiente',
      prioridad: 'media',
      fecha_limite: fecha ? this.aCadena(fecha) : null,
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

  verDetalle(tarea: Tarea) {
    this.tareaSeleccionada = tarea;
    this.mostrarModal = true;
  }

  cerrarModal() {
    this.mostrarModal = false;
    this.tareaSeleccionada = null;
  }

  cambiarEstado(estado: Tarea['estado']) {
    const tarea = this.tareaSeleccionada;
    if (!tarea) return;
    this.tareaService.actualizarTarea(tarea.id, { estado }).subscribe({
      next: () => {
        this.tareaSeleccionada = { ...tarea, estado };
        this.mensaje = 'Estado actualizado';
        this.cargarTareas();
      },
      error: (err) => {
        this.error = AuthService.extraerMensajeError(err);
      },
    });
  }
}