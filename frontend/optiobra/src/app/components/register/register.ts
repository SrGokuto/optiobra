import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors
} from '@angular/forms';
import { Router } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

export function passwordsMatchValidator(
  control: AbstractControl
): ValidationErrors | null {

  const password = control.get('password')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;

  if (password !== confirmPassword) {
    return { passwordsMismatch: true };
  }

  return null;
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrls: ['./register.scss']
})
export class RegisterComponent implements OnInit {

  registerForm!: FormGroup;

  showPassword = false;
  showConfirmPassword = false;

  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.registerForm = this.fb.group(
      {
        firstName: ['', [Validators.required, Validators.minLength(2)]],

        lastName: ['', [Validators.required, Validators.minLength(2)]],

        email: ['', [
          Validators.required,
          Validators.email
        ]],

        password: ['', [
          Validators.required,
          Validators.minLength(6)
        ]],

        confirmPassword: ['', Validators.required],

        phone: ['', [
          Validators.required,
          Validators.pattern(/^[0-9]{7,15}$/)
        ]],

        acceptTerms: [
          false,
          Validators.requiredTrue
        ]
      },
      {
        validators: passwordsMatchValidator
      }
    );
  }

  isInvalid(controlName: string): boolean {
    const control = this.registerForm.get(controlName);

    if (!control || !control.invalid) {
      return false;
    }

    // Mostrar error si el campo está siendo escrito (dirty)
    if (control.dirty) {
      return true;
    }

    // O si algún campo del formulario está siendo escrito, mostrar todos los errores
    const isFormBeingEdited = Object.keys(this.registerForm.controls).some(
      key => this.registerForm.get(key)?.dirty
    );

    return isFormBeingEdited || control.touched;
  }

  getErrorMessage(controlName: string): string {
    const control = this.registerForm.get(controlName);

    if (!control || !this.isInvalid(controlName)) {
      return '';
    }

    const errors = control.errors;

    if (!errors) {
      return '';
    }

    switch (controlName) {
      case 'firstName':
        if (errors['required']) {
          return 'El nombre es obligatorio.';
        }
        if (errors['minlength']) {
          return 'El nombre debe tener al menos 2 caracteres.';
        }
        break;

      case 'lastName':
        if (errors['required']) {
          return 'El apellido es obligatorio.';
        }
        if (errors['minlength']) {
          return 'El apellido debe tener al menos 2 caracteres.';
        }
        break;

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

      case 'confirmPassword':
        if (errors['required']) {
          return 'Debes confirmar tu contraseña.';
        }
        break;

      case 'phone':
        if (errors['required']) {
          return 'El teléfono es obligatorio.';
        }
        if (errors['pattern']) {
          return 'El teléfono solo puede contener números (7-15 dígitos).';
        }
        break;

      case 'acceptTerms':
        if (errors['required']) {
          return 'Debes aceptar los términos y condiciones.';
        }
        break;

      default:
        return 'Este campo es inválido.';
    }

    return 'Este campo es inválido.';
  }

  get passwordMismatch(): boolean {
    return (
      this.registerForm.hasError('passwordsMismatch') &&
      (this.registerForm.get('confirmPassword')?.touched === true ||
        this.registerForm.get('confirmPassword')?.dirty === true)
    );
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  onSubmit(): void {

    this.registerForm.markAllAsTouched();

    if (this.registerForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const payload = {
      firstName: this.registerForm.value.firstName?.trim(),
      lastName: this.registerForm.value.lastName?.trim(),
      email: this.registerForm.value.email?.trim().toLowerCase(),
      password: this.registerForm.value.password,
      phone: this.registerForm.value.phone?.trim()
    };

    console.log('Usuario registrado:', payload);

    setTimeout(() => {
      this.isLoading = false;
      this.router.navigate(['/login']);
    }, 1500);
  }
}