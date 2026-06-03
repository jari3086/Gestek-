export type UserRole = "administrador" | "tecnico" | "cliente";

export interface Profile {
  id: string;
  role: UserRole;
  nombre: string;
  email: string;
  telefono?: string;
  nit?: string;
  direccion?: string;
  ciudad?: string;
  logo_url?: string;
  regimen?: string;
  tipo_persona?: string;
  departamento?: string;
  codigo_postal?: string;
  created_at: string;
}

export interface Equipo {
  id: string;
  nombre: string;
  id_cliente?: string;
  marca?: string;
  modelo?: string;
  serie: string;
  accesorios?: string;
  ubicacion: string;
  cliente_id: string;
  creado_por: string;
  fecha_ultimo_mantenimiento?: string;
  fecha_proximo_mantenimiento?: string;
  fecha_ultima_calibracion?: string;
  fecha_proxima_calibracion?: string;
  periodicidad_mantenimiento?: number | null;
  created_at: string;
  updated_at: string;
}

export interface Mantenimiento {
  id: string;
  equipo_id: string;
  tipo: "preventivo" | "correctivo" | "calibracion";
  fecha: string;
  tecnico_id: string;
  estado: "pendiente" | "completado";
  pdf_url?: string;
  observaciones?: string;
  created_at: string;
}

export interface Factura {
  id: string;
  cliente_id: string;
  mantenimiento_id?: string;
  monto: number;
  fecha: string;
  estado: "emitida" | "pagada" | "anulada";
  pdf_url?: string;
  created_at: string;
  // Columnas DIAN (preparación)
  subtotal?: number | null;
  total_iva?: number | null;
  total?: number | null;
  iva?: Record<string, unknown> | null;
  retencion_fuente?: number | null;
  retencion_iva?: number | null;
  retencion_ica?: number | null;
  tipo_documento?: string | null;
  prefijo?: string | null;
  numero_consecutivo?: number | null;
  fecha_emision?: string | null;
  fecha_vencimiento?: string | null;
  forma_pago?: string | null;
  medio_pago?: string | null;
  moneda?: string | null;
  cufe?: string | null;
  estado_dian?: string | null;
  dian_response?: Record<string, unknown> | null;
  xml_firmado?: string | null;
}

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, "created_at">;
        Update: Partial<Omit<Profile, "id">>;
      };
      equipos: {
        Row: Equipo;
        Insert: Omit<Equipo, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Equipo, "id">>;
      };
      mantenimientos: {
        Row: Mantenimiento;
        Insert: Omit<Mantenimiento, "id" | "created_at">;
        Update: Partial<Omit<Mantenimiento, "id">>;
      };
      facturas: {
        Row: Factura;
        Insert: Omit<Factura, "id" | "created_at">;
        Update: Partial<Omit<Factura, "id">>;
      };
    };
  };
};
