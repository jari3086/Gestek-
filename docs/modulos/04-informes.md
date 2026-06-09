# Módulo 4: Informes

## Descripción
Módulo principal del sistema. Permite generar informes PDF de servicio técnico con checklist, fotografías, firmas digitales y observaciones.

## Componentes

### Generar informe (`src/app/informes/nuevo/page.tsx`)
- **Tipo**: Client Component
- **Descripción**: Formulario multi-paso para crear un informe completo
- **Datos de entrada (ordenados)**:
  1. Datos del cliente (seleccionable)
  2. Datos del equipo (seleccionable según cliente)
  3. Datos del servicio (tipo, N° informe, orden servicio, fecha, profesional)
  4. Observaciones iniciales
  5. Lista de chequeo (selección de plantilla + evaluación ítem por ítem)
  6. Conclusiones
  7. Anexo fotográfico (fotos desde dispositivo)
  8. Firmas (profesional que ejecuta, aprueba, recibe)
- **Datos de salida**: 
  - Registro en `mantenimientos`
  - Registro en `checklist_resultados`
  - Registros en `fotos_mantenimiento`
  - PDF generado y subido a Storage

### Detalle del informe (`src/app/informes/[id]/page.tsx`)
- **Tipo**: Server Component
- **Descripción**: Vista del informe generado con opciones de descarga, email, edición y eliminación
- **Acciones disponibles para administrador**:
  - Editar informe completo (todos los campos)
  - Alternar visibilidad para el cliente
  - Enviar por email
  - Eliminar informe

### Editar informe (`src/app/informes/_components/EditarInformeForm.tsx`)
- **Tipo**: Client Component
- **Descripción**: Formulario completo de edición con todos los campos del informe
- **Datos editables**: Tipo, fecha, N° informe, orden servicio, profesional, observaciones, checklist, conclusiones, fotos, firmas

### Listado de informes (`src/app/informes/page.tsx`)
- **Tipo**: Server Component
- **Descripción**: Tabla de informes generados con filtros por cliente, equipo y técnico

## API Routes
- `POST /api/informes/generar` — Genera PDF y guarda registro
- `GET /api/informes/pdf` — Descarga PDF existente

## Funciones Server Action (`src/lib/actions/informes.ts`)
- `actualizarInforme`: Actualiza todos los campos + checklist + fotos + regenera PDF
- `toggleVisibilidad`: Controla visibilidad para el cliente
- `enviarEmailManual`: Envía PDF por email al cliente
- `eliminarInforme`: Elimina informe y archivos asociados
- `enviarRecordatoriosMantenimiento`: Envía recordatorios automáticos

## Generación de PDF (`src/lib/pdf/`)
- `generate-pdf.ts` — Orquesta la generación del PDF con React-PDF
- `InformeEquipo.tsx` — Componente PDF con diseño completo:
  - Encabezado con logos
  - Datos del cliente y equipo
  - Tipo de servicio, fechas y profesionales
  - Observaciones y conclusiones
  - Checklist con resultados (OK/FALLA/N/A)
  - Anexo fotográfico
  - Firmas digitales

## Esquema de base de datos
- Tabla `mantenimientos`: equipo_id, tipo, fecha, estado, pdf_url, observaciones, conclusion, orden_servicio, numero_informe, tecnico_nombre, aprobador_nombre, firma_tecnico, firma_aprobador, firma_recibe, visible_para_cliente
- Tabla `checklist_resultados`: mantenimiento_id, plantilla_id, resultados (JSONB)
- Tabla `fotos_mantenimiento`: mantenimiento_id, url
