import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../environments/environment';
import {
  LoginResponse,
  RegisterPayload,
  RegisterResponse,
  UsuarioAuth,
} from '../Models/usuario';

const TOKEN_KEY = 'access_token';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly authUrl = `${environment.apiUrl}/auth`;
  readonly usuarioActual = new BehaviorSubject<UsuarioAuth | null>(null);

  constructor(private http: HttpClient) {
    this.cargarUsuarioActual();
  }

  register(payload: RegisterPayload): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.authUrl}/register/`, payload);
  }

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.authUrl}/login/`, { email, password })
      .pipe(
        tap((response) => {
          if (!response.error && response.access_token) {
            this.guardarToken(response.access_token);
            if (response.usuario) {
              this.usuarioActual.next(response.usuario);
            }
          }
        }),
      );
  }

  logout(): Observable<unknown> {
    return this.http.post(`${this.authUrl}/logout/`, {}).pipe(
      tap(() => this.clearSession()),
    );
  }

  getMe(): Observable<UsuarioAuth> {
    return this.http.get<UsuarioAuth>(`${this.authUrl}/me/`).pipe(
      tap((usuario) => this.usuarioActual.next(usuario)),
    );
  }

  cargarUsuarioActual(): void {
    if (!this.getToken()) {
      return;
    }

    this.getMe().subscribe({
      error: () => this.clearSession(),
    });
  }

  guardarToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  clearSession(): void {
    localStorage.removeItem(TOKEN_KEY);
    this.usuarioActual.next(null);
  }

  static extraerMensajeError(error: unknown): string {
    const body = (error as { error?: Record<string, unknown> })?.error;

    if (!body) {
      return 'Ocurrió un error inesperado';
    }

    if (typeof body['mensaje'] === 'string') {
      return body['mensaje'];
    }

    if (typeof body['error'] === 'string') {
      return body['error'];
    }

    return 'Ocurrió un error inesperado';
  }
}
