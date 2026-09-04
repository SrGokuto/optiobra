import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { Alerta } from '../Models/alerta';

@Injectable({
  providedIn: 'root',
})
export class AlertaService {
  private readonly apiUrl = `${environment.apiUrl}/alertas`;

  constructor(private http: HttpClient) {}

  listar(): Observable<Alerta[]> {
    return this.http.get<Alerta[]>(`${this.apiUrl}/`);
  }

  marcarLeida(id: number): Observable<Alerta> {
    return this.http.post<Alerta>(`${this.apiUrl}/${id}/marcar_leida/`, {});
  }
}
