import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../Services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrls: ['./login.scss'],
})
export class Login {
  email = '';
  password = '';
  error = '';
  cargando = false;

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  iniciarSesion() {
    this.error = '';

    if (!this.email.trim()) {
      this.error = 'El correo electrónico es obligatorio';
      return;
    }

    if (!this.email.includes('@')) {
      this.error = 'Ingrese un correo válido';
      return;
    }

    if (!this.password.trim()) {
      this.error = 'La contraseña es obligatoria';
      return;
    }

    if (this.password.length < 6) {
      this.error = 'La contraseña debe tener mínimo 6 caracteres';
      return;
    }

    this.cargando = true;

    this.authService.login(this.email.trim(), this.password).subscribe({
      next: (response) => {
        this.cargando = false;
        if (response.error) {
          this.error = response.mensaje || 'Error al iniciar sesión';
          return;
        }
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.cargando = false;
        this.error = AuthService.extraerMensajeError(err);
      },
    });
  }
}
