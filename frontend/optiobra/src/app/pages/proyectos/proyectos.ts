import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../components/sidebar/sidebar';
import { ProyectoService } from '../../../Services/proyecto.service';
import { Proyecto, ProyectoPayload } from '../../../Models/proyecto';
import { AuthService } from '../../../Services/auth.service';

@Component({
  selector: 'app-proyectos',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  templateUrl: './proyectos.html',
  styleUrl: './proyectos.scss'
})
export class Proyectos implements OnInit {

  menuAbierto = true;
  proyectos: Proyecto[] = [];
  cargando = false;
  error = '';
  mensaje = '';

  mostrarFormulario = false;
  proyectoEnEdicion: Proyecto | null = null;

  formulario: ProyectoPayload = this.crearFormularioVacio();

  readonly estados: Proyecto['estado'][] = ['Pendiente', 'En progreso', 'Completado'];

  constructor(
    private proyectoService: ProyectoService,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.cargarProyectos();
  }

  toggleMenu() {
    this.menuAbierto = !this.menuAbierto;
  }

  cargarProyectos(): void {
    this.cargando = true;
    this.error = '';
    this.proyectoService.getProyectos().subscribe({
      next: (response) => {
        this.proyectos = response.results;
        this.cargando = false;
      },
      error: () => {
        this.error = 'No se pudieron cargar los proyectos';
        this.cargando = false;
      },
    });
  }

  crearProyecto(): void {
    this.proyectoEnEdicion = null;
    this.formulario = this.crearFormularioVacio();
    this.mostrarFormulario = true;
    this.mensaje = '';
    this.error = '';
  }

  editarProyecto(proyecto: Proyecto): void {
    this.proyectoEnEdicion = proyecto;
    this.formulario = {
      nombre: proyecto.nombre,
      ubicacion: proyecto.ubicacion,
      fecha_inicio: proyecto.fecha_inicio,
      fecha_fin: proyecto.fecha_fin,
      estado: proyecto.estado,
      porcentaje_avance: proyecto.porcentaje_avance,
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
    if (!this.formulario.nombre || !this.formulario.ubicacion || !this.formulario.fecha_inicio || !this.formulario.fecha_fin) {
      this.error = 'Completa todos los campos obligatorios';
      return;
    }

    this.mensaje = '';
    this.error = '';

    const request = this.proyectoEnEdicion
      ? this.proyectoService.editarProyecto(this.proyectoEnEdicion.id, this.formulario)
      : this.proyectoService.crearProyecto(this.formulario);

    request.subscribe({
      next: () => {
        this.mensaje = this.proyectoEnEdicion
          ? 'Proyecto actualizado correctamente'
          : 'Proyecto creado correctamente';
        this.cerrarFormulario();
        this.cargarProyectos();
      },
      error: (err) => {
        this.error = AuthService.extraerMensajeError(err);
      },
    });
  }

  eliminarProyecto(proyecto: Proyecto): void {
    const confirmar = confirm(`¿Eliminar el proyecto "${proyecto.nombre}"?`);
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

  cerrarSesion(): void {
    this.authService.logout().subscribe({
      next: () => window.location.href = '/login',
      error: () => {
        this.authService.clearSession();
        window.location.href = '/login';
      },
    });
  }

  private crearFormularioVacio(): ProyectoPayload {
    return {
      nombre: '',
      ubicacion: '',
      fecha_inicio: new Date().toISOString().slice(0, 10),
      fecha_fin: new Date().toISOString().slice(0, 10),
      estado: 'Pendiente',
      porcentaje_avance: 0,
    };
  }
}
