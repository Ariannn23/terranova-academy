# TerraNova Academy

Sistema administrativo escolar construido con Next.js App Router, Prisma ORM y PostgreSQL (Supabase), con enfoque en seguridad operativa, control de acceso por roles y trazabilidad.

## Stack tecnico

- Next.js 14 (App Router) + React 18 + TypeScript
- Prisma ORM + PostgreSQL (Supabase)
- NextAuth (sesion y autenticacion)
- Zod + React Hook Form
- Vitest (unit/integration) + Playwright (E2E)

## Requisitos previos

- Node.js 20+
- npm 10+
- Base PostgreSQL accesible (Supabase u otra)
- Opcional: base aislada para E2E autenticado

## Estructura principal

- `src/app`: rutas App Router, layouts y paginas
- `src/components`: UI y modulos de negocio
- `src/lib`: auth, actions, validaciones, utilidades
- `src/services`: servicios puros de dominio/transformacion
- `prisma`: schema, migraciones, seed base y SQL legacy
- `scripts`: utilidades operativas (bootstrap admin, seed e2e, runner e2e)
- `e2e`: pruebas Playwright
- `docs/arrangements`: bitacora tecnica por sprint

## Variables de entorno

Copiar `.env.example` a `.env.local` y completar:

- `DATABASE_URL`: URL de runtime de la app (puede usar pooler 6543 en Supabase)
- `MIGRATION_DATABASE_URL`: URL directa para migraciones Prisma (usar 5432 en Supabase)
- `E2E_DATABASE_URL`: base aislada para pruebas E2E autenticadas
- `DEFAULT_NEW_USER_PASSWORD`: temporal por defecto para creacion de usuarios/bootstrap local
- `INSTITUTIONAL_EMAIL_DOMAIN`: dominio institucional permitido
- variables `BOOTSTRAP_*`: creacion segura del primer ADMIN
- variables `E2E_*`: credenciales de prueba para escenarios autenticados

## Instalacion y onboarding (flujo oficial)

1. Instalar dependencias:
   - `npm install`
2. Configurar entorno:
   - copiar `.env.example` -> `.env.local`
   - completar URLs y variables necesarias
3. Para comandos Prisma de migracion en Supabase, usar conexion directa:
   - Git Bash: `set -a && source .env.local && set +a && export DATABASE_URL="$MIGRATION_DATABASE_URL"`
4. Verificar Prisma:
   - `npx.cmd prisma validate`
   - `npx.cmd prisma generate`
   - `npx.cmd prisma migrate status --schema prisma/schema.prisma`
5. Seed base (sin usuarios reales):
   - `npm run seed`
6. Crear primer ADMIN real:
   - configurar `BOOTSTRAP_ADMIN_EMAIL`, `BOOTSTRAP_ADMIN_PASSWORD` (o fallback), `BOOTSTRAP_ADMIN_NAME`, `BOOTSTRAP_CONFIRM=true`
   - ejecutar `npm run bootstrap:admin`
7. Levantar entorno local:
   - `npm run dev`

## Prisma y migraciones

- Migraciones versionadas en `prisma/migrations/`
- Flujo recomendado: `migrate status` + `migrate deploy` segun entorno controlado
- **No usar `prisma migrate dev` contra Supabase remoto**
- **No usar `prisma migrate reset` contra Supabase remoto**

### Nota sobre baseline actual

Existe un baseline (`20260524000000_baseline_existing_database`) creado para compatibilidad con una base existente.  
No representa una migracion inicial limpia para una base nueva desde cero. Ese ajuste queda pendiente para un sprint futuro.

## Seed y bootstrap

- `npm run seed`: carga datos base academicos/financieros y **no crea usuarios reales**
- `npm run bootstrap:admin`: crea/actualiza el primer ADMIN real de forma controlada
- `npm run seed:e2e`: prepara datos aislados para E2E, solo en `E2E_DATABASE_URL`

## Modulo de usuarios (estado actual)

- Validacion de correo institucional (`@terranova.edu.pe`)
- Password temporal centralizada con `DEFAULT_NEW_USER_PASSWORD`
- Control de estado activo (`User.active`) para acceso protegido
- Reset de password con hash seguro (bcrypt)

## Tests y calidad

- Lint: `npm run lint`
- Type-check: `npx.cmd tsc --noEmit`
- Unit tests: `npm run test:run`
- Integration tests: `npm run test:integration`
- E2E base: `npm run test:e2e -- --reporter=list`
- E2E autenticado: `npm run test:e2e:auth -- --reporter=list` (requiere `E2E_DATABASE_URL` + seed E2E)
- Build: `npm run build`

## Archivos legacy (referenciales)

- `prisma/seed.sql`: historico, **no usar como flujo operativo**
- `prisma/init-schema.sql`: snapshot historico, **no usar como flujo principal**

El flujo soportado para onboarding es: migraciones Prisma + `prisma/seed.ts` + `bootstrap-admin`.

## Que NO hacer

- No reactivar `/api/seed`
- No usar `migrate reset` contra Supabase remoto
- No usar `migrate dev` contra Supabase remoto
- No ejecutar `seed.sql`/`init-schema.sql` como instalacion oficial
- No asumir que la migracion baseline reemplaza una initial migration limpia

## Pendientes tecnicos

- Definir y ejecutar plan de migracion inicial limpia para bases nuevas
- Mantener `seed.sql`/`init-schema.sql` solo como material legacy o moverlos a carpeta legacy en sprint dedicado
- Completar E2E autenticado con infraestructura de base aislada estable
- Rotar credenciales sensibles usadas en diagnosticos historicos
