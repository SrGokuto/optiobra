import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../Services/auth.service';

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
    private router: Router,
    private authService: AuthService,
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

    return !!(
      control &&
      control.invalid &&
      (control.touched || control.dirty)
    );
  }

  get passwordMismatch(): boolean {
    return (
      this.registerForm.hasError('passwordsMismatch') &&
      this.registerForm.get('confirmPassword')?.touched === true
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

    const firstName = this.registerForm.value.firstName?.trim();
    const lastName = this.registerForm.value.lastName?.trim();

    const payload = {
      email: this.registerForm.value.email?.trim().toLowerCase(),
      password: this.registerForm.value.password,
      nombre_completo: `${firstName} ${lastName}`.trim(),
    };

    this.authService.register(payload).subscribe({
      next: (response) => {
        this.isLoading = false;

        if (response.error) {
          this.errorMessage = response.mensaje || 'No se pudo completar el registro';
          return;
        }

        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = AuthService.extraerMensajeError(err);
      },
    });
  }
}