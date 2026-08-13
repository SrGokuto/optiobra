import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { Tarea, TareaPaginado, TareaPayload } from '../Models/tarea';

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

  getTodasLasTareas(
    filtros: { trabajador?: number; estado?: string; proyecto?: number } = {}
  ): Observable<Tarea[]> {
    return new Observable((observer) => {
      const acumuladas: Tarea[] = [];
      const recorrer = (page: number) => {
        this.getTareas({ ...filtros, page }).subscribe({
          next: (response) => {
            acumuladas.push(...response.results);
            if (response.next) {
              recorrer(page + 1);
            } else {
              observer.next(acumuladas);
              observer.complete();
            }
          },
          error: (error) => observer.error(error),
        });
      };
      recorrer(1);
    });
  }

  crearTarea(tarea: TareaPayload): Observable<Tarea> {
    return this.http.post<Tarea>(`${this.apiUrl}/`, tarea);
  }

  actualizarTarea(id: number, cambios: Partial<TareaPayload>): Observable<Tarea> {
    return this.http.patch<Tarea>(`${this.apiUrl}/${id}/`, cambios);
  }
}
