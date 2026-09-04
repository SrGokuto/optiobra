import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../Services/auth.service';
import { UsuarioAuth } from '../../../Models/usuario';
import { SidebarComponent } from '../../components/sidebar/sidebar';
import { DashboardService } from '../../../Services/dashboard.service';
import { DashboardEstadisticas } from '../../../Models/dashboard';
import { Alerta } from '../../../Models/alerta';
import { AlertaService } from '../../../Services/alerta.service';

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
  alertas: Alerta[] = [];

  constructor(
    private authService: AuthService,
    private dashboardService: DashboardService,
    private alertaService: AlertaService,
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
        if (data.rol === 'admin') {
          this.cargarAlertas();
        }
      },
      error: () => {
        this.error = 'No se pudieron cargar las estadísticas';
        this.cargando = false;
      },
    });
  }

  get alertasPendientes(): Alerta[] {
    return this.alertas.filter((alerta) => !alerta.leida);
  }

  cargarAlertas(): void {
    this.alertaService.listar().subscribe({
      next: (alertas) => {
        this.alertas = alertas;
      },
      error: () => {
        this.alertas = [];
      },
    });
  }

  marcarAlertaLeida(alerta: Alerta): void {
    this.alertaService.marcarLeida(alerta.id).subscribe({
      next: (actualizada) => {
        alerta.leida = actualizada.leida;
      },
      error: () => {
        this.error = 'No se pudo marcar la alerta como leída';
      },
    });
  }

  nombreUsuario(): string {
    return this.usuario?.nombre_completo || this.usuario?.username || 'Usuario';
  }
}
