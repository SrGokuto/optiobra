import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule
} from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class Login implements OnInit {

  loginForm!: FormGroup;
  showPassword = false;
  isLoading = false;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  isInvalid(controlName: string): boolean {
    const control = this.loginForm.get(controlName);

    if (!control || !control.invalid) {
      return false;
    }

    // Mostrar error si el campo está siendo escrito (dirty)
    if (control.dirty) {
      return true;
    }

    // O si algún campo del formulario está siendo escrito, mostrar todos los errores
    const isFormBeingEdited = Object.keys(this.loginForm.controls).some(
      key => this.loginForm.get(key)?.dirty
    );

    return isFormBeingEdited || control.touched;
  }

  getErrorMessage(controlName: string): string {
    const control = this.loginForm.get(controlName);

    if (!control || !this.isInvalid(controlName)) {
      return '';
    }

    const errors = control.errors;

    if (!errors) {
      return '';
    }

    switch (controlName) {
      case 'email':
        if (errors['required']) {
          return 'El correo electrónico es obligatorio.';
        }
        if (errors['email']) {
          return 'Ingresa un correo electrónico válido.';
        }
        break;

      case 'password':
        if (errors['required']) {
          return 'La contraseña es obligatoria.';
        }
        if (errors['minlength']) {
          return 'La contraseña debe tener mínimo 6 caracteres.';
        }
        break;

      default:
        return 'Este campo es inválido.';
    }

    return 'Este campo es inválido.';
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    this.loginForm.markAllAsTouched();

    if (this.loginForm.invalid) {
      return;
    }

    this.isLoading = true;

    const payload = {
      email: this.loginForm.value.email?.trim().toLowerCase(),
      password: this.loginForm.value.password
    };

    console.log('Iniciando sesión:', payload);

    setTimeout(() => {
      this.isLoading = false;
    }, 1500);
  }
}