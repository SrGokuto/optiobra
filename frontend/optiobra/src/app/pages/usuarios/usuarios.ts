import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../components/sidebar/sidebar';
import { UsuarioService } from '../../../Services/usuario.service';
import { Usuario } from '../../../Models/usuario-sistema';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  templateUrl: './usuarios.html',
  styleUrl: './usuarios.scss'
})
export class Usuarios implements OnInit {

  menuAbierto = true;
  usuarios: Usuario[] = [];
  cargando = false;
  error = '';

  filtroBusqueda = '';
  filtroRol = '';

  modalAbierto = false;
  editando = false;
  guardando = false;
  errorModal = '';
  usuarioId: number | null = null;

  formulario = {
    nombre_completo: '',
    username: '',
    email: '',
    rol: 'usuario',
    password: '',
    dni: '',
    telefono: '',
    departamento: '',
    cargo: '',
    direccion: ''
  };

  roles = [
    'Todos los roles',
    'usuario',
    'obrero',
    'arquitecto',
    'maestro_obra',
    'supervisor',
    'ingeniero',
    'admin'
  ];

  constructor(private usuarioService: UsuarioService) {}

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  toggleMenu() {
    this.menuAbierto = !this.menuAbierto;
  }

  cargarUsuarios(): void {
    this.cargando = true;
    this.error = '';

    const filtros: { search?: string; rol?: string } = {};

    if (this.filtroBusqueda) {
      filtros.search = this.filtroBusqueda;
    }
    if (this.filtroRol && this.filtroRol !== 'Todos los roles') {
      filtros.rol = this.filtroRol;
    }

    this.usuarioService.getUsuarios(filtros).subscribe({
      next: (respuesta) => {
        this.usuarios = respuesta.results;
        this.cargando = false;
      },
      error: () => {
        this.error = 'No se pudieron cargar los usuarios';
        this.cargando = false;
      }
    });
  }

  onFiltroChange(): void {
    this.cargarUsuarios();
  }

  abrirModalNuevo(): void {
    this.editando = false;
    this.usuarioId = null;
    this.errorModal = '';
    this.formulario = {
      nombre_completo: '',
      username: '',
      email: '',
      rol: 'usuario',
      password: '',
      dni: '',
      telefono: '',
      departamento: '',
      cargo: '',
      direccion: ''
    };
    this.modalAbierto = true;
  }

  abrirModalEditar(usuario: Usuario): void {
    this.editando = true;
    this.usuarioId = usuario.id;
    this.errorModal = '';
    this.formulario = {
      nombre_completo: usuario.nombre_completo || '',
      username: usuario.username || '',
      email: usuario.email || '',
      rol: usuario.rol || 'usuario',
      password: '',
      dni: usuario.perfil?.dni || '',
      telefono: usuario.perfil?.telefono || '',
      departamento: usuario.perfil?.departamento || '',
      cargo: usuario.perfil?.cargo || '',
      direccion: usuario.perfil?.direccion || ''
    };
    this.modalAbierto = true;
  }

  cerrarModal(): void {
    if (this.guardando) {
      return;
    }
    this.modalAbierto = false;
  }

  guardarUsuario(): void {
    if (!this.formulario.nombre_completo.trim()) {
      this.errorModal = 'El nombre completo es obligatorio';
      return;
    }
    if (!this.formulario.username.trim()) {
      this.errorModal = 'El nombre de usuario es obligatorio';
      return;
    }
    if (!this.formulario.email.trim()) {
      this.errorModal = 'El correo electrónico es obligatorio';
      return;
    }

    this.guardando = true;
    this.errorModal = '';

    const payload = {
      nombre_completo: this.formulario.nombre_completo,
      username: this.formulario.username,
      email: this.formulario.email,
      rol: this.formulario.rol,
      dni: this.formulario.dni,
      telefono: this.formulario.telefono,
      departamento: this.formulario.departamento,
      cargo: this.formulario.cargo,
      direccion: this.formulario.direccion
    };

    const accion = this.editando && this.usuarioId !== null
      ? this.usuarioService.editarUsuario(this.usuarioId, payload)
      : this.usuarioService.crearUsuario({ ...payload, password: this.formulario.password || undefined });

    accion.subscribe({
      next: () => {
        this.guardando = false;
        this.modalAbierto = false;
        this.cargarUsuarios();
      },
      error: (err) => {
        this.guardando = false;
        this.errorModal = this.extraerMensajeError(err) || 'No se pudo guardar el usuario';
      }
    });
  }

  private extraerMensajeError(err: unknown): string {
    const body = (err as { error?: Record<string, unknown> })?.error;
    if (!body) {
      return '';
    }
    if (typeof body['mensaje'] === 'string') {
      return body['mensaje'];
    }
    if (typeof body['error'] === 'string') {
      return body['error'];
    }
    const claves = ['email', 'username', 'password', 'nombre_completo'];
    for (const clave of claves) {
      const valor = body[clave];
      if (Array.isArray(valor) && valor.length) {
        return `${clave}: ${valor[0]}`;
      }
      if (typeof valor === 'string') {
        return `${clave}: ${valor}`;
      }
    }
    return '';
  }

  eliminarUsuario(usuario: Usuario): void {
    const confirmar = confirm(
      '¿Desea eliminar el usuario ' + usuario.nombre_completo + '?'
    );

    if (confirmar) {
      this.usuarioService.eliminarUsuario(usuario.id).subscribe({
        next: () => {
          this.cargarUsuarios();
        },
        error: () => {
          alert('Error al eliminar el usuario');
        }
      });
    }
  }

  formatearRol(rol: string): string {
    const mapaRoles: Record<string, string> = {
      'usuario': 'Usuario',
      'obrero': 'Obrero',
      'arquitecto': 'Arquitecto',
      'maestro_obra': 'Maestro de obra',
      'supervisor': 'Supervisor',
      'ingeniero': 'Ingeniero',
      'admin': 'Administrador'
    };
    return mapaRoles[rol] || rol;
  }

  formatearEstado(activo: boolean): string {
    return activo ? 'Activo' : 'Inactivo';
  }
}
