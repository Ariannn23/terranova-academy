# Sprint 17A — Sincronizacion y diagnostico de base de datos

## 1) Problema detectado

Despues de avanzar en los sprints funcionales, el codigo esperaba estructuras de base de datos que no estaban sincronizadas en Supabase. Esto genero fallos en rutas del dashboard y modulos criticos.

## 2) Evidencia de errores originales

Errores observados antes de la correccion:

- `relation "PaymentTransaction" does not exist`
- `The column (not available) does not exist in the current database`

Impacto reportado inicialmente en:

- Dashboard
- Finanzas/Pagos
- Reportes
- Incidencias
- Inhabilitaciones
- Comunicados
- Calendario
- Asistencia
- Notas

## 3) Conexion 6543 vs 5432

Se confirmo que el uso del pooler transaccional en `:6543` provocaba bloqueos en comandos de migracion (`prisma migrate status` colgado).

Decision de operacion:

- `DATABASE_URL` (`:6543`) para runtime normal de la app.
- `MIGRATION_DATABASE_URL` (`:5432`) para comandos Prisma de migraciones/diagnostico.

## 4) Uso de MIGRATION_DATABASE_URL

Antes de ejecutar Prisma para migraciones/estado, se sobreescribio el datasource en shell:

```bash
export DATABASE_URL="$MIGRATION_DATABASE_URL"
```

En esta sesion, se cargo `.env.local` y se ejecuto con la conexion `:5432`.

## 5) Error P3005

Al intentar desplegar migraciones contra la base remota existente, Prisma devolvio:

- `P3005 - The database schema is not empty`

Esto confirmo que la base ya tenia objetos previos sin historial Prisma completo aplicado en `_prisma_migrations`.

## 6) Baseline creado

Se creo:

- `prisma/migrations/20260524000000_baseline_existing_database/migration.sql`

Comando utilizado:

```bash
npx.cmd prisma migrate diff --from-empty --to-config-datasource --script --output prisma/migrations/20260524000000_baseline_existing_database/migration.sql
```

## 7) Baseline marcado como aplicado

Comando:

```bash
npx.cmd prisma migrate resolve --applied 20260524000000_baseline_existing_database --schema prisma/schema.prisma
```

## 8) Migracion de capacity marcada como aplicada

La migracion `20260525142000_add_capacity_to_section` fallo al aplicarse porque la columna ya existia:

```sql
ALTER TABLE "Section"
ADD COLUMN "capacity" INTEGER NOT NULL DEFAULT 30;
```

Como el cambio ya estaba materializado en la base, se marco como aplicada:

```bash
npx.cmd prisma migrate resolve --applied 20260525142000_add_capacity_to_section --schema prisma/schema.prisma
```

## 9) Migraciones aplicadas correctamente

Se aplicaron en remoto:

- `20260525153000_add_payment_transactions`
- `20260525165000_add_audit_log`
- `20260527064700_add_user_active_status`

## 10) Resultado de prisma migrate status

Con `DATABASE_URL` apuntando temporalmente a `MIGRATION_DATABASE_URL` (`:5432`):

- `Database schema is up to date!`

## 11) Resultado de prisma generate

- Prisma Client generado correctamente (`@prisma/client v7.4.1`).

## 12) Resultado de prisma validate

- Schema valido.
- Warning no bloqueante: preview feature `driverAdapters` deprecada.

## 13) Modulos validados manualmente (estado actual)

Se valido acceso HTTP a rutas protegidas en `npm run dev`:

- `/dashboard`
- `/dashboard/pagos`
- `/dashboard/incidencias`
- `/dashboard/inhabilitaciones`
- `/dashboard/comunicados`
- `/dashboard/calendar`
- `/dashboard/reportes`
- `/dashboard/notas`
- `/dashboard/asistencia`
- `/dashboard/usuarios`

Resultado observado en esta validacion:

- Todas respondieron `302` a `/login` sin sesion (comportamiento esperado de proteccion).
- No aparecieron errores estructurales de DB en el servidor durante esta verificacion.

Nota: la validacion funcional autenticada completa por modulo debe repetirse con usuarios logueados para confirmar comportamiento de negocio en cada pantalla.

## 14) Validaciones ejecutadas

Comandos ejecutados y resultado:

- `npm.cmd run lint` -> OK (sin warnings ni errores)
- `npx.cmd tsc --noEmit` -> OK
- `npm.cmd run test:run` -> OK (170 tests)
- `npm.cmd run test:integration` -> OK (41 tests)
- `npm.cmd run test:e2e -- --reporter=list` -> OK en suite base (7 passed / 11 skipped esperados por entorno autenticado E2E)
- `npm.cmd run build` -> OK

Observacion E2E:

- Se detecto `EADDRINUSE: 3000` al iniciar servidor interno de Playwright, pero la ejecucion continuo y finalizo en verde para pruebas base/publicas.

## 15) Pendientes

- Ejecutar validacion manual autenticada completa en cada modulo listado.
- Confirmar que el entorno E2E aislado (`E2E_DATABASE_URL`) este disponible para dejar de omitir pruebas autenticadas.
- Revisar/retirar `previewFeatures = ["driverAdapters"]` segun recomendacion de Prisma 7.

## 16) Nota de seguridad

Durante el diagnostico se trabajaron credenciales sensibles en entorno local/remoto. Debe rotarse la contrasena de Supabase utilizada en ese periodo antes de continuar con despliegues.
