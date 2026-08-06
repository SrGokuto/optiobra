import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { Reporte, ReportePaginado, ReporteInventario, ReporteStockBajo, ReporteProyectos, ReporteTrabajadores } from '../Models/reporte';
import { Proyecto } from '../Models/proyecto';

@Injectable({
  providedIn: 'root',
})
export class ReporteService {
  private readonly apiUrl = `${environment.apiUrl}/reportes`;

  constructor(private http: HttpClient) {}

  getReportes(): Observable<ReportePaginado> {
    return this.http.get<ReportePaginado>(`${this.apiUrl}/`);
  }

  getInventario(): Observable<ReporteInventario> {
    return this.http.get<ReporteInventario>(`${this.apiUrl}/inventario/`);
  }

  getStockBajo(): Observable<ReporteStockBajo> {
    return this.http.get<ReporteStockBajo>(`${this.apiUrl}/stock_bajo/`);
  }

  getProyectos(): Observable<ReporteProyectos> {
    return this.http.get<ReporteProyectos>(`${this.apiUrl}/proyectos/`);
  }

  getTrabajadores(): Observable<ReporteTrabajadores> {
    return this.http.get<ReporteTrabajadores>(`${this.apiUrl}/trabajadores/`);
  }

  getProyectosParaFiltro(): Observable<{ results: Proyecto[] }> {
    return this.http.get<{ results: Proyecto[] }>(`${environment.apiUrl}/proyectos/`);
  }
}
