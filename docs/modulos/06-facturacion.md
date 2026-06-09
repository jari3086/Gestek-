# Módulo 6: Facturación

## Descripción
Gestión de facturas asociadas a servicios de mantenimiento. Incluye preparación para facturación electrónica DIAN (Colombia).

## Componentes

### Listado de facturas (`src/app/facturas/page.tsx`)
- **Tipo**: Server Component
- **Descripción**: Tabla de facturas emitidas con filtros y exportación CSV
- **Datos de entrada**: Filtros opcionales
- **Datos de salida**: Lista de facturas con estados

### Nueva factura (`src/app/facturas/nueva/page.tsx`)
- **Tipo**: Client Component
- **Descripción**: Formulario de creación de factura
- **Datos de entrada**:
  - Cliente (seleccionable)
  - Monto / Subtotal
  - IVA
  - Retenciones (fuente, IVA, ICA)
  - Tipo de documento, prefijo, numeración
  - Fechas de emisión y vencimiento
  - Forma y medio de pago
- **Datos de salida**: Nuevo registro en tabla `facturas`

## Esquema de base de datos
- Tabla `facturas`:
  - `id` UUID PRIMARY KEY
  - `cliente_id` UUID REFERENCES profiles(id)
  - `mantenimiento_id` UUID REFERENCES mantenimientos(id)
  - `monto` NUMERIC
  - `fecha` TEXT
  - `estado` TEXT (emitida | pagada | anulada)
  - `pdf_url` TEXT
  - Columnas DIAN: subtotal, total_iva, total, iva, retencion_fuente, retencion_iva, retencion_ica, tipo_documento, prefijo, numero_consecutivo, cufe, estado_dian, etc.

## Funciones Server Action (`src/lib/actions/facturas.ts`)
- `crearFactura`: Crea nueva factura
- `actualizarFactura`: Actualiza datos de factura existente
- `eliminarFactura`: Elimina factura
