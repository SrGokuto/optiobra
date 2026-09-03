import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../components/sidebar/sidebar';
import { UsuarioService } from '../../../Services/usuario.service';
import { Usuario, UsuarioPayload } from '../../../Models/usuario-sistema';
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
  trabajadores: Usuario[] = [];
  trabajadoresFiltrados: Usuario[] = [];
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
    'obrero', 'arquitecto', 'maestro_obra', 'supervisor', 'ingeniero',
  ];

  nuevo: UsuarioPayload = { username: '', email: '', nombre_completo: '', dni: '', telefono: '', password: '', rol: 'obrero' };
  trabajadorEditar: UsuarioPayload = { username: '', email: '', nombre_completo: '', dni: '', telefono: '', rol: 'obrero' };

  paginaActual = 1;
  porPagina = 5;

  constructor(
    private usuarioService: UsuarioService,
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
    this.usuarioService.getUsuarios({ rol: this.rolSeleccionado || undefined }).subscribe({
      next: (response) => {
        this.trabajadores = response.results;
        this.trabajadoresFiltrados = [...this.trabajadores];
        this.cargando = false;
      },
      error: () => {
        this.error = 'No se pudieron cargar los obreros';
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

  get trabajadoresPaginados(): Usuario[] {
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
      const coincideNombre = (t.nombre_completo || t.username).toLowerCase().includes(this.textoBusqueda.toLowerCase());
      const coincideRol = this.rolSeleccionado === '' || t.rol === this.rolSeleccionado;
      return coincideNombre && coincideRol;
    });
  }

  /* MODAL NUEVO */

  nuevoTrabajador() {
    this.nuevo = { username: '', email: '', nombre_completo: '', dni: '', telefono: '', password: '', rol: 'obrero' };
    this.mostrarModal = true;
  }

  cerrarModal() {
    this.mostrarModal = false;
  }

  guardarTrabajador() {
    if (!this.nuevo.nombre_completo || !this.nuevo.dni || !this.nuevo.email) {
      this.error = 'Completa nombre, DNI y email';
      return;
    }
    if (!this.nuevo.username) {
      this.nuevo.username = this.nuevo.email.split('@')[0];
    }
    this.nuevo.rol = this.nuevo.rol || 'obrero';

    this.mensaje = '';
    this.error = '';

    this.usuarioService.crearUsuario(this.nuevo).subscribe({
      next: () => {
        this.mensaje = 'Obrero creado correctamente';
        this.cerrarModal();
        this.cargarTrabajadores();
      },
      error: (err) => {
        this.error = AuthService.extraerMensajeError(err);
      },
    });
  }

  /* EDITAR */

  editarTrabajador(trabajador: Usuario) {
    this.trabajadorEditar = {
      username: trabajador.username,
      email: trabajador.email,
      nombre_completo: trabajador.nombre_completo,
      dni: trabajador.perfil?.dni || '',
      telefono: trabajador.perfil?.telefono || '',
      rol: trabajador.rol,
    };
    this.idEliminar = trabajador.id;
    this.mostrarEditar = true;
  }

  cerrarEditar() {
    this.mostrarEditar = false;
  }

  actualizarTrabajador() {
    if (!this.trabajadorEditar.nombre_completo || !this.trabajadorEditar.dni) {
      this.error = 'Completa todos los campos obligatorios';
      return;
    }

    this.mensaje = '';
    this.error = '';

    this.usuarioService.editarUsuario(this.idEliminar, this.trabajadorEditar).subscribe({
      next: () => {
        this.mensaje = 'Obrero actualizado correctamente';
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

    this.usuarioService.eliminarUsuario(this.idEliminar).subscribe({
      next: () => {
        this.mensaje = 'Obrero eliminado correctamente';
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
