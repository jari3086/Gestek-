# Módulo 8: Empleados

## Descripción
Gestión de usuarios con rol de técnico. Los técnicos pueden generar informes y ver los mantenimientos asignados.

## Componentes

### Listado de empleados (`src/app/empleados/page.tsx`)
- **Tipo**: Server Component
- **Descripción**: Tabla de empleados/técnicos registrados
- **Datos de salida**: Lista de empleados con acciones

### Nuevo empleado (`src/app/empleados/nuevo/page.tsx`)
- **Tipo**: Client Component
- **Descripción**: Formulario de registro de nuevo técnico
- **Datos de entrada**:
  - Nombre completo
  - Email (usado como credencial)
  - Contraseña
  - Teléfono
- **Datos de salida**: Nuevo perfil en `profiles` con rol `tecnico`

## Esquema de base de datos
- Misma tabla `profiles` que clientes y administradores, diferenciados por el campo `role = 'tecnico'`

## Flujo de trabajo
1. Admin crea técnico con email y contraseña
2. Técnico inicia sesión y accede al dashboard con opciones limitadas
3. Técnico puede generar informes desde `/informes/nuevo`
4. Técnico ve solo sus propios mantenimientos en el listado
