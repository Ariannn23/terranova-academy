# Sprint 17E — Integración controlada de rama funcional hacia main

## 1. Objetivo

Integrar de forma controlada el estado funcional real del sistema TerraNova Academy hacia `main`, sin merge directo ni despliegue a producción, mediante una rama integradora validada con pruebas automatizadas y revisión de archivos críticos.

## 2. Rama base

- **Base:** `main` (desactualizado, sin migraciones ni schema actual)
- **Commit base main:** `0d273b9`

## 3. Rama funcional integrada

- **Origen:** `origin/feature/sprint-17d-prisma-main-integration-plan`
- **Cadena funcional incluida:**
  - Sprint 17A — sincronización DB/migraciones
  - Sprint 17B — active session guard
  - Sprint 17B-Fix — contraseñas y formulario usuarios
  - Sprint 17C — auditoría Prisma/onboarding
  - Sprint 17D — plan estrategia Prisma e integración

## 4. Rama integradora creada

- **Rama:** `integration/bring-functional-work-to-main`
- **Merge commit:** `3f35571` — `chore: merge functional branch into integration (Sprint 17E)`
- **Tipo de merge:** `--no-ff`
- **Commits por encima de main:** 38

## 5. Conflictos encontrados

- **Ninguno.** El merge se completó sin conflictos manuales.
- `main` estaba tan desfasado que Git aplicó el estado funcional de forma limpia sobre la rama integradora.

## 6. Resolución aplicada

Criterio de prioridad (no fue necesario resolver conflictos, pero se verificó post-merge):

- Se conservó `prisma/schema.prisma` actualizado (User.active, PaymentTransaction, AuditLog, Section.capacity).
- Se conservó `prisma/migrations/` completo (5 migraciones + lock).
- Se conservó `prisma/seed.ts` seguro (sin usuarios reales).
- Se conservaron `scripts/bootstrap-admin.ts`, `scripts/seed-e2e.ts`, `scripts/run-e2e.mjs`.
- Se conservó `.env.example` actualizado.
- Se conservaron cambios de auth (`requireAuth` con validación DB de `active`).
- Se conservó módulo `/dashboard/usuarios` con fixes de contraseña institucional.
- Se conservó `docs/arrangements/` de sprints 17A–17D.

## 7. Archivos críticos integrados — verificación post-merge

| Verificación | Resultado |
|---|---|
| `User.active` en schema | ✅ |
| `PaymentTransaction` en schema | ✅ |
| `AuditLog` en schema | ✅ |
| `Section.capacity` en schema | ✅ |
| `prisma/migrations/` (5 migraciones) | ✅ |
| `seed.ts` no crea usuarios reales | ✅ |
| `bootstrap-admin.ts` existe | ✅ |
| `seed-e2e.ts` exige `E2E_DATABASE_URL` | ✅ |
| `.env.example` con `DATABASE_URL`, `MIGRATION_DATABASE_URL`, `DEFAULT_NEW_USER_PASSWORD` | ✅ |
| Sin credenciales reales en `.env.example` | ✅ |
| `requireAuth()` en layout dashboard | ✅ |
| `Admin1234!` como credencial operativa | ❌ No encontrado (solo en test negativo) |

### grep Admin1234

Solo aparece en:

- `src/lib/actions/__tests__/user.actions.test.ts` — test que verifica que **no** se usa `Admin1234!`.

`prisma/seed.sql` e `init-schema.sql` siguen existiendo como legacy/referencial (documentado en Sprint 17C/17D), pero no son el flujo operativo actual.

## 8. Estado de Prisma

Comandos ejecutados con `DATABASE_URL=$MIGRATION_DATABASE_URL`:

| Comando | Resultado |
|---|---|
| `prisma validate` | ✅ Schema válido (warning no bloqueante: `driverAdapters` deprecated) |
| `prisma generate` | ✅ Client generado (v7.4.1) |
| `prisma migrate status` | ✅ `Database schema is up to date!` (5 migraciones) |

**No se ejecutó** `migrate deploy` ni `migrate dev` en este sprint (base Supabase ya sincronizada).

## 9. Validaciones ejecutadas

| Validación | Resultado |
|---|---|
| `npm run lint` | ✅ Sin warnings ni errores |
| `npx tsc --noEmit` | ✅ Pasa |
| `npm run test:run` | ✅ 188/188 |
| `npm run test:integration` | ✅ 45/45 |
| `npm run test:e2e -- --reporter=list` | ✅ 7 passed / 11 skipped |
| `npm run build` | ✅ Build exitoso |

### Nota E2E

Los 11 tests omitidos corresponden a flujos autenticados por rol que requieren `E2E_DATABASE_URL` y seed E2E. Comportamiento esperado documentado en sprints anteriores.

## 10. Pruebas manuales realizadas

### Cubiertas por E2E automatizado

- `/` carga landing pública (200).
- `/login` carga (200).
- `/dashboard` sin sesión redirige a `/login`.
- `/dashboard/pagos` sin sesión redirige a `/login`.
- Login inválido permanece en `/login`.

### Pendientes de validación manual autenticada

Requieren sesión ADMIN activa en navegador (no automatizadas en este cierre):

1. Login ADMIN funcional.
2. `/dashboard/usuarios` — crear usuario con correo `@terranova.edu.pe`.
3. Login con usuario creado y contraseña temporal.
4. Reset de contraseña y verificación de login.
5. Desactivar usuario y confirmar bloqueo de sesión activa.
6. `/dashboard/pagos`, `/dashboard/reportes`, `/dashboard/incidencias`, `/dashboard/inhabilitaciones` autenticados sin errores estructurales de DB.

## 11. Riesgos pendientes

1. **Baseline no es migración inicial limpia:** `20260524000000_baseline_existing_database` incluye `Section.capacity`, lo que puede conflictuar con `20260525142000_add_capacity_to_section` en base vacía (Sprint futuro: migración inicial limpia).
2. **`seed.sql` / `init-schema.sql` legacy:** siguen en repo como referencia; no deben usarse en onboarding operativo.
3. **E2E autenticado omitido** sin `E2E_DATABASE_URL` aislada.
4. **`main` aún no recibe el merge** — requiere PR y aprobación explícita.
5. **Rotación de contraseña Supabase** pendiente desde Sprint 17A (exposición durante diagnóstico).

## 12. Resultado final

La rama `integration/bring-functional-work-to-main` contiene el estado funcional completo validado con:

- Schema Prisma actualizado y sincronizado con Supabase existente.
- Migraciones versionadas.
- Seeds seguros y bootstrap admin.
- Auth con validación de usuario activo en DB.
- Módulo usuarios con contraseña institucional.
- Suite de tests y build en verde.

## 13. Recomendación sobre merge final a main

**Sí, se recomienda abrir PR** de `integration/bring-functional-work-to-main` → `main` con las siguientes condiciones:

1. Revisión de PR por el equipo (diff grande: ~257 archivos).
2. Confirmar que no se despliega producción hasta validación manual autenticada mínima.
3. No ejecutar `migrate deploy` contra producción sin plan explícito (base ya sincronizada en dev/staging).
4. Planificar Sprint futuro para migración inicial limpia (Fase 2 del plan 17D).

**No se debe hacer merge directo a `main` sin aprobación explícita del usuario.**
