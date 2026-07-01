import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { Proyecto, ProyectoPayload, ProyectoPaginado } from '../Models/proyecto';

@Injectable({
  providedIn: 'root',
})
export class ProyectoService {
  private readonly apiUrl = `${environment.apiUrl}/proyectos`;

  constructor(private http: HttpClient) {}

  getProyectos(filtros: { search?: string; estado?: string; page?: number } = {}): Observable<ProyectoPaginado> {
    let params = new HttpParams();
    if (filtros.search) params = params.set('search', filtros.search);
    if (filtros.estado) params = params.set('estado', filtros.estado);
    if (filtros.page) params = params.set('page', filtros.page.toString());
    return this.http.get<ProyectoPaginado>(`${this.apiUrl}/`, { params });
  }

  getProyectoById(id: number): Observable<Proyecto> {
    return this.http.get<Proyecto>(`${this.apiUrl}/${id}/`);
  }

  crearProyecto(proyecto: ProyectoPayload): Observable<Proyecto> {
    return this.http.post<Proyecto>(`${this.apiUrl}/`, proyecto);
  }

  editarProyecto(id: number, proyecto: ProyectoPayload): Observable<Proyecto> {
    return this.http.put<Proyecto>(`${this.apiUrl}/${id}/`, proyecto);
  }

  eliminarProyecto(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}/`);
  }
}
