# Plan de Mantenimiento y Soporte de Software

## GESTEK — Sistema de Gestión de Equipos Biomédicos

**Basado en ISO/IEC 14764:2006 — Software Engineering — Software Life Cycle Processes — Maintenance**

---

| Versión | Fecha | Autor | Descripción |
|---------|-------|-------|-------------|
| 1.0 | Julio 2026 | Equipo de Mantenimiento | Versión inicial del plan |

---

## 1. Descripción del Sistema

### 1.1 Nombre del Sistema
**GESTEK** — Sistema de Gestión de Equipos Biomédicos

### 1.2 Propósito
Sistema web para la gestión de inventario, mantenimiento, generación de informes técnicos, y facturación de equipos biomédicos. Está orientado a empresas de servicios biomédicos que requieren controlar el ciclo de vida completo de los equipos de sus clientes.

### 1.3 Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | Next.js 16 (App Router), React 19, TypeScript |
| Estilos | Tailwind CSS v4 |
| Base de datos | PostgreSQL (Supabase) |
| Autenticación | Supabase Auth (SSR con cookies) |
| Almacenamiento | Supabase Storage |
| Generación de PDF | @react-pdf/renderer |
| Correo electrónico | Resend |
| Rate limiting | Upstash Redis + Ratelimit |
| PWA | Serwist |
| Testing | Vitest |
| Imágenes | sharp |

### 1.4 Módulos del Sistema

1. **Autenticación** — Login/logout con roles (administrador, técnico, cliente)
2. **Clientes** — CRUD de clientes con logo, datos fiscales y sedes
3. **Equipos** — CRUD de equipos biomédicos con fechas de mantenimiento
4. **Informes** — Generación de PDF con checklist, fotos y firmas digitales
5. **Mantenimientos** — Historial de mantenimientos por equipo
6. **Facturación** — Facturas con preparación DIAN
7. **Plantillas** — Checklist personalizables por tipo de equipo
8. **Empleados** — Gestión de usuarios técnicos
9. **Dashboard** — Panel con estadísticas y alertas de mantenimiento

### 1.5 Usuarios del Sistema

| Rol | Descripción |
|-----|-------------|
| Administrador | Acceso completo a todas las funcionalidades |
| Técnico | Gestión de equipos, informes y mantenimientos asignados |
| Cliente | Visualización de sus equipos, informes y facturas |

### 1.6 Arquitectura
Aplicación web full-stack con Next.js 16 (App Router) desplegada en Vercel. Base de datos PostgreSQL administrada por Supabase con autenticación integrada. El sistema utiliza server actions para operaciones CRUD, middleware para control de sesión y rate limiting, y generación de PDF del lado del servidor.

---

## 2. Proceso de Implementación

### 2.1 Fundamentos ISO/IEC 14764:2006

La norma ISO/IEC 14764:2006 define el mantenimiento de software como el proceso de modificación de un producto software después de su entrega para corregir fallos, mejorar el rendimiento u otros atributos, o adaptarlo a un entorno cambiante. Establece cuatro categorías de mantenimiento:

| Tipo | Definición |
|------|-----------|
| **Correctivo** | Modificación reactiva para corregir problemas o fallos descubiertos |
| **Adaptativo** | Modificación para mantener el software usable en un entorno cambiante |
| **Perfectivo** | Modificación para mejorar rendimiento, usabilidad o mantenibilidad |
| **Preventivo** | Modificación para detectar y corregir fallos latentes antes de que ocurran |

### 2.2 Estrategia de Mantenimiento

Se adopta un modelo de mantenimiento **híbrido** que combina:

- **Mantenimiento preventivo programado**: Revisiones periódicas con frecuencia definida (semanal, mensual, trimestral, anual).
- **Mantenimiento correctivo bajo demanda**: Atención a incidentes reportados por usuarios o detectados por monitoreo.
- **Mantenimiento adaptativo planificado**: Actualizaciones por cambios en el entorno (Supabase, Next.js, dependencias).
- **Mantenimiento perfectivo continuo**: Mejoras incrementales priorizadas en el backlog.

