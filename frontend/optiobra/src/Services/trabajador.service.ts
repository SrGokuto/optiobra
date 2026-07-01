import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { Trabajador, TrabajadorPayload, TrabajadorPaginado } from '../Models/trabajador';

@Injectable({
  providedIn: 'root',
})
export class TrabajadorService {
  private readonly apiUrl = `${environment.apiUrl}/trabajadores`;

  constructor(private http: HttpClient) {}

  getTrabajadores(filtros: { search?: string; rol?: string; estado?: string; page?: number } = {}): Observable<TrabajadorPaginado> {
    let params = new HttpParams();
    if (filtros.search) params = params.set('search', filtros.search);
    if (filtros.rol) params = params.set('rol', filtros.rol);
    if (filtros.estado) params = params.set('estado', filtros.estado);
    if (filtros.page) params = params.set('page', filtros.page.toString());
    return this.http.get<TrabajadorPaginado>(`${this.apiUrl}/`, { params });
  }

  getTrabajadorById(id: number): Observable<Trabajador> {
    return this.http.get<Trabajador>(`${this.apiUrl}/${id}/`);
  }

  crearTrabajador(trabajador: TrabajadorPayload): Observable<Trabajador> {
    return this.http.post<Trabajador>(`${this.apiUrl}/`, trabajador);
  }

  editarTrabajador(id: number, trabajador: TrabajadorPayload): Observable<Trabajador> {
    return this.http.put<Trabajador>(`${this.apiUrl}/${id}/`, trabajador);
  }

  eliminarTrabajador(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}/`);
  }
}
