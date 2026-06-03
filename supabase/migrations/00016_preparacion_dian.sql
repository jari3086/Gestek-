-- ============================================
-- 00016: Preparación para facturación electrónica DIAN
-- Agrega columnas fiscales a facturas y profiles
-- Todo es nullable/optional para no romper datos existentes
-- ============================================

-- === Facturas: columnas DIAN ===
ALTER TABLE facturas ADD COLUMN IF NOT EXISTS subtotal NUMERIC(12,2);
ALTER TABLE facturas ADD COLUMN IF NOT EXISTS total_iva NUMERIC(12,2) DEFAULT 0;
ALTER TABLE facturas ADD COLUMN IF NOT EXISTS total NUMERIC(12,2);
ALTER TABLE facturas ADD COLUMN IF NOT EXISTS iva JSONB;
ALTER TABLE facturas ADD COLUMN IF NOT EXISTS retencion_fuente NUMERIC(12,2) DEFAULT 0;
ALTER TABLE facturas ADD COLUMN IF NOT EXISTS retencion_iva NUMERIC(12,2) DEFAULT 0;
ALTER TABLE facturas ADD COLUMN IF NOT EXISTS retencion_ica NUMERIC(12,2) DEFAULT 0;
ALTER TABLE facturas ADD COLUMN IF NOT EXISTS tipo_documento TEXT DEFAULT 'factura';
ALTER TABLE facturas ADD COLUMN IF NOT EXISTS prefijo TEXT;
ALTER TABLE facturas ADD COLUMN IF NOT EXISTS numero_consecutivo INTEGER;
ALTER TABLE facturas ADD COLUMN IF NOT EXISTS fecha_emision TIMESTAMPTZ;
ALTER TABLE facturas ADD COLUMN IF NOT EXISTS fecha_vencimiento DATE;
ALTER TABLE facturas ADD COLUMN IF NOT EXISTS forma_pago TEXT DEFAULT 'contado';
ALTER TABLE facturas ADD COLUMN IF NOT EXISTS medio_pago TEXT;
ALTER TABLE facturas ADD COLUMN IF NOT EXISTS moneda TEXT DEFAULT 'COP';
ALTER TABLE facturas ADD COLUMN IF NOT EXISTS cufe TEXT;
ALTER TABLE facturas ADD COLUMN IF NOT EXISTS estado_dian TEXT DEFAULT 'pendiente';
ALTER TABLE facturas ADD COLUMN IF NOT EXISTS dian_response JSONB;
ALTER TABLE facturas ADD COLUMN IF NOT EXISTS xml_firmado TEXT;

-- === Profiles: datos fiscales del cliente ===
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS regimen TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS tipo_persona TEXT DEFAULT 'juridica';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS departamento TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS codigo_postal TEXT;

-- === Nueva tabla: configuración fiscal del emisor (Gestek) ===
CREATE TABLE IF NOT EXISTS config_fiscal (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa TEXT NOT NULL DEFAULT 'Gestek',
  nit TEXT NOT NULL DEFAULT '',
  regimen TEXT NOT NULL DEFAULT 'comun',
  direccion TEXT,
  ciudad TEXT,
  departamento TEXT,
  telefono TEXT,
  email TEXT,
  logo_url TEXT,
  resolucion_numero TEXT,
  resolucion_prefijo TEXT,
  resolucion_desde INTEGER,
  resolucion_hasta INTEGER,
  resolucion_fecha_expiracion DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insertar fila por defecto si no existe
INSERT INTO config_fiscal (empresa, nit)
SELECT 'Gestek', ''
WHERE NOT EXISTS (SELECT 1 FROM config_fiscal LIMIT 1);

-- Índices
CREATE INDEX IF NOT EXISTS idx_facturas_cufe ON facturas(cufe);
CREATE INDEX IF NOT EXISTS idx_facturas_estado_dian ON facturas(estado_dian);
CREATE INDEX IF NOT EXISTS idx_facturas_consecutivo ON facturas(prefijo, numero_consecutivo);