### 2.3 Roles y Responsabilidades

| Rol | Responsabilidades |
|-----|-------------------|
| Administrador del sistema | Supervisión general, asignación de prioridades, aprobación de cambios |
| Ingeniero de soporte | Atención de incidentes, diagnóstico y resolución de problemas |
| Desarrollador de mantenimiento | Implementación de correcciones y mejoras, pruebas |
| QA / Tester | Validación de cambios, pruebas de regresión |
| DevOps | Gestión de despliegues, monitoreo de infraestructura |

### 2.4 Herramientas y Recursos

| Herramienta | Propósito |
|-------------|-----------|
| Git + GitHub | Control de versiones |
| GitHub Issues / Projects | Seguimiento de incidencias y tareas |
| Supabase Dashboard | Monitoreo de base de datos y almacenamiento |
| Upstash Console | Monitoreo de rate limiting |
| Vercel Dashboard | Monitoreo de despliegues y rendimiento |
| Resend Dashboard | Monitoreo de envío de correos |
| Vitest | Pruebas unitarias y de regresión |
| ESLint | Análisis estático de código |

### 2.5 Proceso General de Mantenimiento

El proceso sigue el ciclo definido por ISO/IEC 14764:2006:

1. **Registro de solicitud** — Reporte de incidente o solicitud de cambio
2. **Análisis** — Clasificación, priorización y estimación de esfuerzo
3. **Implementación** — Desarrollo de la modificación
4. **Revisión** — Pruebas y validación
5. **Aceptación** — Verificación por el solicitante
6. **Despliegue** — Puesta en producción
7. **Cierre** — Documentación y actualización de registros

---

## 3. Análisis de Modificación y Problemas

### 3.1 Clasificación de Incidentes

Los incidentes se clasifican según su severidad:

| Severidad | Descripción | Tiempo de Respuesta | Tiempo de Resolución |
|-----------|-------------|---------------------|---------------------|
| **Crítica (P1)** | Sistema no disponible, pérdida de datos, fallo de seguridad | 1 hora | 4 horas |
| **Alta (P2)** | Funcionalidad principal afectada sin workaround | 4 horas | 24 horas |
| **Media (P3)** | Funcionalidad secundaria afectada, existe workaround | 24 horas | 72 horas |
| **Baja (P4)** | Problema cosmético, mejora solicitada | 1 semana | 2 semanas |

### 3.2 Proceso de Análisis

Al recibir una solicitud de mantenimiento:

1. **Registro** — Se documenta en el sistema de seguimiento con toda la información disponible (capturas, logs, pasos para reproducir).
2. **Clasificación** — Se determina el tipo de mantenimiento (correctivo, adaptativo, perfectivo, preventivo) y la severidad.
3. **Diagnóstico inicial** — Se verifica si el problema es reproducible, se revisan logs y métricas.
4. **Asignación** — Se asigna al responsable según el área afectada (frontend, backend, base de datos, infraestructura).
5. **Estimación** — Se estima el esfuerzo y se define si requiere parche urgente o puede incluirse en el ciclo regular.

### 3.3 Análisis de Causa Raíz (RCA)

Para incidentes críticos o recurrentes se realiza un análisis de causa raíz documentando:

- Descripción del problema
- Línea de tiempo de eventos
- Causa raíz identificada
- Acciones correctivas implementadas
- Acciones preventivas para evitar recurrencia
- Lecciones aprendidas

### 3.4 Base de Conocimiento

Cada incidente resuelto se documenta en una base de conocimiento que incluye:

- Síntoma del problema
- Causa identificada
- Solución aplicada
- Comandos o procedimientos utilizados
- Enlaces a documentación relacionada

---

## 4. Implementación de la Modificación

### 4.1 Flujo de Trabajo

