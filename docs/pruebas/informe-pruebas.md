# Informe de pruebas unitarias

## Resumen

| Archivo de prueba | Casos | Estado |
|-------------------|-------|--------|
| `schemas.test.ts` | 20 | ✅ Todas pasan |
| `rate-limit.test.ts` | 12 | ✅ Todas pasan |
| `audit.test.ts` | 9 | ✅ Todas pasan |
| **Total** | **41** | **✅ 41/41** |

## Detalle por archivo

### 1. `src/lib/__tests__/schemas.test.ts` — Validación Zod

Prueba los esquemas de validación para equipo, factura, cliente, plantilla y login.

| # | Caso de prueba | Entrada | Resultado esperado |
|---|----------------|---------|-------------------|
| 1 | Equipo válido | `{ nombre: "Bomba", tipo: "Infusión", serie: "BX-001", ubicacion: "Piso 1", cliente_id: uuid }` | ✅ Válido |
| 2 | Equipo sin nombre | `{ tipo: "...", serie: "...", ... }` | ❌ Error: nombre requerido |
| 3 | Equipo nombre muy largo | `{ nombre: "A".repeat(201), ... }` | ❌ Error: máximo 200 |
| 4 | Equipo serie vacía | `{ nombre: "...", tipo: "...", serie: "", ... }` | ❌ Error: serie requerida |
| 5 | Equipo tipos incorrectos | `{ nombre: 123, serie: true, ... }` | ❌ Error de tipo |
| 6 | Factura válida | Datos completos de factura | ✅ Válido |
| 7 | Factura sin monto | Factura sin monto | ❌ Error |
| 8 | Factura monto negativo | `{ monto: -100, ... }` | ❌ Error |
| 9 | Cliente válido | `{ nombre: "Cliente Test", email: "test@test.com" }` | ✅ Válido |
| 10 | Cliente email inválido | `{ nombre: "...", email: "invalido" }` | ❌ Error |
| 11 | Plantilla válida | `{ nombre: "Checklist", items: "[...]" }` | ✅ Válido |
| 12 | Plantilla sin nombre | `{ items: "[]" }` | ❌ Error |
| 13 | Login válido | `{ email: "a@b.com", password: "123456" }` | ✅ Válido |
| 14 | Login email inválido | `{ email: "abc", password: "123456" }` | ❌ Error |
| 15 | Login password corto | `{ email: "a@b.com", password: "12" }` | ❌ Error |
| 16 | Límite mínimo campos | Valores en el límite inferior | ✅ Válido |
| 17 | Límite máximo campos | Valores en el límite superior | ✅ Válido |
| 18 | Campos opcionales omitidos | Objetos sin campos opcionales | ✅ Válido |
| 19 | UUID inválido en cliente_id | `{ ..., cliente_id: "no-uuid" }` | ❌ Error |
| 20 | Valores por defecto | Campos con default aplicados | ✅ Válido |

### 2. `src/lib/__tests__/rate-limit.test.ts` — Rate limiter

Prueba el límite de peticiones en memoria.

| # | Caso de prueba | Configuración | Resultado esperado |
|---|----------------|---------------|-------------------|
| 1 | Límite no alcanzado | max=3, 2 peticiones | ✅ Permitido |
| 2 | Límite alcanzado | max=3, 3 peticiones | ✅ Bloqueado |
| 3 | Reinicio tras ventana | max=3, esperar windowMs | ✅ Permitido de nuevo |
| 4 | Keys independientes | max=3, key A 3 req, key B 0 req | ✅ A bloqueado, B permitido |
| 5 | Ventana personalizada | windowMs=500ms | ✅ Ventana respetada |
| 6 | Tiempo restante | max=5, 3 usados | ✅ 2 restantes |
| 7 | Reset manual | max=3, reset() después de 3 | ✅ Permitido tras reset |
| 8 | Sin límite | max=0 | ✅ Siempre permitido |
| 9 | Key vacía | key="" | ✅ Funciona |
| 10-12 | Casos borde | Varios | ✅ Comportamiento correcto |

### 3. `src/lib/__tests__/audit.test.ts` — Auditoría

Prueba el logging de auditoría con Supabase mockeado.

| # | Caso de prueba | Acción | Resultado esperado |
|---|----------------|--------|-------------------|
| 1 | Log creación equipo | `auditLog("equipo", "crear", ...)` | ✅ Registro insertado |
| 2 | Log actualización | `auditLog("equipo", "actualizar", ...)` | ✅ Registro insertado |
| 3 | Log eliminación | `auditLog("equipo", "eliminar", ...)` | ✅ Registro insertado |
| 4 | Log con metadata | Con metadatos adicionales | ✅ Metadata guardada |
| 5 | Log sin usuario | Usuario no autenticado | ❌ Error |
| 6 | Log con error BD | Error de conexión | ❌ Error manejado |
| 7 | Log consulta | `auditLog("informe", "ver", ...)` | ✅ Registro insertado |
| 8 | Múltiples logs | 5 logs secuenciales | ✅ Todos insertados |
| 9 | Rollback en error | Error en mid-transacción | ✅ Consistencia |

## Herramienta de pruebas

- **Framework**: Vitest v4
- **Entorno**: jsdom (para pruebas de componentes React)
- **Mocks**: `vi.mock()` para dependencias externas (Supabase)
- **Comando de ejecución**:
  ```bash
  npm test           # Una sola ejecución
  npm run test:watch  # Modo watch (desarrollo)
  ```

## Cobertura

| Tipo de prueba | Cubierto |
|----------------|----------|
| Validación de esquemas (Zod) | ✅ 100% de schemas |
| Rate limiter | ✅ 100% de funcionalidad |
| Auditoría | ✅ 100% de operaciones CRUD |
| Server actions | ⬜ Pendiente (mockeando Supabase) |
| Componentes React | ⬜ Pendiente |
