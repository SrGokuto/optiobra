export interface MaterialIA {
  nombre: string;
  unidad: string;
}

export interface MensajeIA {
  id: number;
  rol: 'usuario' | 'asistente';
  contenido: string;
  creado_en: string;
}

export interface ConversacionIA {
  id: number;
  titulo: string;
  tipo: string;
  descripcion_proyecto?: string | null;
  materiales: MaterialIA[];
  total_mensajes: number;
  ultimo_mensaje?: {
    rol: string;
    contenido: string;
    creado_en: string;
  } | null;
  usuario: number;
  usuario_nombre: string;
  creado_en: string;
  actualizado_en: string;
}

export interface ConversacionPayload {
  titulo?: string;
}

export interface RespuestaMensajeIA {
  success: boolean;
  mensaje: MensajeIA;
  model?: string;
  duration_ms?: number;
  error?: string;
  message?: string;
}