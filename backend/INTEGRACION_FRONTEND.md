"""
Guía de integración del backend con el frontend Angular
"""

# CONFIGURACIÓN FRONTEND (Angular)

# 1. Agregar en environment.ts:
BACKEND_URL = "http://localhost:8000/api"

# 2. Crear servicio de autenticación (auth.service.ts):
"""
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8000/api/auth';
  public usuarioActual = new BehaviorSubject<any>(null);

  constructor(private http: HttpClient) {
    this.cargarUsuarioActual();
  }

  registro(email: string, password: string, nombreCompleto?: string) {
    return this.http.post(`${this.apiUrl}/register/`, {
      email,
      password,
      nombre_completo: nombreCompleto
    });
  }

  login(email: string, password: string) {
    return this.http.post(`${this.apiUrl}/login/`, { email, password });
  }

  guardarToken(token: string) {
    localStorage.setItem('access_token', token);
  }

  obtenerToken() {
    return localStorage.getItem('access_token');
  }

  logout() {
    localStorage.removeItem('access_token');
    this.usuarioActual.next(null);
  }

  cargarUsuarioActual() {
    const token = this.obtenerToken();
    if (token) {
      this.http.get(`${this.apiUrl}/me/`).subscribe(
        (usuario) => this.usuarioActual.next(usuario)
      );
    }
  }

  estaAutenticado() {
    return !!this.obtenerToken();
  }
}
"""

# 3. Crear servicio de materiales (material.service.ts):
"""
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class MaterialService {
  private apiUrl = 'http://localhost:8000/api/materiales';

  constructor(private http: HttpClient) {}

  obtenerMateriales(filtros?: any) {
    let params = new HttpParams();
    if (filtros) {
      if (filtros.search) params = params.set('search', filtros.search);
      if (filtros.categoria) params = params.set('categoria', filtros.categoria);
      if (filtros.estado) params = params.set('estado', filtros.estado);
      if (filtros.disponible) params = params.set('disponible', filtros.disponible);
    }
    return this.http.get<any>(`${this.apiUrl}/`, { params });
  }

  obtenerMaterial(id: number) {
    return this.http.get(`${this.apiUrl}/${id}/`);
  }

  crearMaterial(material: any) {
    return this.http.post(this.apiUrl + '/', material);
  }

  actualizarMaterial(id: number, material: any) {
    return this.http.put(`${this.apiUrl}/${id}/`, material);
  }

  eliminarMaterial(id: number) {
    return this.http.delete(`${this.apiUrl}/${id}/`);
  }

  actualizarCantidad(id: number, cantidad: number, tipo: string = 'ajuste') {
    return this.http.post(
      `${this.apiUrl}/${id}/actualizar_cantidad/`,
      { cantidad, tipo }
    );
  }

  obtenerHistorial(id: number) {
    return this.http.get(`${this.apiUrl}/${id}/historial/`);
  }

  obtenerEstadisticas() {
    return this.http.get(`${this.apiUrl}/estadisticas/`);
  }
}
"""

# 4. Crear interceptor para agregar token (auth.interceptor.ts):
"""
import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const token = this.authService.obtenerToken();
    
    if (token) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    return next.handle(request);
  }
}
"""

# 5. Agregar en app.config.ts:
"""
import { AuthInterceptor } from './auth.interceptor';
import { HTTP_INTERCEPTORS } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    // ... otros providers
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ]
};
"""

# 6. Ejemplo de componente de login:
"""
import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  email = '';
  password = '';
  error = '';
  cargando = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  iniciarSesion() {
    this.cargando = true;
    this.error = '';
    
    this.authService.login(this.email, this.password).subscribe({
      next: (respuesta: any) => {
        this.authService.guardarToken(respuesta.access_token);
        this.authService.cargarUsuarioActual();
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        this.error = error.error.mensaje || 'Error al iniciar sesión';
        this.cargando = false;
      }
    });
  }
}
"""

# 7. Ejemplo de componente de materiales:
"""
import { Component, OnInit } from '@angular/core';
import { MaterialService } from '../services/material.service';

@Component({
  selector: 'app-materiales',
  templateUrl: './materiales.component.html',
  styleUrls: ['./materiales.component.scss']
})
export class MaterialesComponent implements OnInit {
  materiales: any[] = [];
  filtro = '';
  cargando = false;
  error = '';

  constructor(private materialService: MaterialService) {}

  ngOnInit() {
    this.obtenerMateriales();
  }

  obtenerMateriales() {
    this.cargando = true;
    this.materialService.obtenerMateriales({ search: this.filtro }).subscribe({
      next: (respuesta) => {
        this.materiales = respuesta.results;
        this.cargando = false;
      },
      error: (error) => {
        this.error = 'Error al obtener materiales';
        this.cargando = false;
      }
    });
  }

  eliminarMaterial(id: number) {
    if (confirm('¿Deseas eliminar este material?')) {
      this.materialService.eliminarMaterial(id).subscribe({
        next: () => this.obtenerMateriales(),
        error: () => this.error = 'Error al eliminar'
      });
    }
  }
}
"""

# 8. Guard de autenticación (auth.guard.ts):
"""
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): boolean {
    if (this.authService.estaAutenticado()) {
      return true;
    }
    this.router.navigate(['/login']);
    return false;
  }
}
"""

# 9. Rutas protegidas en app.routes.ts:
"""
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'registro', component: RegistroComponent },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'materiales',
    component: MaterialesComponent,
    canActivate: [AuthGuard]
  }
];
"""

# FLUJO TÍPICO:

"""
1. Usuario accede a /login
   ↓
2. Ingresa email y contraseña
   ↓
3. Se llama a AuthService.login(email, password)
   ↓
4. POST /api/auth/login/ → retorna access_token
   ↓
5. Token se guarda en localStorage
   ↓
6. Usuario redirigido a /dashboard
   ↓
7. Todas las peticiones incluyen Authorization header con token
   ↓
8. En /materiales:
   - Se llama MaterialService.obtenerMateriales()
   - GET /api/materiales/ con token
   - Backend valida token y retorna materiales
   ↓
9. Se muestran materiales en tabla
   ↓
10. CRUD completo:
    - Create: POST /api/materiales/
    - Read: GET /api/materiales/ o GET /api/materiales/{id}/
    - Update: PUT /api/materiales/{id}/
    - Delete: DELETE /api/materiales/{id}/
"""

# MANEJO DE ERRORES COMUNES:

"""
1. Token expirado:
   - Interceptor detecta 401
   - Redirige a login
   - Usuario debe iniciar sesión nuevamente

2. Validación fallida:
   - Servidor retorna 400
   - Frontend muestra errores específicos del serializer

3. Permiso denegado:
   - Servidor retorna 403
   - Frontend muestra mensaje de acceso denegado

4. Material no encontrado:
   - Servidor retorna 404
   - Frontend redirige a lista de materiales
"""

# TESTING:

"""
Usando Postman o curl:

1. Registrar usuario:
curl -X POST http://localhost:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "nombre_completo": "Test User"
  }'

2. Iniciar sesión:
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'

3. Usar token para obtener materiales:
curl -X GET http://localhost:8000/api/materiales/ \
  -H "Authorization: Token <tu-token-aqui>"

4. Crear material:
curl -X POST http://localhost:8000/api/materiales/ \
  -H "Authorization: Token <tu-token-aqui>" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Cable USB",
    "codigo": "USB-001",
    "categoria": 1,
    "precio": "5.99",
    "cantidad": 50,
    "unidad_medida": "unidad",
    "estado": "disponible"
  }'
"""
