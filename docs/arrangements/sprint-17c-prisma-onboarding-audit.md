# Sprint 17C — Auditoria Prisma y flujo de primera instalacion

## Objetivo

Auditar `prisma/`, scripts relacionados y el flujo de onboarding tecnico para asegurar que una persona nueva pueda:

- clonar el repo,
- configurar variables de entorno,
- preparar base PostgreSQL (Supabase),
- aplicar migraciones de forma segura,
- ejecutar seed base,
- crear el primer ADMIN real,
- levantar la app sin errores.

**Importante**: esta auditoria se realiza sobre la rama funcional actual del sistema (no sobre `main`), porque `main` esta desalineado (ver seccion obligatoria).

## Rama usada para la auditoria

- Base funcional: `feature/sprint-17b-user-password-fixes`
- Rama de auditoria: `feature/sprint-17c-prisma-onboarding-audit`

## Desalineamiento entre main y ramas feature (OBLIGATORIO)

1. **`main` no representa el estado funcional actual** del sistema TerraNova Academy.
2. **`main` no contiene `prisma/migrations/`**, por lo que no puede ejecutar `prisma migrate deploy` desde una base vacia.
3. **`main` contiene `schema.prisma` desfasado** (faltaban cambios como `User.active`, `PaymentTransaction`, `AuditLog`, `Section.capacity`).
4. **`main` conserva seeds legacy inseguros** (`prisma/seed.ts` y/o `prisma/seed.sql`) que usan/explican credenciales antiguas (`Admin1234!`) y no reflejan la estrategia actual (seed base sin usuarios + bootstrap admin separado).
5. Por lo tanto, **la auditoria valida** (onboarding real) se realizo sobre la rama funcional actual.
6. Antes de produccion, se debe **integrar la rama funcional hacia `main` mediante PR/merge controlado**, asegurando que `main` reciba:
   - migraciones,
   - `schema.prisma` actualizado,
   - seed seguro,
   - bootstrap admin,
   - fixes de usuarios.
7. **No se debe desplegar `main`** hasta que esa integracion ocurra.

## Inventario real de prisma/

Estructura observada:

```txt
prisma/
  schema.prisma
  init-schema.sql
  seed.ts
  seed.sql
  migrations/
    migration_lock.toml
    20260524000000_baseline_existing_database/
      migration.sql
    20260525142000_add_capacity_to_section/
      migration.sql
    20260525153000_add_payment_transactions/
      migration.sql
    20260525165000_add_audit_log/
      migration.sql
    20260527064700_add_user_active_status/
      migration.sql
```

## Analisis de schema.prisma (estado actual)

Confirmado en `schema.prisma`:

- `User.active` existe (`Boolean @default(true)`).
- `PaymentTransaction` existe.
- `AuditLog` existe.
- `Section.capacity` existe (`Int @default(30)`).

Modelos principales presentes (no exhaustivo):

- `User`
- `AuditLog`
- `AcademicYear`
- `GradeLevel`
- `Section`
- `Student`
- `Guardian`
- `Teacher`
- `Course`
- `Schedule`
- `Enrollment`
- `GradeRecord`
- `Attendance`
- `PaymentConcept`
- `Payment`
- `PaymentTransaction`
- `Incident`
- `DisabilityRecord`
- `Announcement`
- `CalendarEvent`

Observaciones:

- `schema.prisma` usa `previewFeatures = ["driverAdapters"]` (Prisma lo marca como deprecado pero no bloquea).

## Analisis de prisma/init-schema.sql

Existe y contiene un schema SQL “completo” (CREATE TYPE/CREATE TABLE/INDEX/FK) con tablas como:

- `User`
- `AuditLog`
- `PaymentTransaction`

Pero:

- No se confirmo que este archivo se use en scripts de instalacion automatica.
- Riesgo: puede quedar como **archivo legacy/referencial** y confundirse con el flujo real (migraciones Prisma).

Recomendacion:

- Mantenerlo como referencia solo si hay un motivo claro (ej. SQL editor Supabase), y documentar explicitamente que **el flujo oficial es via migraciones Prisma**.

## Analisis de prisma/seed.ts (seed base)

Estado actual (seed base):

