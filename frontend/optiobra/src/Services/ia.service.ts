import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { EstimacionIA } from '../Models/estimacion';

@Injectable({
  providedIn: 'root',
})
export class IaService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  generarResumenEjecutivo(proyectoId: number): Observable<EstimacionIA> {
    return this.http.post<EstimacionIA>(
      `${this.apiUrl}/proyectos/${proyectoId}/estimaciones/`,
      {}
    );
  }
}