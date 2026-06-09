# Módulo 1: Autenticación

## Descripción
Gestiona el inicio de sesión, cierre de sesión y control de acceso basado en roles (administrador, técnico, cliente).

## Componentes

### LoginPage (`src/app/login/page.tsx`)
- **Tipo**: Server Component + Formulario cliente
- **Descripción**: Pantalla de inicio de sesión con formulario de email y contraseña
- **Datos de entrada**: Email, contraseña
- **Datos de salida**: Redirección al dashboard tras autenticación exitosa
- **Validaciones**: Email válido, contraseña mínimo 6 caracteres (Zod schema)

### Server Actions (`src/lib/actions/auth.ts`)
- **Función `login`**:
  - **Entrada**: `email: string`, `password: string`
  - **Salida**: `{ success: true }` o `{ error: string }`
  - **Proceso**: Valida con Zod, autentica contra Supabase Auth, crea sesión SSR
- **Función `logout`**:
  - **Entrada**: Ninguna
  - **Salida**: Redirección a `/login`
  - **Proceso**: Cierra sesión en Supabase y limpia cookies

### Middleware (`src/middleware.ts`)
- Protege rutas según rol del usuario
- Redirige a `/login` si no hay sesión activa
- Redirige a `/dashboard` si ya hay sesión en la página de login

## Esquema de base de datos
- Tabla: `profiles`
  - `id` UUID (FK → auth.users)
  - `role` TEXT (administrador | tecnico | cliente)
  - `nombre` TEXT
  - `email` TEXT
  - `telefono` TEXT
  - `nit` TEXT
  - `direccion` TEXT
  - `ciudad` TEXT
  - `logo_url` TEXT

## Reglas RLS
- `INSERT`: Solo administradores
- `SELECT`: Usuarios ven su propio perfil; administradores ven todos
- `UPDATE`: Solo administradores
