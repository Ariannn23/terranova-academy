# Sprint 17B — Active session guard

## 1) Objetivo

Endurecer acceso a rutas protegidas para que un usuario desactivado no pueda seguir usando `/dashboard/*` aunque tenga una sesion previa activa.

## 2) Problema de sesion activa

Con estrategia JWT, la sesion puede seguir existiendo aunque el estado `User.active` cambie en base de datos. Si solo se confia en token, un usuario desactivado podria mantener acceso hasta expirar sesion.

## 3) Estrategia aplicada

- Mantener bloqueo de login en `authorize` para usuarios inactivos.
- Reforzar `requireAuth()` para validar en DB en cada request protegido/server action.
- Mantener `requireRole()` dependiendo de `requireAuth()`.
- Unificar el guard del dashboard para usar `requireAuth()` en el layout protegido.
- No exponer `passwordHash` en ningun flujo.

## 4) Archivos modificados

- `src/lib/auth.ts`
- `src/app/(dashboard)/layout.tsx`
- `src/lib/__tests__/auth.test.ts`

## 5) Cambios en requireAuth

`requireAuth()` ahora:

1. Obtiene sesion con `auth()`.
2. Valida `session.user.id`.
3. Consulta `prisma.user.findUnique` con `select` seguro:
   - `id`
   - `email`
   - `name`
   - `role`
   - `active`
4. Bloquea si el usuario no existe.
5. Bloquea si `active === false`.
6. Normaliza rol para devolucion segura.

No selecciona `passwordHash`.

## 6) Cambios en requireRole

Sin cambios de contrato: sigue usando `requireAuth()` como dependencia directa, por lo que hereda el bloqueo de usuarios inactivos o inexistentes.

## 7) Cambios en layout protegido

`src/app/(dashboard)/layout.tsx` ahora usa `requireAuth()` en lugar de duplicar chequeos locales con `auth()+prisma`:

- Si no hay sesion valida -> redirige a `/login`.
- Si el usuario esta inactivo/inexistente -> redirige a `/login`.
- Mantiene validacion RBAC por ruta con `getAllowedRolesForPath` y `hasAllowedRole`.
- Sin cambios visuales de UI.

## 8) Tests agregados

Nuevo archivo: `src/lib/__tests__/auth.test.ts`

Casos cubiertos:

1. `requireAuth()` rechaza usuario sin sesion.
2. `requireAuth()` rechaza usuario inexistente.
3. `requireAuth()` rechaza usuario con `active: false`.
4. `requireAuth()` acepta usuario con `active: true`.
5. `requireRole()` rechaza usuario inactivo aunque tenga rol permitido.
6. `requireRole()` acepta usuario activo con rol permitido.

## 9) Prueba manual critica

Escenario esperado:

1. Login con usuario operativo (CAJA/DOCENTE).
2. Desactivar ese usuario desde ADMIN en otra sesion.
3. Reintentar navegar a `/dashboard/*` desde la sesion original.
4. Resultado esperado: bloqueo/redireccion a `/login`.

Estado:

- Flujo manual end-to-end pendiente de ejecucion con dos sesiones reales en navegador.

## 10) Validaciones ejecutadas

- `npx.cmd prisma validate` -> OK
- `npx.cmd prisma generate` -> OK
- `npm.cmd run lint` -> OK
- `npx.cmd tsc --noEmit` -> OK
- `npm.cmd run test:run` -> OK (176/176)
- `npm.cmd run test:integration` -> OK (41/41)
- `npm.cmd run test:e2e -- --reporter=list` -> OK base (7 passed / 11 skipped esperados)
- `npm.cmd run build` -> OK

## 11) Pendientes

- Ejecutar prueba manual critica con sesiones reales (ADMIN + usuario objetivo) y registrar evidencia.
- Habilitar `E2E_DATABASE_URL` para suite autenticada completa sin skips.
