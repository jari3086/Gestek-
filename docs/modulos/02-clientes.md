# Módulo 2: Clientes

## Descripción
CRUD completo para la gestión de clientes. Cada cliente puede tener uno o más equipos asociados.

## Componentes

### Listado de clientes (`src/app/clientes/page.tsx`)
- **Tipo**: Server Component
- **Descripción**: Tabla con todos los clientes registrados
- **Datos de entrada**: Parámetros de consulta opcionales (filtros)
- **Datos de salida**: Lista de clientes con acciones (editar, eliminar)

### Nuevo cliente (`src/app/clientes/nuevo/page.tsx`)
- **Tipo**: Client Component
- **Descripción**: Formulario de registro de nuevo cliente
- **Datos de entrada**:
  - Nombre / Razón social (requerido)
  - NIT
  - Teléfono
  - Dirección
  - Ciudad, Departamento, Código postal
  - Régimen (Común / Simplificado)
  - Tipo persona (Jurídica / Natural)
  - Logo del cliente (archivo imagen)
  - Email (requerido, usado como credencial de acceso)
  - Contraseña (mínimo 6 caracteres)
- **Datos de salida**: Nuevo registro en tabla `profiles` con rol `cliente`

### Editar cliente (`src/app/clientes/[id]/editar/page.tsx`)
- **Tipo**: Client Component
- **Descripción**: Formulario pre-cargado para modificar datos del cliente
- **Datos de entrada**: Mismos campos que creación, pre-cargados
- **Datos de salida**: Actualización en tabla `profiles`

### Detalle del cliente (`src/app/clientes/[id]/page.tsx`)
- **Tipo**: Server Component
- **Descripción**: Vista detallada del cliente con sus equipos asociados

## API Routes
- `GET /api/clientes` — Lista todos los clientes
- `GET /api/clientes?id={id}` — Cliente específico

## Funciones Server Action (`src/lib/actions/clientes.ts`)
- `crearCliente`: Crea perfil + usuario auth + sube logo
- `actualizarCliente`: Actualiza datos del cliente
- `eliminarCliente`: Elimina cliente y sus datos asociados

## Validación (Zod)
```typescript
export const clienteSchema = z.object({
  nombre: z.string().min(1).max(200),
  email: z.string().email(),
  telefono: z.string().optional(),
  nit: z.string().optional(),
  direccion: z.string().optional(),
  ciudad: z.string().optional(),
  departamento: z.string().optional(),
  // ... más campos opcionales
});
```
