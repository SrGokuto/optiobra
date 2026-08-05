import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-configuracion',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './configuracion.html',
  styleUrl: './configuracion.scss'
})
export class Configuracion {

  menuAbierto = true;

  toggleMenu() {
    this.menuAbierto = !this.menuAbierto;
  }

  empresa = {
    nombre: 'OptiObra Constructora S.A.C.',
    correo: 'contacto@optiobra.com',
    ruc: '900123456',
    telefono: '(+57) 3001234567',
    direccion: 'Cra. 15 #80-25 Bogotá'
  };

  guardarConfiguracion() {
    alert('Configuración guardada correctamente');
  }

}