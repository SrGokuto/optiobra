import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  Proyecto,
  ProyectoPayload,
  ESTADOS_PROYECTO,
} from '../../../Models/proyecto';
import { UsuarioAuth } from '../../../Models/usuario';
import { AuthService } from '../../../Services/auth.service';
import { ProyectoService } from '../../../Services/servicios';

@Component({
  selector: 'app-proyectos',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './proyectos.html',
  styleUrl: './proyectos.scss',
})
export class Proyectos implements OnInit {
  menuAbierto = true;
  proyectos: Proyecto[] = [];
  usuario: UsuarioAuth | null = null;

  cargando = false;
  guardando = false;
  error = '';
  mensaje = '';

  filtroBusqueda = '';
  filtroEstado = '';
  paginaActual = 1;
  totalRegistros = 0;
  haySiguiente = false;
  hayAnterior = false;

  mostrarFormulario = false;
  proyectoEnEdicion: Proyecto | null = null;

  formulario: ProyectoPayload = this.crearFormularioVacio();

  readonly estados = ESTADOS_PROYECTO;

  constructor(
    private proyectoService: ProyectoService,
    private authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.authService.usuarioActual.subscribe((usuario) => {
      this.usuario = usuario;
    });

    if (!this.usuario) {
      this.authService.cargarUsuarioActual();
    }

    this.cargarProyectos();
  }

  toggleMenu(): void {
    this.menuAbierto = !this.menuAbierto;
  }

  cargarProyectos(): void {
    this.cargando = true;
    this.error = '';

    const filtros: any = {};
    if (this.filtroBusqueda) {
      filtros.search = this.filtroBusqueda;
    }
    if (this.filtroEstado) {
      filtros.estado = this.filtroEstado;
    }
    filtros.page = this.paginaActual;

    this.proyectoService.getProyectos(filtros).subscribe({
      next: (respuesta) => {
        this.proyectos = respuesta.results;
        this.totalRegistros = respuesta.count;
        this.haySiguiente = !!respuesta.next;
        this.hayAnterior = !!respuesta.previous;
        this.cargando = false;
      },
      error: (err) => {
        this.error = AuthService.extraerMensajeError(err);
        this.cargando = false;
      },
    });
  }

  abrirFormularioCrear(): void {
    this.proyectoEnEdicion = null;
    this.formulario = this.crearFormularioVacio();
    this.mostrarFormulario = true;
  }

  abrirFormularioEdicion(proyecto: Proyecto): void {
    this.proyectoEnEdicion = proyecto;
    this.formulario = {
      nombre: proyecto.nombre,
      descripcion: proyecto.descripcion || '',
      direccion: proyecto.direccion || '',
      responsable: proyecto.responsable || '',
      estado: proyecto.estado,
      avance: proyecto.avance,
      fecha_inicio: proyecto.fecha_inicio || '',
      fecha_fin_estimada: proyecto.fecha_fin_estimada || '',
      presupuesto: proyecto.presupuesto || '',
    };
    this.mostrarFormulario = true;
  }

  cerrarFormulario(): void {
    this.mostrarFormulario = false;
    this.proyectoEnEdicion = null;
    this.formulario = this.crearFormularioVacio();
  }

  guardarProyecto(): void {
    this.guardando = true;
    this.error = '';

    if (this.proyectoEnEdicion) {
      this.proyectoService.editarProyecto(this.proyectoEnEdicion.id, this.formulario).subscribe({
        next: () => {
          this.mensaje = 'Proyecto actualizado correctamente';
          this.guardando = false;
          this.cerrarFormulario();
          this.cargarProyectos();
        },
        error: (err) => {
          this.error = AuthService.extraerMensajeError(err);
          this.guardando = false;
        },
      });
    } else {
      this.proyectoService.crearProyecto(this.formulario).subscribe({
        next: () => {
          this.mensaje = 'Proyecto creado correctamente';
          this.guardando = false;
          this.cerrarFormulario();
          this.cargarProyectos();
        },
        error: (err) => {
          this.error = AuthService.extraerMensajeError(err);
          this.guardando = false;
        },
      });
    }
  }

  eliminarProyecto(proyecto: Proyecto): void {
    const confirmar = confirm('¿Desea eliminar el proyecto ' + proyecto.nombre + '?');
    if (!confirmar) return;

    this.proyectoService.eliminarProyecto(proyecto.id).subscribe({
      next: () => {
        this.mensaje = 'Proyecto eliminado correctamente';
        this.cargarProyectos();
      },
      error: (err) => {
        this.error = AuthService.extraerMensajeError(err);
      },
    });
  }

  buscar(): void {
    this.paginaActual = 1;
    this.cargarProyectos();
  }

  paginaAnterior(): void {
    if (this.hayAnterior && this.paginaActual > 1) {
      this.paginaActual--;
      this.cargarProyectos();
    }
  }

  paginaSiguiente(): void {
    if (this.haySiguiente) {
      this.paginaActual++;
      this.cargarProyectos();
    }
  }

  cerrarSesion(): void {
    this.authService.logout().subscribe({
      next: () => this.router.navigate(['/login']),
      error: () => {
        this.authService.clearSession();
        this.router.navigate(['/login']);
      },
    });
  }

  nombreUsuario(): string {
    return this.usuario?.nombre_completo || this.usuario?.username || 'Usuario';
  }

  emailUsuario(): string {
    return this.usuario?.email || '';
  }

  formatearPresupuesto(presupuesto: string | undefined): string {
    if (!presupuesto) return '-';
    const valor = Number(presupuesto);
    if (Number.isNaN(valor)) return presupuesto;
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(valor);
  }

  private crearFormularioVacio(): ProyectoPayload {
    return {
      nombre: '',
      descripcion: '',
      direccion: '',
      responsable: '',
      estado: 'pendiente',
      avance: 0,
      fecha_inicio: '',
      fecha_fin_estimada: '',
      presupuesto: '',
    };
  }
}
