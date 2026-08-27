import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  Proyecto,
  ProyectoPayload,
  ESTADOS_PROYECTO,
  ESTADOS_PROYECTO_ETIQUETAS,
} from '../../../Models/proyecto';
import { UsuarioAuth } from '../../../Models/usuario';
import { AuthService } from '../../../Services/auth.service';
import { ProyectoService } from '../../../Services/servicios';
import { SidebarComponent } from '../../components/sidebar/sidebar';

@Component({
  selector: 'app-proyectos',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
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

  readonly estadosVisuales: { valor: Proyecto['estado']; etiqueta: string }[] = [
    { valor: 'pendiente', etiqueta: ESTADOS_PROYECTO_ETIQUETAS['pendiente'] },
    { valor: 'en_proceso', etiqueta: ESTADOS_PROYECTO_ETIQUETAS['en_proceso'] },
    { valor: 'finalizado', etiqueta: ESTADOS_PROYECTO_ETIQUETAS['finalizado'] },
    { valor: 'cancelado', etiqueta: ESTADOS_PROYECTO_ETIQUETAS['cancelado'] },
  ];

  // Estados visibles SOLO en el filtro de la tabla. Se usan los valores
  // reales del backend para que la búsqueda por estado funcione.
  readonly estadosFiltro: Proyecto['estado'][] = [
    'pendiente',
    'en_proceso',
    'finalizado',
    'cancelado',
  ];

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
    this.mensaje = '';
    this.error = '';
  }

  abrirFormularioEdicion(proyecto: Proyecto): void {
    this.proyectoEnEdicion = proyecto;
    this.formulario = {
      nombre: proyecto.nombre,
      descripcion: proyecto.descripcion || null,
      ubicacion: proyecto.ubicacion,
      direccion: proyecto.direccion || null,
      responsable: proyecto.responsable || null,
      estado: proyecto.estado,
      fecha_inicio: proyecto.fecha_inicio || null,
      fecha_fin: proyecto.fecha_fin || null,
      fecha_fin_estimada: proyecto.fecha_fin_estimada || null,
      presupuesto: proyecto.presupuesto ? Number(proyecto.presupuesto) : null,
    };
    this.mostrarFormulario = true;
    this.mensaje = '';
    this.error = '';
  }

  cerrarFormulario(): void {
    this.mostrarFormulario = false;
    this.proyectoEnEdicion = null;
    this.formulario = this.crearFormularioVacio();
  }

  guardarProyecto(): void {
    this.guardando = true;
    this.error = '';

    const payload: ProyectoPayload = {
      ...this.formulario,
      fecha_inicio: this.formulario.fecha_inicio || null,
      fecha_fin: this.formulario.fecha_fin || null,
      fecha_fin_estimada: this.formulario.fecha_fin_estimada || null,
      presupuesto: this.formulario.presupuesto ? Number(this.formulario.presupuesto) : null,
    };

    if (this.proyectoEnEdicion) {
      this.proyectoService.editarProyecto(this.proyectoEnEdicion.id, payload).subscribe({
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
      this.proyectoService.crearProyecto(payload).subscribe({
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

  etiquetaEstado(estado: Proyecto['estado']): string {
    return ESTADOS_PROYECTO_ETIQUETAS[estado] || estado;
  }

  formatearPresupuesto(presupuesto: string | number | null | undefined): string {
    if (!presupuesto) return '-';
    const valor = typeof presupuesto === 'number' ? presupuesto : Number(presupuesto);
    if (Number.isNaN(valor)) return typeof presupuesto === 'string' ? presupuesto : '-';
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(valor);
  }

  private crearFormularioVacio(): ProyectoPayload {
    return {
      nombre: '',
      descripcion: null,
      ubicacion: '',
      direccion: null,
      responsable: null,
      estado: 'pendiente',
      fecha_inicio: null,
      fecha_fin: null,
      fecha_fin_estimada: null,
      presupuesto: null,
    };
  }
}
