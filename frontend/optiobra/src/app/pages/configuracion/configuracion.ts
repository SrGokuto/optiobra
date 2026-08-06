import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../components/sidebar/sidebar';
import { ConfiguracionService } from '../../../Services/configuracion.service';
import { ConfiguracionEmpresa } from '../../../Models/configuracion';

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

  constructor(private configuracionService: ConfiguracionService) {}

  ngOnInit(): void {
    this.cargarConfiguracion();
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
      next: (data) => {
        this.empresa = data;
        this.guardando = false;
        alert('Configuración guardada correctamente');
      },
      error: () => {
        this.guardando = false;
        alert('Error al guardar la configuración');
      }
    });
  }

}
