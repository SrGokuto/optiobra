import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../Services/auth.service';
import { UsuarioService } from '../../../Services/usuario.service';
import { UsuarioAuth } from '../../../Models/usuario';

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
  private usuarioService = inject(UsuarioService);
  private router = inject(Router);
  usuario$ = this.authService.usuarioActual;
  subiendoAvatar = false;
  cerrandoSesion = false;

  menuItems = [
    { ruta: '/dashboard', icono: 'bi bi-speedometer2', label: 'Dashboard' },
    { ruta: '/proyectos', icono: 'bi bi-folder2-open', label: 'Proyectos' },
    { ruta: '/materiales', icono: 'bi bi-box-seam', label: 'Materiales' },
    { ruta: '/avance-obra', icono: 'bi bi-graph-up-arrow', label: 'Avance de obra' },
    { ruta: '/trabajadores', icono: 'bi bi-person-workspace', label: 'Trabajadores' },
    { ruta: '/tareas', icono: 'bi bi-check2-square', label: 'Tareas' },
    { ruta: '/calendario', icono: 'bi bi-calendar3', label: 'Calendario' },
    { ruta: '/reportes', icono: 'bi bi-bar-chart-line', label: 'Reportes' },
    { ruta: '/usuarios', icono: 'bi bi-people', label: 'Usuarios' },
    { ruta: '/configuracion', icono: 'bi bi-gear', label: 'Configuración' },
    { ruta: '/perfil', icono: 'bi bi-person-circle', label: 'Mi perfil' },
  ];

  onToggle(): void {
    this.toggle.emit();
  }

  cerrarSesion(): void {
    if (this.cerrandoSesion) {
      return;
    }
    this.cerrandoSesion = true;
    this.authService.logout().subscribe({
      next: () => {
        this.cerrandoSesion = false;
        this.router.navigate(['/login']);
      },
      error: () => {
        this.authService.clearSession();
        this.cerrandoSesion = false;
        this.router.navigate(['/login']);
      },
    });
  }

  onAvatarClick(input: HTMLInputElement): void {
    input.value = '';
    input.click();
  }

  onAvatarSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }

    const usuario = this.authService.usuarioActual.getValue();
    if (!usuario?.id) {
      return;
    }

    this.subiendoAvatar = true;
    this.redimensionarImagen(file, 256).then((dataUrl) => {
      this.usuarioService.actualizarAvatar(usuario.id, dataUrl).subscribe({
        next: () => {
          const actualizado: UsuarioAuth = { ...usuario, avatar_url: dataUrl };
          this.authService.usuarioActual.next(actualizado);
          this.subiendoAvatar = false;
        },
        error: () => {
          this.subiendoAvatar = false;
          alert('No se pudo actualizar la imagen de perfil');
        },
      });
    });
  }

  private redimensionarImagen(file: File, maxSize: number): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          let { width, height } = img;
          if (width > height && width > maxSize) {
            height = Math.round((height * maxSize) / width);
            width = maxSize;
          } else if (height > maxSize) {
            width = Math.round((width * maxSize) / height);
            height = maxSize;
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('No se pudo procesar la imagen'));
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.85));
        };
        img.onerror = () => reject(new Error('Imagen inválida'));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('No se pudo leer el archivo'));
      reader.readAsDataURL(file);
    });
  }
}
