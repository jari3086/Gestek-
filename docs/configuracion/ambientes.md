# Ambientes de desarrollo y pruebas

## Ambiente de desarrollo local

### Requisitos mínimos
- **Node.js**: 20.x o superior
- **npm**: 10.x o superior
- **Sistema operativo**: Windows, macOS o Linux
- **Git**: Para control de versiones

### Configuración paso a paso

```bash
# 1. Clonar el repositorio
git clone <url-del-repositorio>
cd biomed-inventory

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env.local
```

### Archivo `.env.local`
```env
NEXT_PUBLIC_SUPABASE_URL=https://<proyecto>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
RESEND_API_KEY=<resend-api-key>  # Opcional, solo para emails
```

### Comandos disponibles
| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Inicia servidor de desarrollo (puerto 3000) |
| `npm run build` | Compila para producción |
| `npm start` | Inicia servidor de producción |
| `npm run lint` | Ejecuta ESLint |
| `npm test` | Ejecuta pruebas unitarias |
| `npm run test:watch` | Pruebas en modo watch |

### Estructura del proyecto
```
biomed-inventory/
├── src/
│   ├── app/           # Rutas y páginas (App Router)
│   │   ├── api/       # API Routes
│   │   ├── clientes/  # Módulo clientes
│   │   ├── equipos/   # Módulo equipos
│   │   ├── informes/  # Módulo informes
│   │   ├── facturas/  # Módulo facturación
│   │   ├── plantillas/# Módulo plantillas
│   │   ├── empleados/ # Módulo empleados
│   │   ├── dashboard/ # Panel de control
│   │   ├── login/     # Autenticación
│   │   ├── layout.tsx # Layout raíz
│   │   └── globals.css# Estilos globales
│   ├── components/    # Componentes compartidos
│   ├── lib/           # Lógica de negocio
│   │   ├── actions/   # Server Actions
│   │   ├── pdf/       # Generación de PDF
│   │   ├── supabase/  # Clientes Supabase
│   │   └── __tests__/ # Pruebas unitarias
│   └── types/         # Tipos TypeScript
├── supabase/
│   ├── migrations/    # Migraciones SQL
│   └── seed.sql       # Datos de ejemplo
├── public/            # Archivos estáticos
└── docs/              # Documentación
```

## Ambiente de pruebas

### Framework
- **Vitest** v4 (compatible con Jest)
- **jsdom** para simulación de DOM

### Configuración (`vitest.config.ts`)
```typescript
import { defineConfig } from "vitest/config";
export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
  },
});
```

### Ejecución de pruebas
```bash
# Todas las pruebas
npm test

# Archivo específico
npx vitest run src/lib/__tests__/schemas.test.ts

# Modo interactivo (watch)
npm run test:watch
```

### Mock de Supabase
Las pruebas usan `vi.mock()` para simular el cliente de Supabase:
```typescript
import { vi } from "vitest";
vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));
```

## Ambiente de producción

### Plataforma de despliegue
- **Vercel** (plan Hobby)
- Despliegue automático desde GitHub (opcional)

### Pasos para desplegar
1. Conectar repositorio a Vercel
2. Configurar variables de entorno en Vercel
3. Desplegar (push a main o deploy manual)
4. Ejecutar migraciones SQL en Supabase

### Migraciones de base de datos
Las migraciones se encuentran en `supabase/migrations/` y se ejecutan en orden:
```bash
# Usando Supabase CLI
supabase migration up

# O manualmente desde SQL Editor de Supabase
# Copiar y ejecutar cada archivo .sql en orden
```

## URL de producción
[https://gestek-gu3mihco8-juliana-agudelo-s-projects.vercel.app](https://gestek-gu3mihco8-juliana-agudelo-s-projects.vercel.app)
