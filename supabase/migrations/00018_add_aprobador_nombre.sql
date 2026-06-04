-- Add aprobador_nombre column to mantenimientos table
alter table mantenimientos
  add column if not exists aprobador_nombre text;
