# GESTEK — Sistema de Gestión de Equipos Biomédicos

## Descripción del proyecto

Sistema web para la gestión de inventario, mantenimiento, informes y facturación de equipos biomédicos. Permite a administradores, técnicos y clientes registrar, consultar y dar seguimiento a los servicios de mantenimiento realizados.

**URL de producción:** [https://gestek-gu3mihco8-juliana-agudelo-s-projects.vercel.app](https://gestek-gu3mihco8-juliana-agudelo-s-projects.vercel.app)

---

## Estructura de la documentación

### Módulos del sistema

| # | Módulo | Descripción |
|---|--------|-------------|
| 1 | [Autenticación](modulos/01-autenticacion.md) | Inicio de sesión, roles y control de acceso |
| 2 | [Clientes](modulos/02-clientes.md) | Registro y gestión de clientes |
| 3 | [Equipos](modulos/03-equipos.md) | Registro y gestión de equipos biomédicos |
| 4 | [Informes](modulos/04-informes.md) | Generación de informes PDF con checklist, fotos y firmas |
| 5 | [Mantenimientos](modulos/05-mantenimientos.md) | Historial de mantenimientos por equipo |
| 6 | [Facturación](modulos/06-facturacion.md) | Emisión de facturas con preparación DIAN |
| 7 | [Plantillas](modulos/07-plantillas.md) | Plantillas de checklist personalizables |
| 8 | [Empleados](modulos/08-empleados.md) | Gestión de usuarios técnicos |
| 9 | [Dashboard](modulos/09-dashboard.md) | Panel de control con estadísticas y alertas |

### Pruebas

- [Informe de pruebas unitarias](pruebas/informe-pruebas.md)

### Configuración

- [Servidores y base de datos](configuracion/servidores-bd.md)
- [Ambientes de desarrollo y pruebas](configuracion/ambientes.md)

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
| Procesamiento imágenes | Sharp |
| Testing | Vitest |
| Despliegue | Vercel |

## Roles del sistema

- **Administrador**: Acceso completo a todos los módulos
- **Técnico**: Gestión de informes y mantenimientos asignados
- **Cliente**: Consulta de equipos e informes visibles
