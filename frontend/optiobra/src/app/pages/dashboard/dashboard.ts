import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../../components/sidebar/sidebar';
import { DashboardService } from '../../../Services/dashboard.service';
import { DashboardEstadisticas } from '../../../Models/dashboard';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, SidebarComponent],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard implements OnInit {

  menuAbierto = true;
  estadisticas: DashboardEstadisticas | null = null;
  cargando = false;
  error = '';

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.cargarEstadisticas();
  }

  toggleMenu() {
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
}
