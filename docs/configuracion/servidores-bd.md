# Configuración de servidores y base de datos

## Servidor de producción (Vercel)

### Plataforma
- **Proveedor**: Vercel (vercel.com)
- **Plan**: Hobby (gratuito)
- **Región**: US East (predeterminado)
- **URL**: [https://gestek-gu3mihco8-juliana-agudelo-s-projects.vercel.app](https://gestek-gu3mihco8-juliana-agudelo-s-projects.vercel.app)

### Configuración del proyecto en Vercel
- **Framework**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`
- **Node.js Version**: 20.x (LTS)

### Variables de entorno (Vercel)
```
NEXT_PUBLIC_SUPABASE_URL=    # URL del proyecto Supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY= # Key anónima de Supabase
SUPABASE_SERVICE_ROLE_KEY=   # Service role key (admin)
RESEND_API_KEY=              # API key de Resend para emails
```

## Base de datos (Supabase)

### Plataforma
- **Proveedor**: Supabase (supabase.com)
- **Plan**: Free
- **Región**: US East (N. Virginia)
- **Tipo**: PostgreSQL 15.x

### Esquema de tablas

#### `profiles`
| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | UUID PK | FK → auth.users |
| role | TEXT | administrador, tecnico, cliente |
| nombre | TEXT | Nombre completo |
| email | TEXT | Correo electrónico |
| telefono | TEXT | Teléfono |
| nit | TEXT | NIT (Colombia) |
| direccion | TEXT | Dirección |
| ciudad | TEXT | Ciudad |
| departamento | TEXT | Departamento |
| logo_url | TEXT | URL del logo |
| created_at | TIMESTAMPTZ | Fecha de creación |

#### `equipos`
| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | UUID PK | |
| nombre | TEXT | Nombre del equipo |
| marca | TEXT | Marca |
| modelo | TEXT | Modelo |
| serie | TEXT | Número de serie |
| accesorios | TEXT | Accesorios incluidos |
| ubicacion | TEXT | Ubicación física |
| cliente_id | UUID FK | → profiles(id) |
| creado_por | UUID FK | → profiles(id) |
| fecha_ultimo_mantenimiento | TEXT | Última fecha de mantenimiento |
| fecha_proximo_mantenimiento | TEXT | Próximo mantenimiento programado |
| periodicidad_mantenimiento | INTEGER | Periodicidad en meses |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

#### `mantenimientos`
| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | UUID PK | |
| equipo_id | UUID FK | → equipos(id) |
| tipo | TEXT | Tipo de servicio |
| fecha | TEXT | Fecha del servicio |
| tecnico_id | UUID FK | → profiles(id) |
| estado | TEXT | pendiente, completado |
| pdf_url | TEXT | URL del PDF |
| observaciones | TEXT | Observaciones del servicio |
| conclusion | TEXT | Conclusiones |
| orden_servicio | TEXT | N° de orden del cliente |
| numero_informe | TEXT | N° interno de informe |
| tecnico_nombre | TEXT | Nombre del técnico |
| aprobador_nombre | TEXT | Nombre de quien aprueba |
| visible_para_cliente | BOOLEAN | Visibilidad para el cliente |
| firma_tecnico | TEXT | Firma (base64) |
| firma_aprobador | TEXT | Firma (base64) |
| firma_recibe | TEXT | Firma (base64) |
| created_at | TIMESTAMPTZ | |

#### `checklist_resultados`
| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | UUID PK | |
| mantenimiento_id | UUID FK | → mantenimientos(id) |
| plantilla_id | UUID FK | → plantillas(id) |
| resultados | JSONB | Array de resultados de checklist |
| created_at | TIMESTAMPTZ | |

#### `fotos_mantenimiento`
| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | UUID PK | |
| mantenimiento_id | UUID FK | → mantenimientos(id) |
| url | TEXT | URL de la foto en Storage |
| created_at | TIMESTAMPTZ | |

#### `facturas`
| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | UUID PK | |
| cliente_id | UUID FK | → profiles(id) |
| mantenimiento_id | UUID FK | → mantenimientos(id) |
| monto | NUMERIC | Monto total |
| fecha | TEXT | Fecha de emisión |
| estado | TEXT | emitida, pagada, anulada |
| + columnas DIAN | Varios | Preparación factura electrónica |

#### `plantillas`
| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | UUID PK | |
| nombre | TEXT | Nombre de la plantilla |
| descripcion | TEXT | Descripción |
| items | JSONB | Array de ítems del checklist |
| created_at | TIMESTAMPTZ | |

### Políticas de seguridad (RLS)
- **profiles**: Admin ve todos; usuarios ven propio perfil
- **equipos**: Admin ve todos; clientes ven sus equipos; técnicos ven equipos asignados
- **mantenimientos**: Admin ve todos; técnicos ven los propios; clientes ven solo los visibles
- **facturas**: Admin ve todas; clientes ven las propias
- **plantillas**: Admin puede CRUD; técnicos solo lectura
- **checklist_resultados** y **fotos_mantenimiento**: Herencia de mantenimientos

### Storage (Supabase Storage)
- **Bucket**: `informes`
- **Carpetas**: 
  - `fotos/{userId}/` — Fotos de evidencia
  - `logos/{userId}/` — Logos de clientes
  - `informes/{userId}/` — PDFs generados
- **Tamaño máximo**: 10 MB por archivo
- **Formatos aceptados**: JPEG, PNG, WebP, GIF, AVIF, HEIC, HEIF, DNG, BMP, TIFF (los no-web se convierten a JPEG)
