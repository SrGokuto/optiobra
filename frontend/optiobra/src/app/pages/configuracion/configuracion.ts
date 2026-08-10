import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../components/sidebar/sidebar';
import { ConfiguracionService } from '../../../Services/configuracion.service';
import { ConfiguracionEmpresa } from '../../../Models/configuracion';

interface Toast {
  id: number;
  mensaje: string;
  tipo: 'exito' | 'error' | 'info';
}

@Component({
  selector: 'app-configuracion',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  templateUrl: './configuracion.html',
  styleUrl: './configuracion.scss'
})
export class Configuracion implements OnInit {

  menuAbierto = true;
  cargando = false;
  error = '';
  guardando = false;
  seccion: string = 'general';

  empresa: ConfiguracionEmpresa = {
    id: 0,
    nombre_empresa: '',
    email_contacto: '',
    nit_runc: '',
    telefono: '',
    direccion: '',
    moneda_principal: 'PEN',
    logo_url: '',
    creado_en: '',
    actualizado_en: ''
  };

  plantillaNotificacion: string = '';
  politicaContrasena: string = '';
  tiempoSesion: number | null = null;
  ultimoRespaldo: string = '';
  frecuenciaRespaldo: string = '';

  toasts: Toast[] = [];
  private toastId = 0;

  constructor(private configuracionService: ConfiguracionService) {}

  ngOnInit(): void {
    this.empresa = {
      id: 0,
      nombre_empresa: '',
      email_contacto: '',
      nit_runc: '',
      telefono: '',
      direccion: '',
      moneda_principal: 'PEN',
      logo_url: '',
      creado_en: '',
      actualizado_en: ''
    };

    this.mostrarToast('Bienvenido a Configuración. Los cambios se guardan desde el backend.', 'info');
  }

  toggleMenu() {
    this.menuAbierto = !this.menuAbierto;
  }

  cargarConfiguracion(): void {
    this.cargando = true;
    this.error = '';

    this.configuracionService.getEmpresa().subscribe({
      next: (data) => {
        this.empresa = data;
        this.cargando = false;
      },
      error: () => {
        this.error = 'No se pudo cargar la configuración';
        this.cargando = false;
      }
    });
  }

  guardarConfiguracion(): void {
    this.guardando = true;

    this.configuracionService.actualizarEmpresa(this.empresa).subscribe({
      next: () => {
        this.guardando = false;
        this.mostrarToast('Configuración guardada correctamente', 'exito');
      },
      error: () => {
        this.guardando = false;
        this.mostrarToast('Error al guardar la configuración', 'error');
      }
    });
  }

  private mostrarToast(mensaje: string, tipo: 'exito' | 'error' | 'info') {
    const id = ++this.toastId;
    this.toasts = [...this.toasts, { id, mensaje, tipo }];
    setTimeout(() => {
      this.toasts = this.toasts.filter(t => t.id !== id);
    }, 10000);
  }

}