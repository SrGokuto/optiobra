import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule
} from '@angular/forms';
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

    const email = this.email.trim().toLowerCase();
    const password = this.password;

    // Validaciones
    if (!email) {
      alert('El correo electrónico es obligatorio');
      return;
    }

    if (!email.includes('@')) {
      alert('Ingrese un correo válido');
      return;
    }

    if (!password.trim()) {
      alert('La contraseña es obligatoria');
      return;
    }

    if (password.length < 8) {
      alert('La contraseña debe tener mínimo 8 caracteres');
      return;
    }

    this.cargando = true;

    this.authService.login(email, password).subscribe({
      next: (response) => {
        this.cargando = false;

        if (response.error) {
          this.error = response.mensaje || 'No se pudo iniciar sesión';
          alert(this.error);
          return;
        }

        alert('Inicio de sesión exitoso');

        this.router.navigate(['/materiales']);
      },
      error: (err) => {
        this.cargando = false;
        this.error = AuthService.extraerMensajeError(err);
        alert(this.error);
      },
    });
  }
}