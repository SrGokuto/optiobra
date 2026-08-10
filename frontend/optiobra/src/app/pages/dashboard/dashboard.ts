import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../Services/auth.service';
import { MaterialService, ProyectoService } from '../../../Services/servicios';
import { UsuarioAuth } from '../../../Models/usuario';
import { SidebarComponent } from '../../components/sidebar/sidebar';
import { DashboardService } from '../../../Services/dashboard.service';
import { DashboardEstadisticas } from '../../../Models/dashboard';
import { ReporteService } from '../../../Services/reporte.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, SidebarComponent],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {
  menuAbierto = true;
  usuario: UsuarioAuth | null = null;
  estadisticas: DashboardEstadisticas | null = null;
  cargando = false;
  error = '';

  totalMateriales = 0;
  materialesDisponibles = 0;
  totalProyectos = 0;
  valorInventario = 0;

  constructor(
    private authService: AuthService,
    private materialService: MaterialService,
    private proyectoService: ProyectoService,
    private dashboardService: DashboardService,
    private reporteService: ReporteService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.authService.usuarioActual.subscribe((usuario) => {
      this.usuario = usuario;
    });

    if (!this.usuario) {
      this.authService.cargarUsuarioActual();
    }

    this.cargarEstadisticas();
  }

  toggleMenu(): void {
    this.menuAbierto = !this.menuAbierto;
  }

  cargarEstadisticas(): void {
    this.cargando = true;
    this.error = '';
    this.valorInventario = 0;

    this.dashboardService.getEstadisticas().subscribe({
      next: (data) => {
        this.estadisticas = data;
        this.cargando = false;
      },
      error: () => {
        this.error = 'No se pudieron cargar las estadísticas';
        this.cargando = false;
      },
    });

    this.materialService.getMateriales().subscribe({
      next: (respuesta) => {
        this.totalMateriales = respuesta.count;
      },
      error: () => {},
    });

    this.proyectoService.getProyectos().subscribe({
      next: (respuesta) => {
        this.totalProyectos = respuesta.count;
      },
      error: () => {},
    });

    this.reporteService.getInventario().subscribe({
      next: (data) => {
        this.valorInventario = data.valor_total_inventario;
      },
      error: () => {
        this.error = 'No se pudo cargar el valor del inventario desde la base de datos';
      },
    });
  }

  nombreUsuario(): string {
    return this.usuario?.nombre_completo || this.usuario?.username || 'Usuario';
  }

  emailUsuario(): string {
    return this.usuario?.email || '';
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
}
