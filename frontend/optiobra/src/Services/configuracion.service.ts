import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { ConfiguracionEmpresa, ConfiguracionSistema, ConfiguracionGeneral } from '../Models/configuracion';

@Injectable({
  providedIn: 'root',
})
export class ConfiguracionService {
  private readonly apiUrl = `${environment.apiUrl}/configuracion`;

  constructor(private http: HttpClient) {}

  getGeneral(): Observable<ConfiguracionGeneral> {
    return this.http.get<ConfiguracionGeneral>(`${this.apiUrl}/`);
  }

  getEmpresa(): Observable<ConfiguracionEmpresa> {
    return this.http.get<ConfiguracionEmpresa>(`${this.apiUrl}/empresa/`);
  }

  actualizarEmpresa(data: Partial<ConfiguracionEmpresa>): Observable<ConfiguracionEmpresa> {
    return this.http.put<ConfiguracionEmpresa>(`${this.apiUrl}/empresa/`, data);
  }

  getSistema(): Observable<ConfiguracionSistema> {
    return this.http.get<ConfiguracionSistema>(`${this.apiUrl}/sistema/`);
  }

  actualizarSistema(data: Partial<ConfiguracionSistema>): Observable<ConfiguracionSistema> {
    return this.http.put<ConfiguracionSistema>(`${this.apiUrl}/sistema/`, data);
  }
}
