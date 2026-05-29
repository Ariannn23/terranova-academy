# Sprint 19 - Seguridad y usabilidad del login

## Objetivo

Mejorar la seguridad y la experiencia del login de TerraNova Academy sin cambiar RBAC, permisos, reglas de negocio ni flujos del dashboard.

## Rama usada

`feature/login-security-improvements`

## Cambios implementados

- Se agrego control de visibilidad de contraseña en login y reset de contraseña.
- Se alineo la politica minima de contraseña a 10 caracteres.
- Se centralizo el schema de login en `src/lib/validations/auth.schema.ts`.
- Se agregaron campos de bloqueo temporal en `User`:
  - `failedLoginAttempts`
  - `lockedUntil`
  - `lastFailedLoginAt`
- Se creo la migracion `20260527193000_add_login_lockout_fields`.
- Se separo la logica de credenciales en `src/lib/auth/login-credentials.ts`.
- Se agrego bloqueo temporal por 15 minutos tras 5 intentos fallidos.
- Se agrego auditoria de intentos de login.
- Se agrego usuario E2E dedicado para pruebas de lockout.
- Se ajusto el login para mostrar intentos restantes y estado de bloqueo.
- Se bloqueo el boton de inicio de sesion mientras la cuenta esta temporalmente bloqueada.
- Se agrego contador visual en el boton: `Reintentar en mm:ss`.
- El bloqueo visual quedo asociado al correo bloqueado, no al dispositivo ni a toda la pantalla.
- Se agrego la opcion `Ingresar con otra cuenta` para limpiar el formulario y permitir autenticar con otro usuario no bloqueado.
- Se agrego recuperacion segura por correo de apoyo externo.
- Se agrego `recoveryEmail` al usuario para separar login institucional y recuperacion personal.
- Se agrego `PasswordResetToken` con token hasheado, expiracion y marca de uso.
- Se agrego `PasswordHistory` para impedir reutilizar la contrasena actual o las ultimas 3 contrasenas.
- El intento de reutilizar una contrasena reciente devuelve un error controlado en la UI, sin romper la pagina.
- Se agrego la base segura de `Recordar este equipo` con cookie `httpOnly` y token hasheado en base de datos.
- Se agregaron las rutas publicas `/forgot-password` y `/reset-password`.
- Al completar `/reset-password`, se muestra una ventana emergente de exito con contador de 5 segundos y redireccion automatica al login.
- Se agrego envio por SMTP si `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` y `PASSWORD_RESET_FROM_EMAIL` estan configurados.
- Se elimino el enlace visible de desarrollo: el usuario solo accede al reset desde el correo enviado.
- Se mejoro el HTML del correo con una plantilla corporativa tipo SaaS premium, compatible con clientes como Gmail.

## Correccion operativa aplicada

El error de login:

```txt
Invalid prisma.user.findUnique() invocation:
The column `(not available)` does not exist in the current database.
```

se debia a que el codigo ya consultaba los nuevos campos de bloqueo, pero la base usada por la app todavia no tenia aplicada la migracion. Se verifico que la base tuviera las columnas requeridas.

## Archivos modificados principales

- `prisma/schema.prisma`
- `prisma/migrations/20260527193000_add_login_lockout_fields/migration.sql`
- `src/app/(auth)/login/page.tsx`
- `src/lib/auth.ts`
- `src/lib/auth/login-credentials.ts`
- `src/lib/actions/auth.actions.ts`
- `src/lib/auth/password-reset.ts`
- `src/lib/auth/trusted-device.ts`
- `src/lib/actions/user.actions.ts`
- `src/lib/validations/auth.schema.ts`
- `src/lib/validations/user.schema.ts`
- `src/app/(auth)/forgot-password/page.tsx`
- `src/app/(auth)/reset-password/page.tsx`
- `src/lib/__tests__/login-credentials.test.ts`
- `src/lib/__tests__/password-reset.test.ts`
- `src/lib/__tests__/trusted-device.test.ts`
- `src/lib/__tests__/auth-actions.test.ts`
- `src/lib/validations/__tests__/user.schema.test.ts`
- `e2e/auth.spec.ts`
- `e2e/fixtures/users.ts`
- `scripts/seed-e2e.ts`
- `.env.example`

## Flujo de recuperacion

1. El usuario ingresa su correo institucional en `/forgot-password`.
2. La respuesta publica siempre es generica para evitar enumeracion de usuarios.
3. Si la cuenta existe, esta activa y tiene `recoveryEmail`, se genera un token temporal.
4. Solo se guarda `tokenHash` en la base.
5. El enlace vence en 30 minutos.
6. Al confirmar nueva contrasena, el token se marca como usado y se limpian contadores de bloqueo.
7. La nueva contrasena se compara contra la actual y las ultimas 3 registradas.

## Variables de entorno nuevas

```txt
NEXT_PUBLIC_APP_URL=http://localhost:3000
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
PASSWORD_RESET_FROM_EMAIL=
```

## Migraciones

- `20260527193000_add_login_lockout_fields`
- `20260528103000_add_password_recovery`
- `20260528113000_add_password_history`
- `20260528123000_add_trusted_device_tokens`

Las migraciones de recuperacion, historial y dispositivos recordados fueron aplicadas en la base local configurada con `.env.local`.

## Pruebas esperadas

- `npm.cmd run lint`
- `npx.cmd tsc --noEmit`
- `npm.cmd run test:run`
- `npm.cmd run test:integration`
- `npm.cmd run test:e2e:auth -- e2e/auth.spec.ts --reporter=list`
- `npm.cmd run build`

## Pendientes

- Evaluar CAPTCHA adaptativo si aparece abuso real.
- Agregar pantalla de revocacion de dispositivos recordados si se requiere administracion visible.
- Revisar `README.md` antes de commit porque contiene cambios no relacionados reportados durante el sprint.
