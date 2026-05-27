# Sprint 16C — Módulo Administrativo de Usuarios y Roles

## Problema Detectado

Hasta Sprint 16B, la única manera de crear usuarios del sistema (DIRECTOR, RECEPCION, CAJA, DOCENTE, COORDINADOR) era mediante seeds manuales o scripts de consola. Esto generaba dos problemas:

1. **Dependencia de consola**: El personal de TI necesitaba acceso a la consola del servidor para crear usuarios operativos.
2. **Riesgo de producción**: Un seed masivo con credenciales hardcodeadas es un vector de seguridad si llega a producción sin los guards adecuados.

## Por qué no se deben crear usuarios reales en el seed

El `prisma/seed.ts` debe contener solo **datos base del sistema** (año lectivo, grados, secciones, conceptos de pago). Los usuarios operativos deben crearse mediante el módulo administrativo porque:

- Las credenciales no deben estar en código fuente.
- El ADMIN puede gestionar el acceso de manera controlada desde la UI.
- El audit trail registra quién creó qué usuario y cuándo.
- Las contraseñas se hashean con bcrypt antes de guardarse.

## Flujo Correcto de Producción

```
1. Migraciones DB       → npx prisma migrate deploy
2. Seed base            → npm run seed        (datos base, SIN usuarios)
3. Bootstrap ADMIN      → npm run bootstrap:admin  (primer ADMIN real)
4. Login como ADMIN     → /login
5. Crear usuarios       → /dashboard/usuarios
```

## Ruta Creada

| Ruta | Acceso | Descripción |
|---|---|---|
| `/dashboard/usuarios` | Solo ADMIN | Módulo de gestión de usuarios |

## Permisos

- **RBAC**: `ROUTE_ROLE_RULES` actualizado con `{ prefix: "/dashboard/usuarios", roles: ["ADMIN"] }`
- **Navegación**: Item "Usuarios" con `allowedRoles: ["ADMIN"]` — solo visible en Sidebar para ADMIN
- **Server Actions**: Todas las acciones usan `requireRole(["ADMIN"])`
- **Middleware**: Protegido automáticamente por las reglas de RBAC en `src/middleware.ts`

## Server Actions Creadas

**Archivo**: `src/lib/actions/user.actions.ts`

| Acción | Descripción | Protección |
|---|---|---|
| `getUsers()` | Lista todos los usuarios (sin passwordHash) | ADMIN |
| `createUser(data)` | Crea usuario con contraseña hasheada | ADMIN |
| `updateUser(id, data)` | Actualiza nombre y/o email | ADMIN |
| `changeUserRole(data)` | Cambia el rol — con protección último ADMIN | ADMIN |
| `resetUserPassword(data)` | Resetea contraseña — bcrypt antes de guardar | ADMIN |

## Componentes Creados

**Carpeta**: `src/components/modules/users/`

| Componente | Propósito |
|---|---|
| `UsersClient.tsx` | Tabla principal con búsqueda, filtros por rol, cambio inline de rol, acciones |
| `UserFormModal.tsx` | Modal crear/editar usuario con react-hook-form + Zod |
| `ResetPasswordModal.tsx` | Modal resetear contraseña — campo de nueva password |
| `UserRoleBadge.tsx` | Badge visual con color por rol |

## Validaciones Zod Creadas

**Archivo**: `src/lib/validations/user.schema.ts`

| Schema | Campos |
|---|---|
| `createUserSchema` | name(min 2), email, role(enum ROLES), password(min 8) |
| `updateUserSchema` | name(opcional), email(opcional) |
| `changeUserRoleSchema` | userId, role(enum ROLES) |
| `resetUserPasswordSchema` | userId, password(min 8) |

## Tipos Creados

**Archivo**: `src/types/user.ts`

- `SafeUser` — sin `passwordHash`, con id, name, email, role, createdAt, updatedAt
- `UserRole` — alias de `AppRole` de RBAC
- Tipos de input para cada operación

## Seguridad Aplicada

- ✅ `getUsers()` usa `select` explícito sin `passwordHash`
- ✅ `createUser()` hashea con `bcrypt.hash(password, 12)` antes de `prisma.user.create`
- ✅ `resetUserPassword()` hashea con `bcrypt.hash(password, 12)` antes de actualizar
- ✅ Ninguna contraseña aparece en logs (`console.log` o `console.error`)
- ✅ Ningún hash se expone en respuestas de Server Actions
- ✅ `changeUserRole()` protege el último ADMIN del sistema
- ✅ Todas las acciones usan `requireRole(["ADMIN"])`
- ✅ Validación Zod antes de cualquier operación de base de datos
- ✅ `/api/seed` permanece deshabilitado (410 Gone)

## Decisión: sin campo `active` en User

El modelo `User` actual no tiene campo `active`. Por tanto:
- `toggleUserStatus()` **no se implementa** en este sprint
- La UI no muestra controles de activar/desactivar
- **Pendiente Sprint 17**: agregar `active Boolean @default(true)` al schema y migrar

## Tests Agregados

| Archivo | Tests |
|---|---|
| `src/lib/validations/__tests__/user.schema.test.ts` | 14 casos: createUser (6), updateUser (4), changeUserRole (3), resetUserPassword (3) |
| `src/lib/actions/__tests__/user.actions.test.ts` | 11 casos: getUsers (2), createUser (4), changeUserRole (3), resetUserPassword (2) |

## Resultado de Validaciones

| Validación | Resultado |
|---|---|
| `npm run lint` | ✅ Sin errores |
| `npx tsc --noEmit` | ✅ Sin errores |
| `npm run test:run` | ✅ Todos los tests pasan |
| `npm run build` | ✅ Build exitoso |

## Pendientes (próximos sprints)

1. **Sprint 17**: Agregar `active Boolean @default(true)` al modelo `User` y migrar. Implementar `toggleUserStatus()` en Server Actions y `UserStatusBadge` en UI.
2. **Futuro**: Filtro por estado activo/inactivo en la tabla de usuarios.
3. **Futuro**: Invitación por email para que los usuarios configuren su propia contraseña.
4. **E2E**: Agregar pruebas Playwright para el flujo completo del módulo usuarios.

## Mensaje de Commit

```bash
git add .
git add -f docs/arrangements/sprint-16c-admin-users-management.md
git commit -m "feat: agregar modulo administrativo de usuarios (Sprint 16C)"
git push origin feature/sprint-16c-admin-users-management
```
