import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../Services/auth.service';
import { UsuarioAuth } from '../../../Models/usuario';
import { SidebarComponent } from '../../components/sidebar/sidebar';
import { DashboardService } from '../../../Services/dashboard.service';
import { DashboardEstadisticas } from '../../../Models/dashboard';

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

  constructor(
    private authService: AuthService,
    private dashboardService: DashboardService,
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

  get esBasico(): boolean {
    return !!this.estadisticas?.dashboard_basico;
  }

  get esObrero(): boolean {
    return this.estadisticas?.rol === 'obrero';
  }

  get esGestion(): boolean {
    return !this.esBasico && !this.esObrero;
  }

  toggleMenu(): void {
    this.menuAbierto = !this.menuAbierto;
  }

  cargarEstadisticas(): void {
    this.cargando = true;
    this.error = '';

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
  }

  nombreUsuario(): string {
    return this.usuario?.nombre_completo || this.usuario?.username || 'Usuario';
  }
}
