// services/material.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Material,
  MaterialPaginado,
  FiltroMaterial,
} from '../models/material.model';

@Injectable({
  providedIn: 'root',
})
export class MaterialService {

  private apiUrl = 'http://localhost:3000/api/materiales';

  constructor(private http: HttpClient) {}

  // Obtener todos los materiales con filtros y paginación
  getMateriales(filtros: FiltroMaterial): Observable<MaterialPaginado> {
    let params = new HttpParams();

    if (filtros.busqueda) {
      params = params.set('busqueda', filtros.busqueda);
    }
    if (filtros.proyecto && filtros.proyecto !== 'Todos los proyectos') {
      params = params.set('proyecto', filtros.proyecto);
    }
    if (filtros.pagina) {
      params = params.set('pagina', filtros.pagina.toString());
    }
    if (filtros.limite) {
      params = params.set('limite', filtros.limite.toString());
    }

    return this.http.get<MaterialPaginado>(this.apiUrl, { params });
  }

  // Obtener un material por ID
  getMaterialById(id: number): Observable<Material> {
    return this.http.get<Material>(`${this.apiUrl}/${id}`);
  }

  // Crear un nuevo material
  crearMaterial(material: Omit<Material, 'id'>): Observable<Material> {
    return this.http.post<Material>(this.apiUrl, material);
  }

  // Editar un material existente
  editarMaterial(id: number, material: Omit<Material, 'id'>): Observable<Material> {
    return this.http.put<Material>(`${this.apiUrl}/${id}`, material);
  }

  // Eliminar un material
  eliminarMaterial(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}