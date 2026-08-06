import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../Services/auth.service';
import { MaterialService, ProyectoService } from '../../../Services/servicios';
import { UsuarioAuth } from '../../../Models/usuario';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {
  menuAbierto = true;
  usuario: UsuarioAuth | null = null;

  totalMateriales = 0;
  materialesDisponibles = 0;
  totalProyectos = 0;
  valorInventario = 0;

  constructor(
    private authService: AuthService,
    private materialService: MaterialService,
    private proyectoService: ProyectoService,
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
