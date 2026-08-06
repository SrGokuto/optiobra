import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { AvanceObra, AvanceObraPayload, AvanceObraPaginado } from '../Models/avance-obra';

@Injectable({
  providedIn: 'root',
})
export class AvanceObraService {
  private readonly apiUrl = `${environment.apiUrl}/avances`;

  constructor(private http: HttpClient) {}

  getAvances(filtros: { search?: string; proyecto?: number; page?: number } = {}): Observable<AvanceObraPaginado> {
    let params = new HttpParams();
    if (filtros.search) params = params.set('search', filtros.search);
    if (filtros.proyecto) params = params.set('proyecto', filtros.proyecto.toString());
    if (filtros.page) params = params.set('page', filtros.page.toString());
    return this.http.get<AvanceObraPaginado>(`${this.apiUrl}/`, { params });
  }

  getAvanceById(id: number): Observable<AvanceObra> {
    return this.http.get<AvanceObra>(`${this.apiUrl}/${id}/`);
  }

  crearAvance(avance: AvanceObraPayload): Observable<AvanceObra> {
    return this.http.post<AvanceObra>(`${this.apiUrl}/`, avance);
  }

  editarAvance(id: number, avance: AvanceObraPayload): Observable<AvanceObra> {
    return this.http.put<AvanceObra>(`${this.apiUrl}/${id}/`, avance);
  }

  eliminarAvance(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}/`);
  }
}
