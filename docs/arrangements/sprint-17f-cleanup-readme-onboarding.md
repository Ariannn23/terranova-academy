# Sprint 17F - Limpieza tecnica y onboarding README

## 1. Objetivo

Realizar una limpieza tecnica controlada del repositorio, clasificar archivos legacy/no operativos y actualizar el README con el flujo real de instalacion y onboarding.

## 2. Rama usada

- `feature/sprint-17f-cleanup-readme-onboarding`

## 3. Areas revisadas

- Raiz del proyecto y archivos de configuracion
- `src/`, `src/app`, `src/components`, `src/lib`, `src/services`, `src/types`, `src/test`
- `scripts/`
- `prisma/`
- `e2e/`
- `docs/`
- `.env.example`, `.gitignore`, `package.json`, `prisma.config.ts`, `playwright.config.ts`

## 4. Diagnostico breve de estructura

1. **Carpetas principales activas:** `src`, `prisma`, `scripts`, `e2e`, `public`, `docs`.
2. **Archivos criticos activos:** `package.json`, `prisma/schema.prisma`, `prisma/migrations/*`, `prisma/seed.ts`, `scripts/bootstrap-admin.ts`, `scripts/seed-e2e.ts`, `scripts/run-e2e.mjs`, `playwright.config.ts`.
3. **Carpetas/archivos sospechosos de legacy:** `prisma/seed.sql`, `prisma/init-schema.sql`, `scripts/cleanup-payments.ts`.
4. **Duplicados/obsoletos potenciales:** scripts ignorados locales `*.js` en `scripts/` (no versionados), sin impacto en runtime.
5. **No tocar por criticidad:** `prisma/schema.prisma`, `prisma/migrations`, `seed.ts`, auth/rbac/server actions.

## 5. Clasificacion de hallazgos

| Archivo/Carpeta | Tipo | Evidencia | Decision |
|---|---|---|---|
| `prisma/schema.prisma` | CRITICO | Fuente de verdad actual Prisma | Conservar sin cambios |
| `prisma/migrations/` | CRITICO | Historial aplicado y validado | Conservar sin cambios |
| `prisma/seed.ts` | ACTIVO | Script en `npm run seed` | Conservar sin cambios |
| `prisma/seed.sql` | LEGACY REFERENCIAL | No usado por scripts npm, contiene seed historico | Mantener + marcar LEGACY/NO OPERATIVO |
| `prisma/init-schema.sql` | LEGACY REFERENCIAL | Snapshot SQL historico no enlazado al flujo npm | Mantener + marcar LEGACY/NO OPERATIVO |
| `scripts/bootstrap-admin.ts` | ACTIVO | Script oficial `bootstrap:admin` | Conservar |
| `scripts/seed-e2e.ts` | ACTIVO | Script oficial `seed:e2e` | Conservar |
| `scripts/run-e2e.mjs` | ACTIVO | Script oficial `test:e2e` | Conservar |
| `scripts/e2e-web-server.mjs` | ACTIVO | Referenciado por `playwright.config.ts` | Conservar |
| `scripts/cleanup-payments.ts` | LEGACY REFERENCIAL | No esta en scripts npm; script puntual historico | Mantener con advertencia LEGACY |
| `scripts/*.js` ignorados (locales) | PENDIENTE DE APROBACION | Ignorados por git, fuera de versionado | No tocar en este sprint |
| `docs/arrangements/*` | ACTIVO/HISTORICO | Bitacora por sprint | Conservar (no eliminar docs) |

## 6. Limpieza aplicada (segura)

- Se agregaron encabezados de advertencia LEGACY en:
  - `prisma/seed.sql`
  - `prisma/init-schema.sql`
- Se agrego advertencia de script one-off legacy en:
  - `scripts/cleanup-payments.ts`
- No se eliminaron archivos criticos ni migraciones.
- No se modifico logica funcional de modulos.

## 7. Cambios en README

Se creo `README.md` con:

- flujo oficial de onboarding;
- diferencias entre `DATABASE_URL`, `MIGRATION_DATABASE_URL`, `E2E_DATABASE_URL`;
- pasos de migraciones/seed/bootstrap admin;
- ejecucion local y pruebas;
- E2E base vs E2E autenticado;
- notas de Supabase;
- estado y advertencias de archivos legacy (`seed.sql`, `init-schema.sql`);
- advertencia de baseline no limpio para base nueva;
- listado de acciones prohibidas (`migrate reset`, `migrate dev` remoto, uso de SQL legacy como flujo principal).

## 8. Cambios en `.env.example`

- Se mantuvieron variables requeridas de runtime/migracion/e2e.
- Se dejaron vacias las credenciales E2E por defecto para evitar valores operativos de ejemplo:
  - `E2E_*_EMAIL=`
  - `E2E_*_PASSWORD=`

## 9. Archivos eliminados

- Ninguno.

## 10. Archivos conservados por seguridad

- Todo `prisma/migrations/`
- `prisma/schema.prisma`
- `prisma/seed.ts`
- scripts oficiales de bootstrap/e2e
- docs historicas de sprint

## 11. Validaciones ejecutadas

- `npx.cmd prisma validate`
- `npx.cmd prisma generate`
- `npm.cmd run lint`
- `npx.cmd tsc --noEmit`
- `npm.cmd run test:run`
- `npm.cmd run test:integration`
- `npm.cmd run test:e2e -- --reporter=list`
- `npm.cmd run build`

Resultado esperado: todo en verde, E2E con subset base + casos autenticados omitidos si no hay DB E2E aislada.

## Incidencia Vitest detectada y correccion

### Error observado

Durante la primera ejecucion de `npm.cmd run test:run` y `npm.cmd run test:integration` se observo el error:

- `TypeError: Cannot read properties of undefined (reading 'config')`

### Causa raiz confirmada

No se identifico ningun cambio en configuraciones de testing (no se modificaron `vitest.config.ts`, `src/test/setup.ts`, `package.json`, `tsconfig.json` ni mocks globales).  
El problema fue transitorio en el entorno de ejecucion en Windows y desaparecio al re-ejecutar las suites en modo verbose y luego en modo normal.

### Accion correctiva aplicada

- **No fue necesario cambiar codigo.** Solo se repitieron las ejecuciones para confirmar estabilidad.

### Verificacion

- `npm.cmd run test:run` ✅ (25 files, 188 tests)
- `npm.cmd run test:integration` ✅ (7 files, 45 tests)

## 12. Pendientes

1. Definir sprint para migracion inicial limpia (baseline actual no cubre base vacia sin riesgo).
2. Decidir si `prisma/seed.sql`, `prisma/init-schema.sql` y scripts one-off se mueven a carpeta `legacy/`.
3. Completar pipeline de E2E autenticado con `E2E_DATABASE_URL` estable.
4. Rotar credenciales sensibles usadas durante diagnosticos historicos.
