import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../components/sidebar/sidebar';
import { AuthService } from '../../../Services/auth.service';
import { UsuarioService } from '../../../Services/usuario.service';
import { UsuarioAuth } from '../../../Models/usuario';

interface Toast {
  id: number;
  mensaje: string;
  tipo: 'exito' | 'error' | 'info';
}

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  templateUrl: './perfil.html',
  styleUrls: ['./perfil.scss'],
})
export class Perfil implements OnInit {
  menuAbierto = true;
  guardando = false;
  cargando = true;
  error = '';
  subiendoAvatar = false;

  nombreCompleto = '';
  email = '';
  telefono = '';
  departamento = '';
  cargo = '';
  direccion = '';
  avatarUrl = '';

  toasts: Toast[] = [];
  private toastId = 0;

  constructor(
    private authService: AuthService,
    private usuarioService: UsuarioService,
  ) {}

  ngOnInit(): void {
    const usuario = this.authService.usuarioActual.getValue();
    if (usuario) {
      this.cargarDatos(usuario);
    }
    this.authService.usuarioActual.subscribe((u) => {
      if (u) {
        this.cargarDatos(u);
      }
    });
  }

  private cargarDatos(usuario: UsuarioAuth): void {
    this.cargando = false;
    this.nombreCompleto = usuario.nombre_completo || '';
    this.email = usuario.email || '';
    this.avatarUrl = usuario.avatar_url || usuario.perfil?.avatar_url || '';

    const perfil = usuario.perfil;
    this.telefono = perfil?.telefono || '';
    this.departamento = perfil?.departamento || '';
    this.cargo = perfil?.cargo || '';
    this.direccion = perfil?.direccion || '';
  }

  toggleMenu() {
    this.menuAbierto = !this.menuAbierto;
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
          this.avatarUrl = dataUrl;
          const actualizado: UsuarioAuth = {
            ...usuario,
            avatar_url: dataUrl,
            perfil: { ...usuario.perfil, avatar_url: dataUrl },
          };
          this.authService.usuarioActual.next(actualizado);
          this.subiendoAvatar = false;
          this.mostrarToast('Imagen de perfil actualizada', 'exito');
        },
        error: () => {
          this.subiendoAvatar = false;
          this.mostrarToast('No se pudo actualizar la imagen de perfil', 'error');
        },
      });
    });
  }

  guardar(): void {
    const usuario = this.authService.usuarioActual.getValue();
    if (!usuario?.id) {
      this.error = 'No se pudo identificar tu usuario';
      return;
    }

    if (!this.nombreCompleto.trim()) {
      this.error = 'El nombre completo es obligatorio';
      return;
    }

    this.error = '';
    this.guardando = true;

    this.usuarioService
      .editarUsuario(usuario.id, {
        nombre_completo: this.nombreCompleto.trim(),
        telefono: this.telefono,
        departamento: this.departamento,
        cargo: this.cargo,
        direccion: this.direccion,
      })
      .subscribe({
        next: (res) => {
          this.guardando = false;

          const actualizado: UsuarioAuth = {
            ...usuario,
            nombre_completo: this.nombreCompleto.trim(),
            email: res.email || this.email,
            perfil: {
              ...usuario.perfil,
              telefono: this.telefono,
              departamento: this.departamento,
              cargo: this.cargo,
              direccion: this.direccion,
              avatar_url: this.avatarUrl,
            },
          };
          this.authService.usuarioActual.next(actualizado);
          this.mostrarToast('Perfil actualizado correctamente', 'exito');
        },
        error: (err) => {
          this.guardando = false;
          this.error = AuthService.extraerMensajeError(err);
        },
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

  private mostrarToast(mensaje: string, tipo: 'exito' | 'error' | 'info') {
    const id = ++this.toastId;
    this.toasts = [...this.toasts, { id, mensaje, tipo }];
    setTimeout(() => {
      this.toasts = this.toasts.filter((t) => t.id !== id);
    }, 10000);
  }
}