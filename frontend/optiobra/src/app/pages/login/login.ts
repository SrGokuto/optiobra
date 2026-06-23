import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class Login {

  correo = '';
  password = '';

  iniciarSesion() {

    if (!this.correo.trim()) {
      alert('El correo electrónico es obligatorio');
      return;
    }

    if (!this.correo.includes('@')) {
      alert('Ingrese un correo válido');
      return;
    }

    if (!this.password.trim()) {
      alert('La contraseña es obligatoria');
      return;
    }

    if (this.password.length < 8) {
      alert('La contraseña debe tener mínimo 8 caracteres');
      return;
    }

    alert('Inicio de sesión exitoso');
  }

}