1. **Crear rama** — `fix/descripcion-corta` para correctivos, `feat/descripcion` para perfectivos/adaptativos
2. **Desarrollar** — Seguir las convenciones del proyecto (TypeScript, ESLint, componentes server/client)
3. **Ejecutar lint** — `npm run lint` (ESLint)
4. **Ejecutar pruebas** — `npm test` (Vitest)
5. **Pruebas manuales** — Verificar funcionalidad en entorno de desarrollo
6. **Code review** — Pull request con revisión de al menos un par
7. **Pruebas de regresión** — Ejecutar suite completa de tests
8. **Merge** — Integrar a la rama principal
9. **Despliegue** — Vercel despliega automáticamente desde la rama principal

### 4.2 Criterios de Aceptación para Cambios

- Código pasa ESLint sin errores
- Tests existentes pasan
- Tests nuevos cubren el cambio (si aplica)
- No se introducen regresiones en funcionalidades existentes
- La funcionalidad cumple con los requisitos especificados
- La interfaz de usuario mantiene consistencia visual
- El cambio es accesible (roles y permisos correctos)

### 4.3 Priorización de Mantenimiento Preventivo

El mantenimiento preventivo se ejecuta según la siguiente tabla:

| Actividad | Frecuencia | Responsable |
|-----------|-----------|-------------|
| Revisión de dependencias con vulnerabilidades conocidas | Semanal | DevOps |
| Monitoreo de rendimiento de base de datos | Semanal | Administrador |
| Revisión de logs de errores | Diaria | Ingeniero de soporte |
| Actualización de dependencias (parches de seguridad) | Mensual | Desarrollador |
| Revisión de almacenamiento (Supabase Storage) | Mensual | Administrador |
| Pruebas de recuperación ante desastres | Trimestral | DevOps |
| Auditoría de seguridad y permisos | Trimestral | Administrador |
| Revisión de licencias de software | Anual | Administrador |

### 4.4 Mantenimiento Correctivo — Procedimiento de Parche Urgente

Para incidentes críticos (P1) que requieren intervención inmediata:

1. Se crea un hotfix desde la rama principal
2. Se implementa la corrección con pruebas mínimas
3. Se despliega directamente a producción (con aprobación del administrador)
4. Se realiza el análisis de causa raíz posterior
5. Se documenta el incidente
6. Se programa la corrección definitiva en el siguiente ciclo regular

---

## 5. Aceptación y Revisión del Mantenimiento

### 5.1 Criterios de Aceptación General

- El cambio ha sido probado en el entorno de staging
- Todas las pruebas automatizadas pasan
- La funcionalidad modificada opera según lo especificado
- Las funcionalidades existentes no presentan regresiones
- La documentación ha sido actualizada (si aplica)

### 5.2 Proceso de Revisión

1. **Revisión técnica** — El desarrollador responsable verifica la calidad del código y el cumplimiento de estándares.
2. **Revisión funcional** — El QA o el administrador verifica que la funcionalidad cumple los requisitos.
3. **Pruebas de usuario** — Cuando aplica, se solicita validación al usuario final (cliente o técnico).
4. **Aprobación final** — El administrador del sistema da la aprobación para el despliegue.

### 5.3 Cierre del Mantenimiento

Una vez aceptado y desplegado el cambio:

- Se cierra el ticket en el sistema de seguimiento
- Se actualiza la documentación técnica si corresponde
- Se actualiza el changelog del sistema
- Se comunica el cambio a los usuarios afectados
- Se archiva el registro de la intervención

---

## 6. Migración

### 6.1 Estrategia de Migración

La migración del sistema se ejecuta cuando existen cambios mayores que requieren:

- Cambio de proveedor de base de datos o infraestructura
- Actualización mayor del framework (Next.js, React)
- Cambio de arquitectura significativo
- Migración a un nuevo entorno de producción

### 6.2 Procedimiento de Migración

1. **Planificación** — Documentar el alcance, riesgos y cronograma de la migración.
2. **Backup completo** — Realizar backup de base de datos y almacenamiento antes de cualquier migración.
3. **Entorno de prueba** — Ejecutar la migración en un entorno aislado primero.
4. **Validación** — Verificar integridad de datos y funcionalidad post-migración.
5. **Migración en producción** — Ejecutar en horario de bajo uso con ventana de mantenimiento comunicada.
6. **Rollback plan** — Tener procedimiento documentado para revertir en caso de fallo.
7. **Post-migración** — Monitoreo intensivo durante 48 horas posteriores.

