# Sprint 16 - Base E2E aislada y usuarios seed por rol

## Objetivo
Preparar una base estable para pruebas E2E autenticadas de TerraNova Academy, con usuarios por rol, datos minimos controlados y ejecucion segura contra una base aislada, sin tocar produccion ni reactivar `/api/seed`.

## Rama usada
`feature/sprint-16-e2e-seed-roles`

## Diagnostico inicial
- El seed principal `prisma/seed.ts` solo crea un usuario ADMIN: `director@terranova.edu.pe`.
- Los roles reales estan definidos en `src/lib/rbac.ts`: `ADMIN`, `DIRECTOR`, `DOCENTE`, `RECEPCION`, `CAJA`, `COORDINADOR`.
- No habia usuarios seed estables para `DIRECTOR`, `RECEPCION`, `CAJA`, `DOCENTE` ni `COORDINADOR`.
- Las pruebas E2E autenticadas del Sprint 15 estaban omitidas por falta de base E2E y credenciales por rol.
- No existia `.env.example`.
- `E2E_DATABASE_URL` no esta configurada en este entorno local, por lo que no se ejecuto seed real.

## Estrategia de base E2E
Se definio `E2E_DATABASE_URL` como variable obligatoria para el seed E2E.

Reglas aplicadas:
- El seed E2E no cae automaticamente a `DATABASE_URL`.
- Si `E2E_DATABASE_URL` no existe, el script falla con error claro.
- `scripts/run-e2e.mjs` usa `E2E_DATABASE_URL` como `DATABASE_URL` solo cuando esta explicitamente configurada.
- `/api/seed` permanece deshabilitado.

## Usuarios E2E definidos
Password local por defecto: `E2ePassword123!`

| Rol | Email |
|---|---|
| ADMIN | `admin.e2e@terranova.test` |
| DIRECTOR | `director.e2e@terranova.test` |
| RECEPCION | `recepcion.e2e@terranova.test` |
| CAJA | `caja.e2e@terranova.test` |
| DOCENTE | `docente.e2e@terranova.test` |
| COORDINADOR | `coordinador.e2e@terranova.test` |

## Datos seed E2E definidos
El script `scripts/seed-e2e.ts` crea o actualiza de forma idempotente:
- Usuarios por rol.
- Anio academico 2026 activo.
- Grado/nivel E2E.
- Docente E2E.
- Seccion E2E con capacidad.
- Curso E2E.
- Bloque de horario.
- Estudiante E2E.
- Apoderado E2E.
- Matricula activa E2E.
- Conceptos de pago E2E.
- Pago pagado, pago pendiente y pago vencido.
- Registro minimo de nota.
- Registro minimo de asistencia.

## Scripts agregados
- `npm run seed:e2e`
- `npm run test:e2e:auth`

## Variables agregadas a `.env.example`
- `E2E_DATABASE_URL`
- `E2E_RUN_AUTHENTICATED`
- Credenciales E2E por rol.

## Pruebas E2E preparadas o activables
Con `npm run test:e2e`, las pruebas autenticadas siguen omitidas si `E2E_RUN_AUTHENTICATED` no esta activo.

Con base E2E configurada:
1. Ejecutar `npm run seed:e2e`.
2. Ejecutar `npm run test:e2e:auth`.

Casos autenticados listos:
- Login ADMIN.
- Navegacion visual por rol.
- Bloqueo RBAC manual por rol.
- Rutas de pagos y pagos vencidos.
- Historial de pagos desde matricula seed.

## Pruebas que siguen sin ser mutantes
No se implementaron flujos que creen o modifiquen datos desde la UI:
- Crear estudiante.
- Registrar matricula.
- Registrar pago.
- Registrar asistencia.
- Registrar notas.
- Crear incidencia.
- Crear inhabilitacion.

Esos flujos quedan para Sprint 17 con setup/teardown explicito.

## Como ejecutar
PowerShell:

```powershell
$env:E2E_DATABASE_URL="postgresql://usuario:password@localhost:5432/terranova_e2e"
npm run seed:e2e
npm run test:e2e:auth
```

Ejecucion sin base E2E:

```powershell
npm run test:e2e
```

En ese modo deben pasar las pruebas publicas/proteccion basica y omitirse las autenticadas con motivo claro.

## Validaciones ejecutadas
- `npx.cmd tsc --noEmit`: aprobado.
- `npm.cmd run lint`: aprobado.
- `npm.cmd run test:run`: 22 archivos, 131 pruebas aprobadas.
- `npm.cmd run test:integration`: 6 archivos, 23 pruebas aprobadas.
- `npm.cmd run test:e2e -- --reporter=list`: 7 pruebas aprobadas, 11 omitidas por falta de base E2E configurada.
- `npm.cmd run build`: aprobado.

No se ejecuto `npm.cmd run seed:e2e` porque `E2E_DATABASE_URL` no esta configurada en este entorno. Esto es intencional para evitar tocar una base no aislada.

## Riesgos y pendientes
- Falta configurar una base PostgreSQL E2E real en este entorno.
- Falta ejecutar `npm run seed:e2e` contra esa base.
- Las pruebas autenticadas completas deben validarse con `npm run test:e2e:auth` cuando exista `E2E_DATABASE_URL`.
- Sprint 17 debe agregar setup/teardown para flujos mutantes.
