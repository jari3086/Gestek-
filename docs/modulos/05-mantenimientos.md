# Módulo 5: Mantenimientos

## Descripción
Historial de mantenimientos realizados sobre los equipos. Cada mantenimiento genera un informe PDF asociado.

## Componentes

### Listado de mantenimientos (`src/app/mantenimientos/page.tsx`)
- **Tipo**: Server Component
- **Descripción**: Tabla con el historial completo de mantenimientos
- **Datos de entrada**: Filtros opcionales (equipo, técnico, fechas)
- **Datos de salida**: Lista de mantenimientos con estado (pendiente/completado)

## Relaciones
- Cada mantenimiento pertenece a un equipo (`equipo_id`)
- Cada mantenimiento puede tener un informe PDF asociado (`pdf_url`)
- Los mantenimientos son creados desde el flujo de "Generar informe"

## Estados
- `pendiente`: Mantenimiento programado no completado
- `completado`: Mantenimiento realizado con informe generado

## Esquema de base de datos
- Tabla `mantenimientos`:
  - `id` UUID PRIMARY KEY
  - `equipo_id` UUID REFERENCES equipos(id)
  - `tipo` TEXT NOT NULL
  - `fecha` TEXT
  - `tecnico_id` UUID REFERENCES profiles(id)
  - `estado` TEXT DEFAULT 'pendiente'
  - `pdf_url` TEXT
  - `created_at` TIMESTAMPTZ DEFAULT NOW()
