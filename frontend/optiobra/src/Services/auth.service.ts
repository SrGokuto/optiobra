import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../environments/environment';
import {
  LoginResponse,
  RegisterPayload,
  RegisterResponse,
  UsuarioAuth,
} from '../Models/usuario';

const TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly authUrl = `${environment.apiUrl}/auth`;
  readonly usuarioActual = new BehaviorSubject<UsuarioAuth | null>(null);
  private refrescando: Promise<boolean> | null = null;
  private sincronizando = false;

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
            if (response.refresh_token) {
              this.guardarRefreshToken(response.refresh_token);
            }
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

  /** Restaura la sesión al iniciar la app: renueva el access_token por adelantado y luego valida con getMe. */
  cargarUsuarioActual(): void {
    if (this.sincronizando || !this.getToken()) {
      return;
    }
    this.sincronizando = true;

    this.refrescarToken().then((refrescado) => {
      this.sincronizando = false;

      if (refrescado) {
        this.getMe().subscribe({
          error: () => {},
        });
        return;
      }

      this.getMe().subscribe({
        error: (error) => {
          if (this.esErrorAuth(error)) {
            this.clearSession();
          }
        },
      });
    });
  }

  private esErrorAuth(error: unknown): boolean {
    return (
      error instanceof HttpErrorResponse &&
      (error.status === 401 || error.status === 403)
    );
  }

  /** Renueva el access_token con el refresh_token. Devuelve una promesa que resuelve si fue exitoso. */
  refrescarToken(): Promise<boolean> {
    if (this.refrescando) {
      return this.refrescando;
    }

    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      return Promise.resolve(false);
    }

    const promesa = new Promise<boolean>((resolve) => {
      this.http
        .post<LoginResponse>(`${this.authUrl}/refresh/`, {
          refresh_token: refreshToken,
        })
        .subscribe({
          next: (response) => {
            if (!response.error && response.access_token) {
              this.guardarToken(response.access_token);
              if (response.refresh_token) {
                this.guardarRefreshToken(response.refresh_token);
              }
              resolve(true);
            } else {
              this.clearSession();
              resolve(false);
            }
          },
          error: (error: HttpErrorResponse) => {
            if (
              error instanceof HttpErrorResponse &&
              (error.status === 401 || error.status === 400)
            ) {
              this.clearSession();
            }
            resolve(false);
          },
        });
    });

    this.refrescando = promesa;
    promesa.finally(() => {
      this.refrescando = null;
    });
    return promesa;
  }

  guardarToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  guardarRefreshToken(token: string): void {
    localStorage.setItem(REFRESH_TOKEN_KEY, token);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  clearSession(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
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
