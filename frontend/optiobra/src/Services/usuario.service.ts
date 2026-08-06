import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { Usuario, UsuarioPaginado, UsuarioPayload } from '../Models/usuario-sistema';

@Injectable({
  providedIn: 'root',
})
export class UsuarioService {
  private readonly apiUrl = `${environment.apiUrl}/usuarios`;

  constructor(private http: HttpClient) {}

  getUsuarios(filtros: { search?: string; rol?: string; activo?: string; page?: number } = {}): Observable<UsuarioPaginado> {
    let params = new HttpParams();
    if (filtros.search) params = params.set('search', filtros.search);
    if (filtros.rol) params = params.set('rol', filtros.rol);
    if (filtros.activo) params = params.set('activo', filtros.activo);
    if (filtros.page) params = params.set('page', filtros.page.toString());
    return this.http.get<UsuarioPaginado>(`${this.apiUrl}/`, { params });
  }

  getUsuarioById(id: number): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.apiUrl}/${id}/`);
  }

  crearUsuario(usuario: UsuarioPayload): Observable<Usuario> {
    return this.http.post<Usuario>(`${this.apiUrl}/`, usuario);
  }

  editarUsuario(id: number, usuario: Partial<UsuarioPayload>): Observable<Usuario> {
    return this.http.patch<Usuario>(`${this.apiUrl}/${id}/`, usuario);
  }

  eliminarUsuario(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}/`);
  }

  cambiarEstado(id: number, activo: boolean): Observable<Usuario> {
    return this.http.post<Usuario>(`${this.apiUrl}/${id}/cambiar_estado/`, { activo });
  }

  cambiarRol(id: number, rol: string): Observable<Usuario> {
    return this.http.post<Usuario>(`${this.apiUrl}/${id}/cambiar_rol/`, { rol });
  }
}
