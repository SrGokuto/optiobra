import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../components/sidebar/sidebar';
import { TrabajadorService } from '../../../Services/trabajador.service';
import { Trabajador, TrabajadorPayload } from '../../../Models/trabajador';
import { AuthService } from '../../../Services/auth.service';

@Component({
  selector: 'app-trabajadores',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  templateUrl: './trabajadores.html',
  styleUrls: ['./trabajadores.scss']
})
export class Trabajadores implements OnInit {

  menuAbierto = true;
  trabajadores: Trabajador[] = [];
  trabajadoresFiltrados: Trabajador[] = [];
  cargando = false;
  error = '';
  mensaje = '';

  textoBusqueda = '';
  rolSeleccionado = '';
  mostrarModal = false;
  mostrarEditar = false;
  mostrarEliminar = false;
  idEliminar = 0;

  roles: string[] = [
    'Ingeniero', 'Arquitecto', 'Maestro de obra', 'Supervisor',
    'Albañil', 'Electricista', 'Plomero', 'Carpintero',
  ];

  nuevo: TrabajadorPayload = { nombre: '', dni: '', rol: '', telefono: '', estado: 'Activo' };
  trabajadorEditar: TrabajadorPayload = { nombre: '', dni: '', rol: '', telefono: '', estado: 'Activo' };

  paginaActual = 1;
  porPagina = 5;

  constructor(
    private trabajadorService: TrabajadorService,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.cargarTrabajadores();
  }

  toggleMenu() {
    this.menuAbierto = !this.menuAbierto;
  }

  cargarTrabajadores(): void {
    this.cargando = true;
    this.error = '';
    this.trabajadorService.getTrabajadores().subscribe({
      next: (response) => {
        this.trabajadores = response.results;
        this.trabajadoresFiltrados = [...this.trabajadores];
        this.cargando = false;
      },
      error: () => {
        this.error = 'No se pudieron cargar los trabajadores';
        this.cargando = false;
      },
    });
  }

  /* PAGINACIÓN */

  get totalPaginas(): number {
    return Math.ceil(this.trabajadoresFiltrados.length / this.porPagina);
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

  get trabajadoresPaginados(): Trabajador[] {
    const inicio = (this.paginaActual - 1) * this.porPagina;
    return this.trabajadoresFiltrados.slice(inicio, inicio + this.porPagina);
  }

  cambiarPagina(pagina: number) {
    const clamped = Math.max(1, Math.min(pagina, Math.max(1, this.totalPaginas)));
    this.paginaActual = clamped;
  }

  /* BUSCADOR */

  filtrarTrabajadores() {
    this.paginaActual = 1;
    this.trabajadoresFiltrados = this.trabajadores.filter(t => {
      const coincideNombre = t.nombre.toLowerCase().includes(this.textoBusqueda.toLowerCase());
      const coincideRol = this.rolSeleccionado === '' || t.rol === this.rolSeleccionado;
      return coincideNombre && coincideRol;
    });
  }

  /* MODAL NUEVO */

  nuevoTrabajador() {
    this.nuevo = { nombre: '', dni: '', rol: '', telefono: '', estado: 'Activo' };
    this.mostrarModal = true;
  }

  cerrarModal() {
    this.mostrarModal = false;
  }

  guardarTrabajador() {
    if (!this.nuevo.nombre || !this.nuevo.dni || !this.nuevo.rol) {
      this.error = 'Completa nombre, DNI y rol';
      return;
    }

    this.mensaje = '';
    this.error = '';

    this.trabajadorService.crearTrabajador(this.nuevo).subscribe({
      next: () => {
        this.mensaje = 'Trabajador creado correctamente';
        this.cerrarModal();
        this.cargarTrabajadores();
      },
      error: (err) => {
        this.error = AuthService.extraerMensajeError(err);
      },
    });
  }

  /* EDITAR */

  editarTrabajador(trabajador: Trabajador) {
    this.trabajadorEditar = {
      nombre: trabajador.nombre,
      dni: trabajador.dni,
      rol: trabajador.rol,
      telefono: trabajador.telefono,
      estado: trabajador.estado,
    };
    this.mostrarEditar = true;
  }

  cerrarEditar() {
    this.mostrarEditar = false;
  }

  actualizarTrabajador() {
    if (!this.trabajadorEditar.nombre || !this.trabajadorEditar.dni || !this.trabajadorEditar.rol) {
      this.error = 'Completa todos los campos obligatorios';
      return;
    }

    this.mensaje = '';
    this.error = '';

    const original = this.trabajadores.find(t => t.dni === this.trabajadorEditar.dni);
    if (!original) return;

    this.trabajadorService.editarTrabajador(original.id, this.trabajadorEditar).subscribe({
      next: () => {
        this.mensaje = 'Trabajador actualizado correctamente';
        this.cerrarEditar();
        this.cargarTrabajadores();
      },
      error: (err) => {
        this.error = AuthService.extraerMensajeError(err);
      },
    });
  }

  /* ELIMINAR */

  eliminarTrabajador(id: number) {
    this.idEliminar = id;
    this.mostrarEliminar = true;
  }

  cancelarEliminar() {
    this.mostrarEliminar = false;
    this.idEliminar = 0;
  }

  confirmarEliminar() {
    this.mensaje = '';
    this.error = '';

    this.trabajadorService.eliminarTrabajador(this.idEliminar).subscribe({
      next: () => {
        this.mensaje = 'Trabajador eliminado correctamente';
        this.cancelarEliminar();
        this.cargarTrabajadores();
      },
      error: (err) => {
        this.error = AuthService.extraerMensajeError(err);
        this.cancelarEliminar();
      },
    });
  }
}
