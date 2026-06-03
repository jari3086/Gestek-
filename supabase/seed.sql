-- ============================================
-- seed.sql — Datos de ejemplo para desarrollo local
-- Ejecutar con: supabase db reset (solo local)
-- NO ejecutar en producción
-- ============================================

-- Solo insertar si la tabla está vacía (idempotente)
do $$
begin
  if exists (select 1 from public.profiles limit 1) then
    return;
  end if;

  -- 1. Clientes de ejemplo (sin auth.users — solo para desarrollo local)
  insert into public.profiles (id, role, nombre, email, telefono, nit, direccion, ciudad, departamento, regimen, tipo_persona)
  values
    (gen_random_uuid(), 'cliente', 'Hospital Central SAS',    'contacto@hospitalcentral.com', '+57 601 2345678', '900123456-7', 'Carrera 45 # 23-15', 'Bogotá',    'Cundinamarca',  'comun',        'juridica'),
    (gen_random_uuid(), 'cliente', 'Clinica del Norte',       'info@clinicadelnorte.com',     '+57 605 9876543', '800789012-3', 'Calle 80 # 12-34',   'Barranquilla', 'Atlántico',   'comun',        'juridica'),
    (gen_random_uuid(), 'cliente', 'Centro Medico Los Andes', 'admin@cmlosandes.com',         '+57 602 4567890', '700345678-9', 'Av 5N # 20-10',      'Cali',         'Valle del Cauca', 'simplificado', 'juridica');

  -- 2. Equipos de ejemplo (referenciando clientes por subconsulta)
  insert into public.equipos (id, nombre, marca, modelo, serie, ubicacion, cliente_id, creado_por, fecha_ultimo_mantenimiento, fecha_proximo_mantenimiento, periodicidad_mantenimiento)
  select
    gen_random_uuid(), 'Ventilador Mecánico',   'Drager',   'Savina 300',  'DRG-2024-001', 'UCIA - Piso 3',  id, id, '2025-12-15', '2026-06-15', 6
  from public.profiles where email = 'contacto@hospitalcentral.com';

  insert into public.equipos (id, nombre, marca, modelo, serie, ubicacion, cliente_id, creado_por, fecha_ultimo_mantenimiento, fecha_proximo_mantenimiento, periodicidad_mantenimiento)
  select
    gen_random_uuid(), 'Monitor de Signos Vitales', 'Philips', 'IntelliVue MX500', 'PH-2024-002', 'UCIB - Piso 3', id, id, '2026-01-10', '2026-07-10', 6
  from public.profiles where email = 'contacto@hospitalcentral.com';

  insert into public.equipos (id, nombre, marca, modelo, serie, ubicacion, cliente_id, creado_por, fecha_ultimo_mantenimiento, fecha_proximo_mantenimiento, periodicidad_mantenimiento)
  select
    gen_random_uuid(), 'Desfibrilador', 'Zoll', 'R Series', 'ZL-2023-015', 'Urgencias', id, id, '2026-02-01', '2026-08-01', 6
  from public.profiles where email = 'info@clinicadelnorte.com';

  insert into public.equipos (id, nombre, marca, modelo, serie, ubicacion, cliente_id, creado_por, fecha_ultimo_mantenimiento, fecha_proximo_mantenimiento, periodicidad_mantenimiento)
  select
    gen_random_uuid(), 'Bomba de Infusión', 'Baxter', 'Sigma Spectrum', 'BX-2024-008', 'Hospitalización', id, id, '2025-11-20', '2026-05-20', 6
  from public.profiles where email = 'admin@cmlosandes.com';

  -- 3. Facturas de ejemplo
  insert into public.facturas (id, cliente_id, monto, fecha, estado, subtotal, total_iva, total, tipo_documento, forma_pago, moneda)
  select
    gen_random_uuid(), id, 2500000, '2026-05-01', 'emitida', 2100840.34, 399159.66, 2500000, 'factura', 'contado', 'COP'
  from public.profiles where email = 'contacto@hospitalcentral.com';

  insert into public.facturas (id, cliente_id, monto, fecha, estado, subtotal, total_iva, total, tipo_documento, forma_pago, moneda)
  select
    gen_random_uuid(), id, 1800000, '2026-05-15', 'pagada', 1512605.04, 287394.96, 1800000, 'factura', 'credito', 'COP'
  from public.profiles where email = 'info@clinicadelnorte.com';

  insert into public.facturas (id, cliente_id, monto, fecha, estado, subtotal, total_iva, total, tipo_documento, forma_pago, moneda)
  select
    gen_random_uuid(), id, 950000, '2026-05-20', 'emitida', 798319.33, 151680.67, 950000, 'factura', 'contado', 'COP'
  from public.profiles where email = 'admin@cmlosandes.com';

  -- 4. Plantillas de ejemplo
  insert into public.plantillas (id, nombre, items)
  values
    (gen_random_uuid(), 'Checklist Ventilador Mecánico',
     '[
       {"item": "Filtros en buen estado", "tipo": "check"},
       {"item": "Calibración de sensores", "tipo": "check"},
       {"item": "Conexiones y mangueras sin fugas", "tipo": "check"},
       {"item": "Batería de respaldo funcional", "tipo": "check"},
       {"item": "Lectura de parámetros dentro de rango", "tipo": "check"}
     ]'::jsonb),
    (gen_random_uuid(), 'Checklist Monitor de Signos',
     '[
       {"item": "Pantalla sin daños", "tipo": "check"},
       {"item": "Cables y sensores en buen estado", "tipo": "check"},
       {"item": "Alarmas funcionales", "tipo": "check"},
       {"item": "Batería interna operativa", "tipo": "check"},
       {"item": "Precisión de lectura vs patrón", "tipo": "numerico"}
     ]'::jsonb);

  -- 5. Configuración fiscal de ejemplo
  insert into public.config_fiscal (empresa, nit, regimen, direccion, ciudad, departamento)
  values ('Gestek SAS', '901123456-7', 'comun', 'Calle 100 # 15-20', 'Bogotá', 'Cundinamarca')
  on conflict do nothing;

end $$;
