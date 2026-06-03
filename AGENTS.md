<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:testing-rules -->
# Testing

## Run tests
```bash
npm test          # Una sola ejecución
npm run test:watch  # Modo watch ( desarrollo)
```

## What we test
- `src/lib/__tests__/schemas.test.ts` — Validación Zod para equipo, factura, cliente, plantilla, login
- `src/lib/__tests__/rate-limit.test.ts` — Rate limiter in-memory (límite, ventana, keys aisladas)
- `src/lib/__tests__/audit.test.ts` — Audit logging con Supabase mockeado

## Conventions
- Tests junto al código fuente: `src/lib/__tests__/*.test.ts`
- Usar `vitest` (no Jest), con `vi.mock()` para dependencias externas
- Schemas: probar casos válidos, inválidos y bordes (mínimo/máximo, tipos incorrectos)
- Rate limiter: probar con `vi.useFakeTimers()` para controlar ventanas de tiempo
- Server actions: mockear `createClient()` y probar lógica de negocio
- NO escribir tests que requieran base de datos real — usar mocks

## Priority (pre-deploy)
1. ✅ Schemas Zod (validación de entrada)
2. ✅ Rate limiter (seguridad)
3. ✅ Audit (integridad de datos)
4. ⬜ Server actions (lógica de negocio — mockeando Supabase)
<!-- END:testing-rules -->