- **No crea usuarios reales**.
- Crea/asegura:
  - `AcademicYear` (2025, activo),
  - `GradeLevel` (niveles/grados),
  - `Section` (por grado/año) con `capacity = 30`,
  - `PaymentConcept` base (matricula/mensualidad/examen).
- Es razonablemente idempotente (usa `upsert`/find+update/create segun entidad).
- No imprime credenciales.
- Indica operar el primer admin con `npm run bootstrap:admin`.

## Analisis de prisma/seed.sql

Existe como SQL para Supabase SQL editor.

Estado y riesgos:

- Inserta un usuario admin con `passwordHash` predefinido.
- Puede llevar a **flujos legacy** si un nuevo dev lo usa por error.

Recomendacion:

- Mantenerlo como legacy/referencial solo si se documenta claramente que **no es el flujo recomendado**.
- En un sprint futuro, considerar moverlo a una carpeta `legacy/` o marcarlo como “NO USAR” en encabezado.

## Analisis de migraciones

Migraciones encontradas (orden por timestamp):

| Migracion | Proposito | Estado esperado | Riesgo en base vacia |
|---|---|---|---|
| `20260524000000_baseline_existing_database` | Baseline para base existente (P3005) | Referencia/resolve en base existente | **ALTO**: puede duplicar cambios con migraciones posteriores |
| `20260525142000_add_capacity_to_section` | Agrega `Section.capacity` | Incremental | **MEDIO/ALTO** si baseline ya incluye capacity |
| `20260525153000_add_payment_transactions` | Agrega `Payment.balance` + tabla `PaymentTransaction` | Incremental | Bajo (en base vacia con schema previo) |
| `20260525165000_add_audit_log` | Crea `AuditLog` | Incremental | Bajo (en base vacia con schema previo) |
| `20260527064700_add_user_active_status` | Agrega `User.active` | Incremental | Bajo (en base vacia con schema previo) |

### Riesgo del baseline (PUNTO CRITICO)

El baseline contiene una fotografia del schema en un punto del tiempo para resolver `P3005` en una base no vacia.

Hallazgo clave:

- El baseline **incluye `Section.capacity`** (se observa en el SQL).
- Existe una migracion posterior `add_capacity_to_section` que intenta volver a agregar la columna.

Esto implica que, en una base vacia, el orden “baseline -> add_capacity_to_section” podria fallar con:

- `column "capacity" already exists`

**No se aplico ninguna correccion destructiva en este sprint.**

## Respuestas obligatorias sobre baseline

1. Existe `20260524000000_baseline_existing_database` dentro del repo: **si**.
2. Esta versionado en `prisma/migrations`: **si**.
3. Su SQL representa base existente o migracion inicial real: **baseline de base existente** (no una “initial migration” limpia).
4. Puede aplicarse en base vacia sin conflicto: **riesgoso** (por duplicidad con migraciones posteriores).
5. Puede generar duplicidad con migraciones posteriores: **si** (ej. `Section.capacity`).
6. Debe conservarse/eliminarse/ignorar/reemplazar: **requiere decision** (ver estrategia final).

## Analisis de scripts/bootstrap-admin.ts

Flujo:

- Requiere: `DATABASE_URL`, `BOOTSTRAP_ADMIN_EMAIL`, `BOOTSTRAP_ADMIN_NAME`, `BOOTSTRAP_CONFIRM=true`.
- Password:
  - usa `BOOTSTRAP_ADMIN_PASSWORD` o fallback `DEFAULT_NEW_USER_PASSWORD`.
- Hashea con bcrypt.
- No imprime contraseña.
- Crea/actualiza un admin via `upsert`.

Nota:

- Exige longitud minima 12. Si `DEFAULT_NEW_USER_PASSWORD` se usa como fallback, debe cumplir esa longitud.

## Analisis de scripts/seed-e2e.ts

- Usa **solo** `E2E_DATABASE_URL`. Si no existe, aborta.
- Crea usuarios `.test` y datos minimos E2E.
- Hash de password via bcrypt.
- Enfocado a Playwright, no debe ejecutarse en produccion.

## Analisis de scripts/run-e2e.mjs

