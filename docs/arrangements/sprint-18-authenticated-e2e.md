# Sprint 18 — E2E autenticado con base Supabase Cloud aislada

## Objetivo

Suite Playwright autenticada contra `E2E_DATABASE_URL` (distinta de `DATABASE_URL` y de `MIGRATION_DATABASE_URL`), con seed dedicado y migraciones reproducibles.

## Correcciones aplicadas

### 1. Login E2E (`e2e/utils/login.ts`)

- Tras el submit, se usa `page.waitForURL(/\/dashboard/, { timeout: 30_000 })` en lugar de `expect(...).toHaveURL` con timeout implícito de 10s.
- Evita fallos cuando Next.js aún compila `/dashboard` en frío.

### 2. Navegación visual por rol (`e2e/role-navigation.spec.ts`)

| Rol | Problema | Solución |
|-----|----------|----------|
| **RECEPCION** | El middleware redirige a `/dashboard/matriculas`; "Nueva Matrícula" es un **botón**, no un link de accesos rápidos. | Assert con `getByRole("button", { name: /nueva matr/i })`. |
| **DOCENTE** | Redirige a `/dashboard/notas`; "Tomar asistencia" solo existe en QuickAccess del panel `/dashboard`, al que DOCENTE no accede. | Se elimina `quickVisible`; la barra lateral ya valida el link **Asistencia**. |
| **CAJA / COORDINADOR** | Accesos rápidos del home no están en la ruta por defecto del rol. | Solo se validan links de sidebar estables (p. ej. **Ver informes** → Reportes). |

### 3. Dashboard y permisos financieros (`src/app/(dashboard)/dashboard/page.tsx`)

- `getFinancialReport` exige `REPORT_PERMISSIONS.financial` (`ADMIN`, `DIRECTOR`, `CAJA`).
- **COORDINADOR** está en `ROLE_GROUPS.REPORTS` pero no en permisos financieros del reporte anual.
- Se llama `getFinancialReport` solo si `hasAllowedRole(userRole, REPORT_PERMISSIONS.financial)`; en caso contrario se usa `{ success: true, data: [] }` sin invocar la acción protegida.

### 4. Migración idempotente `Section.capacity`

Archivo: `prisma/migrations/20260525142000_add_capacity_to_section/migration.sql`

La baseline `20260524000000_baseline_existing_database` ya define `Section.capacity`. La migración posterior se volvió idempotente:

```sql
ALTER TABLE "public"."Section"
ADD COLUMN IF NOT EXISTS "capacity" INTEGER NOT NULL DEFAULT 30;
```

Así `prisma migrate deploy` no falla con `column "capacity" already exists` en bases que parten de la baseline.

## Comandos ejecutados (validación local)

```powershell
npx.cmd prisma validate
npx.cmd prisma generate
npm.cmd run lint
npx.cmd tsc --noEmit
npm.cmd run test:run
npm.cmd run test:integration
npm.cmd run test:e2e -- --reporter=list
npm.cmd run build
```

### Resultados

| Comando | Resultado |
|---------|-----------|
| `prisma validate` | OK |
| `prisma generate` | OK |
| `npm run lint` | OK |
| `npx tsc --noEmit` | OK |
| `npm run test:run` | 188 passed |
| `npm run test:integration` | 45 passed |
| `npm run test:e2e` (sin `--auth`) | 7 passed, 11 skipped (esperado sin `E2E_RUN_AUTHENTICATED`) |
| `npm run build` | OK |

### Comandos que requieren `.env.local` con URLs aisladas

```powershell
npm.cmd run seed:e2e
npm.cmd run test:e2e:auth -- e2e/auth.spec.ts --reporter=list
npm.cmd run test:e2e:auth -- e2e/role-navigation.spec.ts --reporter=list
npm.cmd run test:e2e:auth -- --reporter=list
```

**Requisitos:**

- `E2E_DATABASE_URL` configurada (p. ej. en `.env.local`).
- `E2E_DATABASE_URL` ≠ `DATABASE_URL`.
- `E2E_DATABASE_URL` ≠ `MIGRATION_DATABASE_URL`.
- Para migraciones contra la base E2E: `$env:DATABASE_URL=$env:E2E_DATABASE_URL` y luego `npx prisma migrate deploy --schema prisma/schema.prisma`.

**Criterios de aceptación E2E (ejecutar en tu entorno con base E2E sembrada):**

- `auth.spec.ts`: 4 passed / 0 failed
- `role-navigation.spec.ts`: todos los roles en verde
- `test:e2e:auth`: 18 passed / 0 failed, 0 skipped autenticados

## Variables de entorno

Ver `.env.example`. La protección de `scripts/seed-e2e.ts` y `scripts/run-e2e.mjs` no debe desactivarse.

## Checklist Sprint 18

- [x] Base E2E Supabase Cloud aislada (configuración documentada)
- [x] Migración `capacity` idempotente
- [x] `seed:e2e` con protecciones intactas
- [x] Login E2E con timeout 30s
- [x] Tests de navegación por rol alineados con UI real
- [x] Dashboard sin llamada indebida a `getFinancialReport` para COORDINADOR
- [ ] Confirmar `test:e2e:auth` completo en verde en CI / máquina con URLs E2E distintas
