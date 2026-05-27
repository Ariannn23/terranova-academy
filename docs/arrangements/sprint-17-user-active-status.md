# Sprint 17 — Estado Activo/Inactivo de Usuarios

## Objetivo del Sprint
Implementar de forma segura el control de activación y desactivación de cuentas de usuario en el sistema TerraNova Academy desde el panel administrativo `/dashboard/usuarios`, impidiendo el inicio de sesión de usuarios inactivos y protegiendo al último administrador activo de quedar bloqueado o degradado.

## Rama Git
`feature/sprint-17-user-active-status`

## Base de Datos y Migración
Se añadió el campo `active` al modelo `User` en `prisma/schema.prisma`:
```prisma
active Boolean @default(true)
```

### Script de Migración (`prisma/migrations/20260527064700_add_user_active_status/migration.sql`):
```sql
ALTER TABLE "User" ADD COLUMN "active" BOOLEAN NOT NULL DEFAULT true;
```
Esto asegura que todos los usuarios existentes en producción y desarrollo se mantengan activos (`active = true`) por defecto.

## Seguridad y Autenticación
1. **Validación Instantánea en Base de Datos para cada Request Protegido**:
   - **En `src/lib/auth.ts` (getCurrentUser / requireAuth)**:
     - El helper `getCurrentUser()` incluye ahora de forma explícita el campo `active` dentro del selector SQL/Prisma: `active: true`.
     - El validador `requireAuth()` (que protege todas las Server Actions y páginas del servidor) comprueba la columna `active` en la base de datos en cada invocación. Si `!user.active`, lanza inmediatamente un error `AuthenticationError`, invalidando cualquier acción en curso.
   - **En el Layout Protegido (`src/app/(dashboard)/layout.tsx`)**:
     - Al cargar el layout que envuelve todo el árbol `/dashboard/*`, se ejecuta una consulta directa y en tiempo real a la base de datos (`prisma.user.findUnique`) para verificar el estado de `active`.
     - Si el usuario ha sido desactivado recientemente por un administrador, el layout detecta instantáneamente que `active` es `false` y ejecuta un `redirect("/login")` forzado, revocando su acceso a la intranet inmediatamente y previniendo que navegue en la sesión del lado del cliente.
2. **Bloqueo en el Flujo de Autenticación Principal**:
   - En la función `authorize` de NextAuth (CredentialsProvider) en `src/lib/auth.ts`, se valida si el usuario está activo. Si un usuario inactivo intenta ingresar, se retorna `null` impidiendo el inicio de sesión con un mensaje genérico por seguridad.
3. **Protección Administrativa Crítica**:
   - La acción `toggleUserStatus` exige rol `ADMIN` a través de `requireRole(["ADMIN"])`.
   - Se valida el input de forma estricta mediante Zod.
   - **Salvaguarda de Último Administrador**: Si el usuario a desactivar posee el rol `ADMIN`, el sistema consulta la base de datos para contar los administradores activos (`prisma.user.count({ where: { role: "ADMIN", active: true } })`). Si el conteo es igual o menor a 1, la desactivación es rechazada inmediatamente con un error descriptivo: *"No se puede desactivar al único ADMIN activo del sistema. Primero asigna el rol ADMIN a otro usuario activo."*
   - **Exclusión de Campos Sensibles**: La acción actualiza y retorna el usuario utilizando el selector `SAFE_USER_SELECT`, garantizando que bajo ninguna circunstancia se exponga el campo `passwordHash`.
   - **Registro de Auditoría**: Toda activación/desactivación genera de forma automática un log de auditoría con la acción `CHANGE_STATUS` sobre la entidad `USER`, registrando los valores previos y posteriores.

## Cambios en el Frontend (UI)
1. **UserStatusBadge (`src/components/modules/users/UserStatusBadge.tsx`)**:
   - Un componente visual elegante que renderiza el estado con colores curados y armoniosos acordes a la estética del sistema:
     - **Activo**: Verde/Esmeralda con micro-indicador redondo vibrante.
     - **Inactivo**: Gris/Rosa con micro-indicador apagado.
2. **UsersClient (`src/components/modules/users/UsersClient.tsx`)**:
   - Se añadió la columna **Estado** a la tabla de usuarios.
   - Se integró un **Filtro de Estado** en la cabecera (Todos, Activos, Inactivos).
   - Se agregaron contadores (KPI Cards) superiores dinámicos que muestran el total de usuarios Activos vs Inactivos en tiempo real.
   - Se integró un botón de acción en cada fila que permite cambiar el estado (Activar / Desactivar) utilizando los íconos de `Power` y `PowerOff` de Lucide.
   - Se deshabilitan campos de edición/cambio de rol inline para usuarios que se encuentran inactivos.

## Cobertura de Pruebas
1. **Tests de Validación Zod (`src/lib/validations/__tests__/user.schema.test.ts`)**:
   - Caso exitoso aceptando `active: true`.
   - Caso exitoso aceptando `active: false`.
   - Rechazo de `userId` vacío.
   - Rechazo de `active` ausente o de tipo incorrecto (por ejemplo, strings).
2. **Tests de Server Actions (`src/lib/actions/__tests__/user.actions.test.ts`)**:
   - Validación de que `toggleUserStatus` requiere rol `ADMIN`.
   - Validación de activación exitosa en la DB y mensaje retornado.
   - Validación de desactivación exitosa.
   - Protección del último admin activo (debe fallar con error controlado).
   - Verificación de que `passwordHash` está ausente de la respuesta.
   - Comprobación de que se genera un `AuditLog` correcto para la acción.
   - Validación de que `getUsers()` retorna el campo `active` sin password hashes.

## Criterios de Aceptación Cumplidos
- [x] Modelo `User` actualizado con `active Boolean @default(true)`.
- [x] Migración de base de datos generada y aplicada.
- [x] Validación activa en tiempo real en `requireAuth()` (Server Actions y páginas).
- [x] Validación activa en tiempo real contra base de datos en `DashboardLayout` (`layout.tsx`) expulsando inmediatamente a usuarios desactivados de la intranet.
- [x] Server action `toggleUserStatus` implementada con protección de último admin y logs de auditoría.
- [x] Control de NextAuth bloquea inicio de sesión a inactivos de manera segura.
- [x] Tabla de usuarios actualizada con columna de estado, badge visual, filtros y botones de acción rápidos.
- [x] Integridad del sistema validada mediante compilación de producción exitosa y paso completo de la suite de pruebas unitarias/integración (`npm run test:run`).
