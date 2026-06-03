-- Add periodicidad_mantenimiento field to equipos
ALTER TABLE equipos
ADD COLUMN IF NOT EXISTS periodicidad_mantenimiento INTEGER DEFAULT NULL;