### 6.3 Criterios para Decidir una Migración

- El proveedor actual anuncia fin de soporte o cambios incompatibles
- Se requiere escalabilidad que la infraestructura actual no puede proporcionar
- El costo de operación supera alternativas disponibles
- Se identifican vulnerabilidades de seguridad no mitigables en la plataforma actual

---

## 7. Retiro

### 7.1 Criterios para el Retiro del Sistema

- El sistema ha sido reemplazado por una nueva versión o solución
- El costo de mantenimiento supera el valor que proporciona
- El stack tecnológico ha llegado al final de su vida útil sin posibilidad de migración
- Cambios regulatorios hacen inviable la operación del sistema

### 7.2 Procedimiento de Retiro

1. **Notificación** — Comunicar a todos los usuarios con al menos 3 meses de antelación.
2. **Exportación de datos** — Proveer mecanismos para que los usuarios exporten su información (equipos, mantenimientos, facturas, informes PDF).
3. **Archivo de datos** — Generar copia de seguridad completa de la base de datos y almacenamiento.
4. **Desactivación** — Deshabilitar el acceso de usuarios y detener los servicios.
5. **Cancelación de suscripciones** — Dar de baja servicios externos (Supabase, Vercel, Upstash, Resend).
6. **Documentación** — Archivar el código fuente, documentación y datos en un repositorio de respaldo.
7. **Período de retención** — Mantener los datos archivados por el período legal requerido (mínimo 5 años para datos fiscales según legislación colombiana).

### 7.3 Post-Retiro

- El código fuente se archiva en un repositorio privado con acceso restringido
- La documentación del sistema se conserva para referencia histórica
- Los datos de clientes se manejan según la política de privacidad y la ley de protección de datos (Ley 1581 de 2012 en Colombia)

---

## 8. Cronograma de Mantenimiento

### 8.1 Cronograma Anual (Julio 2026 — Junio 2027)

| Actividad | Tipo | Jul | Ago | Sep | Oct | Nov | Dic | Ene | Feb | Mar | Abr | May | Jun |
|-----------|------|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **Mantenimiento Preventivo** | | | | | | | | | | | | | |
| Revisión de dependencias con vulnerabilidades | Prev | • | • | • | • | • | • | • | • | • | • | • | • |
| Monitoreo de rendimiento BD | Prev | • | • | • | • | • | • | • | • | • | • | • | • |
| Revisión de logs de errores (diaria) | Prev | ◊ | ◊ | ◊ | ◊ | ◊ | ◊ | ◊ | ◊ | ◊ | ◊ | ◊ | ◊ |
| Actualización de dependencias (parches) | Prev | • | • | • | • | • | • | • | • | • | • | • | • |
| Revisión de almacenamiento Supabase | Prev | • | | • | | • | | • | | • | | • | |
| Pruebas de recuperación ante desastres | Prev | • | | | • | | | • | | | • | | |
| Auditoría de seguridad y permisos | Prev | • | | | • | | | • | | | • | | |
| Revisión de licencias de software | Prev | • | | | | | | | | | | | • |
| **Mantenimiento Adaptativo** | | | | | | | | | | | | | |
| Actualización Next.js (menor) | Adap | | | • | | | | | | • | | | |
| Actualización Supabase SDK | Adap | • | | | | • | | | | • | | | |
| Actualización dependencias mayores | Adap | | | | | | | • | | | | | |
| Compatibilidad navegadores | Adap | | | • | | | | • | | | | • | |
| **Mantenimiento Perfectivo** | | | | | | | | | | | | | |
| Mejoras en UI/UX | Perf | | • | | | • | | | • | | | • | |
| Optimización de rendimiento | Perf | | | | • | | | | • | | | | • |
| Mejoras en generación de PDF | Perf | | | • | | | • | | | • | | | |
| **Mantenimiento Correctivo** | | | | | | | | | | | | | |
| Atención de incidentes P1/P2 | Corr | ∞ | ∞ | ∞ | ∞ | ∞ | ∞ | ∞ | ∞ | ∞ | ∞ | ∞ | ∞ |
| Atención de incidentes P3/P4 | Corr | ∞ | ∞ | ∞ | ∞ | ∞ | ∞ | ∞ | ∞ | ∞ | ∞ | ∞ | ∞ |

