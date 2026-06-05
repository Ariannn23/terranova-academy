# Plan de preparacion para produccion

## Objetivo

Definir los pasos necesarios para subir TerraNova Academy a produccion de forma segura, despues de las mejoras de login, recuperacion de contrasena, bloqueo temporal, historial de contrasenas y recordatorio de equipo.

## Estado actual verificado

- Rama revisada: `main`.
- Ultimo commit revisado: `01aff15 feat(auth): profesionalizar recuperacion de contraseña por correo`.
- Worktree: limpio al iniciar la revision.
- Login seguro implementado.
- Recuperacion de contrasena por token temporal implementada.
- Enlace de recuperacion expuesto solo por correo.
- Historial de ultimas 3 contrasenas implementado.
- Bloqueo temporal por intentos fallidos implementado.
- Recordar este equipo implementado con cookie httpOnly y token hasheado.
- `/api/seed` debe permanecer deshabilitado.
- `.env.example` fue alineado con variables de produccion y E2E.
- `/api/seed` mantiene respuesta `410 Gone` y no ejecuta ningun seed.
- Scripts CLI de Prisma, seed, bootstrap y E2E cargan `.env.local` y `.env` de forma explicita y silenciosa.

## Validaciones ejecutadas

| Comando | Resultado | Nota |
|---|---|---|
| `npm.cmd run lint` | OK | Sin errores ni warnings ESLint. |
| `npx.cmd tsc --noEmit` | OK | Tipado correcto. |
| `npm.cmd run test:run` | OK | 209 tests pasaron. |
| `npm.cmd run test:integration` | OK | 45 tests pasaron. |
| `npm.cmd run build` | OK | Build de Next.js correcto. |
| `npx.cmd prisma validate` | OK | Schema valido; queda warning no bloqueante de `driverAdapters`. |
| `npm.cmd run lint` despues de ajustes deploy-readiness | OK | Sin errores ni warnings. |
| `npx.cmd tsc --noEmit` despues de ajustes deploy-readiness | OK | Tipado correcto. |
| `npm.cmd run test:run` despues de ajustes deploy-readiness | OK | 209 tests pasaron. |
| `npm.cmd run test:integration` despues de ajustes deploy-readiness | OK | 45 tests pasaron. |
| `npm.cmd run test:e2e -- --reporter=list` | OK | 7 tests pasaron, 12 autenticados omitidos por configuracion. |
| `npm.cmd run build` despues de ajustes deploy-readiness | OK | Build de Next.js correcto. |
| `npm.cmd run seed:e2e` | Bloqueado por entorno | El script carga `.env.local`, pero la base E2E responde `EACCES` al escribir en `User`. |

## Paso 1: Cierre limpio de codigo

Antes de desplegar:

1. Confirmar que `git status --short` este limpio.
2. Confirmar que los documentos de `docs/arrangements` relevantes esten versionados si `docs/` esta ignorado.
3. No incluir cambios ajenos como README o archivos experimentales si no pertenecen al bloque actual.
4. Repetir validaciones base antes del merge final.

## Paso 2: Base de datos

En produccion no usar `prisma migrate reset`.

Ejecutar solamente:

```bash
npx.cmd prisma migrate deploy
npx.cmd prisma generate
```

Migraciones relevantes que deben estar aplicadas:

- Campos de bloqueo de login en `User`.
- `recoveryEmail` en `User`.
- `PasswordResetToken`.
- `PasswordHistory`.
- `TrustedDeviceToken`.

## Paso 3: Variables de entorno

Configurar en el proveedor de hosting:

```env
DATABASE_URL=
MIGRATION_DATABASE_URL=
NEXTAUTH_SECRET=
AUTH_SECRET=
NEXTAUTH_URL=
NEXT_PUBLIC_APP_URL=

SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
PASSWORD_RESET_FROM_EMAIL=

BOOTSTRAP_ADMIN_EMAIL=
BOOTSTRAP_ADMIN_PASSWORD=
BOOTSTRAP_ADMIN_NAME=
BOOTSTRAP_CONFIRM=true
```

Notas:

- `NEXTAUTH_SECRET` debe ser fuerte y distinto al local.
- `AUTH_SECRET` se puede mantener igual a `NEXTAUTH_SECRET` si el proveedor o NextAuth lo requiere.
- `NEXTAUTH_URL` debe apuntar al dominio HTTPS final.
- `NEXT_PUBLIC_APP_URL` debe apuntar al dominio publico final.
- No subir credenciales reales al repositorio.

## Paso 4: Correo real

La recuperacion de contrasena ya depende de SMTP.

Pendiente antes de produccion:

1. Elegir proveedor SMTP real.
2. Configurar credenciales en entorno seguro.
3. Probar envio a un correo real.
4. Validar que el enlace llega correctamente.
5. Validar que el token expira.
6. Revisar spam/promociones.

