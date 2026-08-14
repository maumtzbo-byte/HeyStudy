# HeyStudy

MVP de validación personal de HeyStudy: diagnóstico, mapa de conocimiento,
exam readiness, plan de estudio adaptativo y tutor IA — para un solo
estudiante cargando sus propios datos manualmente. Ver `AGENTS.md` en la raíz
del repo para el spec completo de producto.

## Stack

- Next.js 16 (App Router) + TypeScript + Tailwind CSS
- Supabase (Postgres + Auth + Storage)
- Prisma 7 (driver adapter `@prisma/adapter-pg`)
- Anthropic API (Claude Haiku 4.5 / Sonnet 5) detrás de `src/services/ai/AIProvider.ts`

## Desarrollo

```bash
npm install
cp .env.example .env.local   # llena las variables (ver abajo)
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

### Variables de entorno

Copia `.env.example` a `.env.local` y completa:

- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` — del proyecto Supabase.
- `DATABASE_URL` / `DIRECT_URL` — conexión a Postgres (pooled / directa). La
  contraseña debe ir URL-encoded si tiene caracteres especiales.
- `ANTHROPIC_API_KEY` — para las funciones de IA (diagnóstico, tutor, etc).
- `STRIPE_*` — solo necesarias en la Etapa 5 (freemium/pagos).

### Base de datos

El schema vive en `prisma/schema.prisma`. Para aplicar cambios:

```bash
npx prisma migrate dev   # desarrollo: crea y aplica una migración
npx prisma generate      # regenera el cliente (a src/generated/prisma)
```

## Estructura

```
src/
  app/            # rutas (App Router): auth, onboarding, dashboard
  components/     # UI, separada por dominio (auth, subjects, dashboard, ui)
  services/       # lógica de negocio (subjects, assignments, exams,
                   # materials, onboarding, ai, usage) — nunca UI ni acceso
                   # directo a la DB desde componentes
  lib/            # clientes (Supabase, Prisma), validación (zod), utils
  generated/      # cliente de Prisma generado (no se versiona)
prisma/
  schema.prisma
  migrations/
```