- Levanta `next dev` en puerto 3000.
- Si existe `E2E_DATABASE_URL`, sobreescribe `DATABASE_URL` para el proceso E2E.
- Para `--auth`, fuerza `E2E_RUN_AUTHENTICATED=1`.
- Riesgo operativo: `EADDRINUSE` si el puerto 3000 esta ocupado; esto ya fue observado durante ejecuciones locales.

Recomendacion:

- Documentar en onboarding que para correr E2E se debe liberar el puerto 3000 o definir `E2E_BASE_URL`.

## Analisis de package.json (scripts)

Scripts relevantes presentes y razonablemente claros:

- `seed`: `tsx prisma/seed.ts`
- `bootstrap:admin`: `tsx scripts/bootstrap-admin.ts`
- `seed:e2e`: `tsx scripts/seed-e2e.ts`
- `test:e2e`: `node scripts/run-e2e.mjs`
- `db:generate`: `prisma generate`

Observacion:

- No hay `db:migrate:deploy` o `db:status` como scripts. Se puede proponer pero no se agrego en este sprint.

## Analisis de .env.example

Incluye (sin secretos):

- `DATABASE_URL=`
- `MIGRATION_DATABASE_URL=`
- `DEFAULT_NEW_USER_PASSWORD="Terranova2026!"`
- `INSTITUTIONAL_EMAIL_DOMAIN=terranova.edu.pe`
- bootstrap admin (`BOOTSTRAP_ADMIN_*`, `BOOTSTRAP_CONFIRM=false`)
- E2E (`E2E_DATABASE_URL=`, `E2E_RUN_AUTHENTICATED=0`, credenciales `.test`)

## Flujo recomendado para primera instalacion (sin destruir datos)

1. Clonar repo.
2. `npm install`
3. Copiar `.env.example` -> `.env.local` y completar:
   - `DATABASE_URL` (runtime, puede ser pooler `:6543`)
   - `MIGRATION_DATABASE_URL` (migraciones, `:5432`)
4. Para migraciones (Git Bash):

```bash
set -a && source .env.local && set +a
export DATABASE_URL="$MIGRATION_DATABASE_URL"
npx.cmd prisma migrate deploy --schema prisma/schema.prisma
```

5. Regenerar cliente:

```bash
npx.cmd prisma generate
```

6. Volver a runtime normal (abrir terminal nueva o reexportar `DATABASE_URL` al runtime).
7. Ejecutar seed base:

```bash
npm run seed
```

8. Crear primer ADMIN real:
   - setear `BOOTSTRAP_ADMIN_EMAIL`
   - setear `BOOTSTRAP_ADMIN_NAME`
   - setear `BOOTSTRAP_ADMIN_PASSWORD` (recomendado) o `DEFAULT_NEW_USER_PASSWORD`
   - setear `BOOTSTRAP_CONFIRM=true`

```bash
npm run bootstrap:admin
```

9. Levantar app:

```bash
npm run dev
```

10. Login en `/login` y operacion desde `/dashboard/usuarios`.

## Estrategia final de Prisma (recomendacion)

Estado actual sugiere:

- **Estrategia C** (provisional): mantener baseline solo como referencia/compatibilidad con base existente, y documentar que **no es una migracion inicial limpia**.
- Para soportar “base nueva desde cero” sin riesgo, es probable requerir **Estrategia B** en un sprint futuro:
  - crear una migracion inicial limpia (squash) y/o ajustar baseline vs migraciones incrementales.

**No se aplico ninguna estrategia destructiva en este sprint.**

## Validaciones ejecutadas (no destructivas)

Recomendadas para ejecutar en esta rama:

- `npx.cmd prisma validate`
- `npx.cmd prisma generate`
- `npm.cmd run lint`
- `npx.cmd tsc --noEmit`
- `npm.cmd run test:run`
- `npm.cmd run build`

## Pendientes / decisiones que requieren aprobacion

- Decidir estrategia sobre baseline vs migracion inicial formal.
- Definir plan de integracion (PR/merge controlado) para llevar la rama funcional a `main`.
- Decidir tratamiento de `prisma/init-schema.sql` y `prisma/seed.sql` (legacy vs mover/etiquetar).