## Paso 5: Administrador inicial

Crear el primer administrador real con:

```bash
npm.cmd run bootstrap:admin
```

Luego:

1. Iniciar sesion como ADMIN.
2. Cambiar la contrasena inicial.
3. Crear usuarios reales desde el modulo de usuarios.
4. No crear usuarios E2E o demo en produccion.

## Paso 6: Seguridad previa al deploy

Checklist:

- `/api/seed` responde 410 y no se reactiva.
- No hay tokens de recuperacion visibles en UI.
- No se imprime token de recuperacion en logs.
- Los tokens persistentes se guardan hasheados.
- El bloqueo temporal aplica por cuenta, no por dispositivo completo.
- La recuperacion impide reutilizar las ultimas 3 contrasenas.
- Los usuarios inactivos no pueden iniciar sesion.
- Las rutas privadas siguen protegidas por sesion y RBAC.

## Paso 7: E2E

Ejecutar E2E contra base aislada, nunca contra produccion:

```bash
npm.cmd run test:e2e
npm.cmd run test:e2e:auth
```

Requisitos:

- `E2E_DATABASE_URL` debe existir.
- `E2E_DATABASE_URL` debe ser distinta de `DATABASE_URL`.
- `E2E_DATABASE_URL` debe ser distinta de `MIGRATION_DATABASE_URL`.
- Puerto 3000 debe estar libre si el runner levanta su propio servidor.

Revision local actual:

- `test:e2e` publico/base paso correctamente.
- La terminal actual no tenia `E2E_DATABASE_URL`, `DATABASE_URL` ni `MIGRATION_DATABASE_URL` cargadas como variables de proceso.
- `test:e2e:auth` queda pendiente hasta cargar variables de entorno E2E en la terminal.
- `.env.local` si contiene `E2E_DATABASE_URL`, pero debe cargarse en la terminal antes de ejecutar scripts CLI.
- Al cargar `.env.local` y ejecutar `npm.cmd run seed:e2e`, el seed fallo con `EACCES` en `prisma.user.upsert`.
- El fallo `EACCES` indica que la URL/usuario de la base E2E actual no tiene permisos suficientes o la base aislada no esta preparada para escritura con ese usuario.
- Se ajusto `scripts/seed-e2e.ts` para no imprimir la contrasena E2E en consola.
- Se ajusto `scripts/seed-e2e.ts` para mostrar un error claro cuando la base E2E rechaza escrituras por permisos.
- Se ajustaron `scripts/run-e2e.mjs`, `scripts/bootstrap-admin.ts`, `scripts/seed-e2e.ts`, `prisma/seed.ts` y `prisma.config.ts` para cargar `.env.local` y `.env` sin ruido en consola.

Accion pendiente para E2E autenticado:

1. Confirmar que `E2E_DATABASE_URL` apunte a una base aislada de prueba.
2. Confirmar que el usuario de esa URL tenga permisos de `SELECT`, `INSERT`, `UPDATE` y `DELETE` sobre el schema usado por Prisma.
3. Aplicar migraciones en esa base.
4. Ejecutar `npm.cmd run seed:e2e`.
5. Ejecutar `npm.cmd run test:e2e:auth -- --reporter=list`.

## Paso 8: Deploy

Antes de publicar:

1. Configurar dominio.
2. Activar HTTPS.
3. Configurar variables de entorno.
4. Aplicar migraciones.
5. Ejecutar build.
6. Probar smoke manual.

Smoke manual minimo:

- `/`
- `/login`
- recuperacion de contrasena
- reset de contrasena
- dashboard por rol
- creacion de usuario
- bloqueo por intentos fallidos
- modulo de usuarios
- pagos y reportes si corresponden al rol

## Pendientes recomendados

| Pendiente | Prioridad | Motivo |
|---|---|---|
| Proveedor SMTP real | Alta | Sin esto, recuperacion real de cuenta no llega al correo. |
| Backups automaticos de PostgreSQL | Alta | Necesario antes de datos reales. |
| Monitoreo de errores | Alta | Detectar fallos de auth, pagos y server actions. |
| Rate limiting por IP/email | Alta | Complementa bloqueo por cuenta. |
| CAPTCHA adaptativo con llaves reales | Media | Util si hay abuso o ataques automatizados. |
| Revisar warning Prisma `driverAdapters` | Baja | No bloquea produccion, pero conviene limpiar. |
| Politica operativa de usuarios | Media | Alta/baja de usuarios, recuperacion y roles reales. |

## Recomendacion final

Es seguro avanzar hacia una preparacion de produccion controlada, siempre que primero se configure SMTP real, se apliquen migraciones con `migrate deploy`, se cree un ADMIN real por bootstrap y se ejecuten pruebas E2E autenticadas contra una base aislada.
