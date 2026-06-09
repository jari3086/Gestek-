# Módulo 9: Dashboard

## Descripción
Panel de control principal que muestra estadísticas resumidas, alertas y accesos rápidos según el rol del usuario.

## Componentes

### Página principal (`src/app/dashboard/page.tsx`)
- **Tipo**: Server Component
- **Descripción**: Panel con tarjetas de resumen, alertas y acciones rápidas

### Tarjetas de resumen
| Tarjeta | Descripción | Visible para |
|---------|-------------|--------------|
| Mantenimientos | Total, completados, pendientes | Admin, Técnico |
| Equipos | Total de equipos registrados | Todos |
| Informes | Total de informes generados | Todos |

### Alertas
- Mantenimientos vencidos (fecha ya pasada)
- Mantenimientos próximos a vencer (próximos 30 días)
- Facturas impagas (solo admin)

### Acciones rápidas (admin)
- Nuevo cliente
- Nuevo equipo
- Nuevo mantenimiento
- Plantillas
- Nueva factura
- Generar informe
- Enviar recordatorios

### RecordatoriosButton (`src/app/dashboard/_components/RecordatoriosButton.tsx`)
- **Tipo**: Client Component
- **Descripción**: Botón que envía recordatorios de mantenimiento por email
- **Datos de entrada**: Ninguno
- **Datos de salida**: Emails enviados a clientes con mantenimientos próximos

## Datos de entrada (consultas)
- Conteo de equipos, mantenimientos, pendientes y completados (según rol)
- Equipos con mantenimiento vencido o próximo
- Facturas en estado "emitida"
- Todos los datos se filtran según el rol del usuario autenticado

## Datos de salida
- Interfaz con tarjetas de estadísticas
- Sección de alertas condicional (solo si hay datos relevantes)
- Acciones rápidas según el rol