**Leyenda:**
- • = Actividad programada
- ◊ = Actividad continua (diaria)
- ∞ = Actividad permanente (bajo demanda)

### 8.2 Hitos del Cronograma

| Fecha | Hito |
|------|------|
| Julio 2026 | Inicio del plan de mantenimiento. Auditoría inicial de seguridad. |
| Septiembre 2026 | Primera actualización adaptativa de Next.js y dependencias. |
| Diciembre 2026 | Cierre del semestre. Revisión de métricas y ajuste del plan. |
| Enero 2027 | Actualización mayor de dependencias. Backup completo. |
| Marzo 2027 | Auditoría de seguridad y permisos. Pruebas de recuperación. |
| Junio 2027 | Revisión anual. Actualización del plan de mantenimiento. |

### 8.3 Estimación de Esfuerzo Mensual

| Tipo de Mantenimiento | Horas/Mes | Porcentaje |
|-----------------------|-----------|------------|
| Preventivo | 16 h | 20% |
| Adaptativo | 8 h | 10% |
| Perfectivo | 16 h | 20% |
| Correctivo (incidentes) | 24 h | 30% |
| Gestión y documentación | 16 h | 20% |
| **Total** | **80 h** | **100%** |

*Equivalente a 0.5 FTE (1 persona a tiempo parcial)*

---

## 9. Métricas e Indicadores

### 9.1 KPIs de Mantenimiento

| Indicador | Descripción | Objetivo |
|-----------|-------------|----------|
| MTTR (Mean Time To Repair) | Tiempo promedio de resolución de incidentes | < 8 h (P1/P2) |
| Tasa de resolución en primera línea | % de incidentes resueltos sin escalar | > 70% |
| Cobertura de pruebas | % de código cubierto por pruebas | > 80% |
| Tiempo entre fallos (MTBF) | Tiempo promedio entre incidentes P1 | > 90 días |
| Satisfacción del usuario | Encuesta post-resolución | > 4/5 |
| Deuda técnica | % de código con problemas de mantenibilidad | < 15% |
| Cumplimiento de SLA | % de incidentes resueltos dentro del SLA | > 95% |

### 9.2 Reportes

- **Reporte semanal**: Incidentes atendidos, estado del sistema, alertas.
- **Reporte mensual**: KPIs, tendencias, análisis de causa raíz de incidentes.
- **Reporte trimestral**: Revisión de seguridad, actualizaciones pendientes, planificación.
- **Reporte anual**: Evaluación general del plan, recomendaciones para el siguiente período.

---

## 10. Plan de Contingencia

### 10.1 Escenarios de Contingencia

| Escenario | Acción | Responsable |
|-----------|--------|-------------|
| Caída de Supabase (BD/Storage) | Restaurar desde backup. Contactar soporte Supabase. | Administrador |
| Caída de Vercel | Verificar estado en status.vercel.com. Activar plan de rollback si es despliegue reciente. | DevOps |
| Fuga de seguridad | Revocar credenciales comprometidas. Aplicar parche de seguridad. Notificar a usuarios afectados. | Administrador |
| Pérdida de datos | Restaurar desde último backup. Investigar causa raíz. | Administrador |

### 10.2 Backup y Recuperación

- **Backup de base de datos**: Automático diario (retención 30 días)
- **Backup de almacenamiento**: Semanal (retención 3 meses)
- **Backup de código**: Git con respaldo remoto en GitHub
- **Pruebas de restauración**: Trimestrales

---

## 11. Aprobación

| Nombre | Rol | Fecha | Firma |
|--------|-----|------|-------|
| | Administrador del Sistema | | |
| | Director de Operaciones | | |
