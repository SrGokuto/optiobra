import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../environments/environment';
import {
  Categoria,
  FiltroMaterial,
  Material,
  MaterialPaginado,
  MaterialPayload,
} from '../Models/material';
import {
  Proyecto,
  ProyectoPaginado,
  FiltroProyecto,
  ProyectoPayload,
} from '../Models/proyecto';

@Injectable({
  providedIn: 'root',
})
export class MaterialService {
  private readonly apiUrl = `${environment.apiUrl}/materiales`;

  constructor(private http: HttpClient) {}

  getMateriales(filtros: FiltroMaterial = {}): Observable<MaterialPaginado> {
    let params = new HttpParams();

    if (filtros.search) {
      params = params.set('search', filtros.search);
    }
    if (filtros.categoria) {
      params = params.set('categoria', filtros.categoria.toString());
    }
    if (filtros.estado) {
      params = params.set('estado', filtros.estado);
    }
    if (filtros.page) {
      params = params.set('page', filtros.page.toString());
    }

    return this.http.get<MaterialPaginado>(`${this.apiUrl}/`, { params });
  }

  getMaterialById(id: number): Observable<Material> {
    return this.http.get<Material>(`${this.apiUrl}/${id}/`);
  }

  crearMaterial(material: MaterialPayload): Observable<Material> {
    return this.http.post<Material>(`${this.apiUrl}/`, material);
  }

  editarMaterial(id: number, material: MaterialPayload): Observable<Material> {
    return this.http.put<Material>(`${this.apiUrl}/${id}/`, material);
  }

  eliminarMaterial(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}/`);
  }
}

@Injectable({
  providedIn: 'root',
})
export class CategoriaService {
  private readonly apiUrl = `${environment.apiUrl}/categorias`;

  constructor(private http: HttpClient) {}

  getCategorias(): Observable<Categoria[]> {
    return this.http
      .get<{ results: Categoria[] }>(`${this.apiUrl}/`)
      .pipe(map((response) => response.results ?? []));
  }
}

@Injectable({
  providedIn: 'root',
})
export class ProyectoService {
  private readonly apiUrl = `${environment.apiUrl}/proyectos`;

  constructor(private http: HttpClient) {}

  getProyectos(filtros: FiltroProyecto = {}): Observable<ProyectoPaginado> {
    let params = new HttpParams();

    if (filtros.search) {
      params = params.set('search', filtros.search);
    }
    if (filtros.estado) {
      params = params.set('estado', filtros.estado);
    }
    if (filtros.page) {
      params = params.set('page', filtros.page.toString());
    }

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
