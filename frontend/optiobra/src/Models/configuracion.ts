export interface ConfiguracionEmpresa {
  id: number;
  nombre_empresa: string;
  nit_runc: string;
  direccion: string;
  telefono: string;
  email_contacto: string;
  moneda_principal: string;
  logo_url: string;
  creado_en: string;
  actualizado_en: string;
}

export interface ConfiguracionSistema {
  id: number;
  alerta_stock_minimo_defecto: number;
  dias_notificacion_vencimiento: number;
  modo_mantenimiento: boolean;
  formato_fecha: string;
  notificaciones_email: boolean;
  creado_en: string;
  actualizado_en: string;
}

export interface ConfiguracionGeneral {
  empresa: ConfiguracionEmpresa;
  sistema: ConfiguracionSistema;
}
