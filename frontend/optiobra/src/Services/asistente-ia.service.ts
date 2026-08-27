import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import {
  ConversacionIA,
  ConversacionPayload,
  MaterialIA,
  MensajeIA,
  RespuestaMensajeIA,
} from '../Models/asistente-ia';

@Injectable({
  providedIn: 'root',
})
export class AsistenteIAService {
  private readonly apiUrl = `${environment.apiUrl}/ia/asistentes`;

  constructor(private http: HttpClient) {}

  listarConversaciones(): Observable<ConversacionIA[]> {
    return this.http.get<ConversacionIA[]>(`${this.apiUrl}/`);
  }

  crearConversacion(payload: ConversacionPayload = {}): Observable<ConversacionIA> {
    return this.http.post<ConversacionIA>(`${this.apiUrl}/`, payload);
  }

  eliminarConversacion(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}/`);
  }

  listarMensajes(id: number): Observable<MensajeIA[]> {
    return this.http.get<MensajeIA[]>(`${this.apiUrl}/${id}/mensajes/`);
  }

  enviarMensaje(id: number, contenido: string): Observable<RespuestaMensajeIA> {
    return this.http.post<RespuestaMensajeIA>(`${this.apiUrl}/${id}/mensajes/`, {
      contenido,
    });
  }

  guardarMateriales(
    id: number,
    descripcionProyecto: string,
    materiales: MaterialIA[]
  ): Observable<ConversacionIA> {
    return this.http.post<ConversacionIA>(`${this.apiUrl}/${id}/materiales/`, {
      descripcion_proyecto: descripcionProyecto,
      materiales,
    });
  }

  anadirMaterialesSugeridos(id: number): Observable<ConversacionIA> {
    return this.http.post<ConversacionIA>(`${this.apiUrl}/${id}/materiales_sugeridos/`, {});
  }

  estimarMateriales(id: number): Observable<RespuestaMensajeIA> {
    return this.http.post<RespuestaMensajeIA>(`${this.apiUrl}/${id}/estimar/`, {});
  }
}