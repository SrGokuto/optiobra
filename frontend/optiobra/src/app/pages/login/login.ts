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

  onSubmit(): void {
    this.error = '';
    this.cargando = true;

    const email = this.email.trim().toLowerCase();
    const password = this.password;

    if (!email || !password) {
      this.error = 'Ingresa tu correo y contraseña';
      this.cargando = false;
      return;
    }

    this.authService.login(email, password).subscribe({
      next: (response) => {
        this.cargando = false;

        if (response.error) {
          this.error = response.mensaje || 'No se pudo iniciar sesión';
          return;
        }

        this.router.navigate(['/materiales']);
      },
      error: (err) => {
        this.cargando = false;
        this.error = AuthService.extraerMensajeError(err);
      },
    });
  }
}
