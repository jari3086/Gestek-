# Módulo 7: Plantillas

## Descripción
Gestión de plantillas de checklist utilizadas durante la generación de informes. Cada plantilla contiene una lista de ítems a evaluar.

## Componentes

### Listado de plantillas (`src/app/plantillas/page.tsx`)
- **Tipo**: Server Component
- **Descripción**: Tabla de plantillas disponibles
- **Datos de salida**: Lista de plantillas con acciones

### Nueva plantilla (`src/app/plantillas/nueva/page.tsx`)
- **Tipo**: Client Component
- **Descripción**: Formulario para crear plantilla con ítems
- **Datos de entrada**:
  - Nombre de la plantilla
  - Items de checklist (nombre, categoría, obligatorio)
- **Datos de salida**: Nuevo registro en `plantillas`

### Detalle / Editar plantilla (`src/app/plantillas/[id]/page.tsx`)
- **Tipo**: Server Component
- **Descripción**: Vista y edición de plantilla existente

## Estructura de datos
Cada plantilla almacena sus ítems como JSONB:
```json
{
  "nombre": "Checklist Ventilador Mecánico",
  "items": [
    { "id": "uuid", "nombre": "Filtros en buen estado", "categoria": "general", "obligatorio": true },
    { "id": "uuid", "nombre": "Calibración de sensores", "categoria": "calibración", "obligatorio": true }
  ]
}
```

## Esquema de base de datos
- Tabla `plantillas`:
  - `id` UUID PRIMARY KEY
  - `nombre` TEXT NOT NULL
  - `descripcion` TEXT
  - `items` JSONB NOT NULL
  - `created_at` TIMESTAMPTZ DEFAULT NOW()
