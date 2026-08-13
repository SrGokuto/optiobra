import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../Services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss'
})
export class SidebarComponent {
  @Input() abierto = true;
  @Output() toggle = new EventEmitter<void>();

  private authService = inject(AuthService);
  usuario$ = this.authService.usuarioActual;

  menuItems = [
    { ruta: '/dashboard', icono: '🏠', label: 'Dashboard' },
    { ruta: '/proyectos', icono: '📁', label: 'Proyectos' },
    { ruta: '/materiales', icono: '📦', label: 'Materiales' },
    { ruta: '/avance-obra', icono: '📈', label: 'Avance de obra' },
    { ruta: '/trabajadores', icono: '👷', label: 'Trabajadores' },
    { ruta: '/tareas', icono: '📋', label: 'Tareas' },
  ];

  onToggle(): void {
    this.toggle.emit();
  }
}
