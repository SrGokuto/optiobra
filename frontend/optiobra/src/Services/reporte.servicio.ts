import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';


// =====================================================
// FILTROS DEL REPORTE
// =====================================================

export interface FiltroReporte {
  tipoReporte?: string;
  proyecto?: string;
  fechaInicio?: string;
  fechaFin?: string;
}


// =====================================================
// DATOS DEL REPORTE
// =====================================================

export interface Reporte {

  proyectosActivos: number;

  materialesUtilizados: number;

  trabajadoresActivos: number;

  avancePromedio: number;

  avances: {
    nombre: string;
    porcentaje: number;
  }[];

}


// =====================================================
// SERVICIO
// =====================================================

@Injectable({
  providedIn: 'root'
})
export class ReportesService {

  private readonly apiUrl =
    `${environment.apiUrl}/reportes`;


  constructor(
    private http: HttpClient
  ) {}


  // ===================================================
  // GENERAR REPORTE
  // ===================================================

  generarReporte(
    filtros: FiltroReporte
  ): Observable<Reporte> {

    return this.http.post<Reporte>(
      `${this.apiUrl}/generar/`,
      filtros
    );

  }


  // ===================================================
  // OBTENER REPORTES
  // ===================================================

  getReportes(
    filtros: FiltroReporte = {}
  ): Observable<Reporte[]> {

    let params = new HttpParams();


    if (filtros.tipoReporte) {

      params = params.set(
        'tipoReporte',
        filtros.tipoReporte
      );

    }


    if (filtros.proyecto) {

      params = params.set(
        'proyecto',
        filtros.proyecto
      );

    }


    if (filtros.fechaInicio) {

      params = params.set(
        'fechaInicio',
        filtros.fechaInicio
      );

    }


    if (filtros.fechaFin) {

      params = params.set(
        'fechaFin',
        filtros.fechaFin
      );

    }


    return this.http.get<Reporte[]>(
      `${this.apiUrl}/`,
      { params }
    );

  }

}