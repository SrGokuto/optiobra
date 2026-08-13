import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { TareaPaginado } from '../Models/tarea';

@Injectable({
  providedIn: 'root',
})
export class TareaService {
  private readonly apiUrl = `${environment.apiUrl}/tareas`;

  constructor(private http: HttpClient) {}

  getTareas(filtros: { trabajador?: number; estado?: string; proyecto?: number; page?: number } = {}): Observable<TareaPaginado> {
    let params = new HttpParams();
    if (filtros.trabajador) params = params.set('trabajador', filtros.trabajador.toString());
    if (filtros.estado) params = params.set('estado', filtros.estado);
    if (filtros.proyecto) params = params.set('proyecto', filtros.proyecto.toString());
    if (filtros.page) params = params.set('page', filtros.page.toString());
    return this.http.get<TareaPaginado>(`${this.apiUrl}/`, { params });
  }
}
