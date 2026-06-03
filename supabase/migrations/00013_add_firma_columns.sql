-- Add signature columns to mantenimientos table
alter table mantenimientos
  add column if not exists firma_tecnico text,
  add column if not exists firma_aprobador text,
  add column if not exists firma_recibe text;
