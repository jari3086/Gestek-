# GESTEK — Sistema de Gestión de Equipos Biomédicos

Sistema web para la gestión de inventario, mantenimiento, informes y facturación de equipos biomédicos.

**URL de producción:** [https://gestek-gu3mihco8-juliana-agudelo-s-projects.vercel.app](https://gestek-gu3mihco8-juliana-agudelo-s-projects.vercel.app)

---

## Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | Next.js 16 (App Router), React 19, TypeScript |
| Estilos | Tailwind CSS v4 |
| Base de datos | PostgreSQL (Supabase) |
| Autenticación | Supabase Auth (SSR) |
| Almacenamiento | Supabase Storage |
| PDF | @react-pdf/renderer |
| Testing | Vitest |

## Módulos

1. **Autenticación** — Login/logout con roles (admin, técnico, cliente)
2. **Clientes** — CRUD de clientes con logo y datos fiscales
3. **Equipos** — CRUD de equipos biomédicos con fechas de mantenimiento
4. **Informes** — Generación de PDF con checklist, fotos y firmas digitales
5. **Mantenimientos** — Historial de mantenimientos por equipo
6. **Facturación** — Facturas con preparación DIAN
7. **Plantillas** — Checklist personalizables por tipo de equipo
8. **Empleados** — Gestión de usuarios técnicos
9. **Dashboard** — Panel con estadísticas y alertas

## Requisitos

- Node.js 20.x+
- npm 10.x+
- Cuenta en Supabase (gratuita)
- Cuenta en Vercel (gratuita, opcional para deploy)

## Instalación

```bash
# Clonar el repositorio
git clone <url-del-repositorio>
cd biomed-inventory

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus credenciales de Supabase

# Iniciar servidor de desarrollo
npm run dev
```

## Variables de entorno

```env
NEXT_PUBLIC_SUPABASE_URL=https://<proyecto>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
RESEND_API_KEY=<resend-api-key>  # Opcional
```

## Scripts disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Compilación para producción |
| `npm start` | Servidor de producción |
| `npm run lint` | ESLint |
| `npm test` | Pruebas unitarias (Vitest) |

## Pruebas

```bash
npm test              # Una sola ejecución
npm run test:watch    # Modo desarrollo
```

Actualmente **41 pruebas** distribuidas en 3 archivos:
- `schemas.test.ts` — Validación Zod (20 casos)
- `rate-limit.test.ts` — Rate limiter (12 casos)
- `audit.test.ts` — Auditoría (9 casos)

## Documentación

La documentación completa del proyecto se encuentra en la carpeta [`docs/`](docs/):

- [Módulos del sistema](docs/modulos/)
- [Informe de pruebas](docs/pruebas/informe-pruebas.md)
- [Configuración de servidores y BD](docs/configuracion/servidores-bd.md)
- [Ambientes de desarrollo y pruebas](docs/configuracion/ambientes.md)

## Licencia

Uso académico — Tesis universitaria
