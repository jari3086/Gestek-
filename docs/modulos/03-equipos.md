# Módulo 3: Equipos

## Descripción
CRUD completo para el registro y gestión de equipos biomédicos asociados a clientes.

## Componentes

### Listado de equipos (`src/app/equipos/page.tsx`)
- **Tipo**: Server Component
- **Descripción**: Tabla con todos los equipos registrados, filtrables por cliente
- **Datos de entrada**: Parámetros de consulta (cliente_id)
- **Datos de salida**: Lista de equipos con datos de cliente asociado

### Nuevo equipo (`src/app/equipos/nuevo/page.tsx`)
- **Tipo**: Client Component
- **Descripción**: Formulario de registro de nuevo equipo
- **Datos de entrada**:
  - Nombre del equipo (requerido)
  - Cliente asociado (requerido, seleccionable)
  - Tipo de equipo
  - Marca, Modelo, Serie
  - Accesorios
  - Ubicación
  - Fechas de mantenimiento (último y próximo)
  - Periodicidad de mantenimiento (meses)
- **Datos de salida**: Nuevo registro en tabla `equipos`

### Detalle del equipo (`src/app/equipos/[id]/page.tsx`)
- **Tipo**: Server Component
- **Descripción**: Vista detallada del equipo con historial de mantenimientos

### Editar equipo (`src/app/equipos/[id]/editar/page.tsx`)
- **Tipo**: Client Component
- **Descripción**: Formulario pre-cargado para modificar datos del equipo

## API Routes
- `GET /api/equipos` — Lista equipos (con filtro `?cliente_id=`)
- `GET /api/equipos/[id]` — Equipo específico con datos del cliente

## Funciones Server Action (`src/lib/actions/equipos.ts`)
- `crearEquipo`: Crea nuevo equipo
- `actualizarEquipo`: Actualiza datos del equipo
- `eliminarEquipo`: Elimina equipo y mantenimientos asociados

## Validación (Zod)
```typescript
export const equipoSchema = z.object({
  nombre: z.string().min(1).max(200),
  tipo: z.string().min(1).max(100),
  marca: z.string().max(100).optional(),
  modelo: z.string().max(100).optional(),
  serie: z.string().min(1).max(100),
  ubicacion: z.string().min(1).max(300),
  cliente_id: z.string().uuid(),
  periodicidad_mantenimiento: z.coerce.number().int().min(0).max(60).optional(),
});
```
