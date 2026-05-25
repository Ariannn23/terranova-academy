# Sprint 01 - Seguridad base y RBAC

**Rama:** `feature/sprint-01-rbac-security`  
**Objetivo:** Implementar control real de roles en rutas, Server Actions y recursos sensibles del sistema TerraNova Academy.  
**Commit sugerido:** `feat: implementar RBAC y protección de Server Actions y reportes (Sprint 01)`

## Resumen ejecutivo

En este sprint se implemento una primera capa de seguridad basada en roles para proteger el dashboard, las Server Actions criticas y la generacion de reportes PDF.

El sistema ya contaba con autenticacion mediante NextAuth y un campo `User.role` en Prisma. Este sprint aprovecho esa estructura existente sin modificar el esquema de base de datos.

## Roles soportados

Se definieron los siguientes roles compatibles con `User.role`:

- `ADMIN`
- `DIRECTOR`
- `DOCENTE`
- `RECEPCION`
- `CAJA`
- `COORDINADOR`

## Grupos de permisos creados

Se creo el archivo `src/lib/rbac.ts` para centralizar roles, grupos de permisos y reglas de rutas.

Grupos implementados:

| Grupo | Roles incluidos | Uso principal |
|---|---|---|
| `ADMINISTRATION` | `ADMIN`, `DIRECTOR` | Configuracion, docentes, comunicados administrativos. |
| `ACADEMIC` | `ADMIN`, `DIRECTOR`, `COORDINADOR`, `DOCENTE` | Cursos, horarios, notas, asistencia y calendario academico. |
| `ADMISSIONS` | `ADMIN`, `DIRECTOR`, `RECEPCION` | Estudiantes y matriculas. |
| `FINANCE` | `ADMIN`, `DIRECTOR`, `CAJA` | Pagos, conceptos de pago, recibos y morosidad. |
| `DISCIPLINE` | `ADMIN`, `DIRECTOR`, `COORDINADOR` | Incidencias e inhabilitaciones. |
| `REPORTS` | `ADMIN`, `DIRECTOR`, `COORDINADOR`, `CAJA` | Dashboard, reportes y exportaciones. |

## Helpers de seguridad agregados

Se actualizaron los helpers de autenticacion en `src/lib/auth.ts`.

Funciones agregadas:

| Helper | Proposito |
|---|---|
| `getCurrentUser()` | Obtiene el usuario autenticado desde la sesion y consulta sus datos actuales en base de datos. |
| `requireAuth()` | Exige una sesion valida. Si no existe, lanza `AuthenticationError`. |
| `requireRole(allowedRoles)` | Exige autenticacion y verifica que el rol este dentro de los roles permitidos. Si no, lanza `AuthorizationError`. |

Tambien se agregaron las clases:

- `AuthenticationError`
- `AuthorizationError`

## Tipado de NextAuth

Se agrego `src/types/next-auth.d.ts` para extender los tipos de NextAuth y permitir:

- `session.user.id`
- `session.user.role`
- `JWT.role`

Esto evita depender de propiedades no tipadas en la sesion.

## Middleware actualizado

Se modifico `src/middleware.ts` para:

1. Redirigir a `/login` si el usuario no esta autenticado.
2. Verificar el rol del usuario contra la ruta del dashboard.
3. Redirigir usuarios autenticados a su modulo permitido por defecto si intentan acceder a una ruta no autorizada.

Rutas por defecto:

| Rol | Ruta por defecto |
|---|---|
| `DOCENTE` | `/dashboard/notas` |
| `RECEPCION` | `/dashboard/matriculas` |
| `CAJA` | `/dashboard/pagos` |
| `COORDINADOR` | `/dashboard/reportes` |
| `ADMIN` / `DIRECTOR` | `/dashboard` |

## Proteccion de rutas del dashboard

Se agregaron reglas de rol para rutas como:

| Ruta | Roles permitidos |
|---|---|
| `/dashboard/configuracion` | `ADMIN`, `DIRECTOR` |
| `/dashboard/docentes` | `ADMIN`, `DIRECTOR` |
| `/dashboard/cursos` | `ADMIN`, `DIRECTOR`, `COORDINADOR`, `DOCENTE` |
| `/dashboard/horarios` | `ADMIN`, `DIRECTOR`, `COORDINADOR`, `DOCENTE` |
| `/dashboard/notas` | `ADMIN`, `DIRECTOR`, `COORDINADOR`, `DOCENTE` |
| `/dashboard/asistencia` | `ADMIN`, `DIRECTOR`, `COORDINADOR`, `DOCENTE` |
| `/dashboard/matriculas` | `ADMIN`, `DIRECTOR`, `RECEPCION` |
| `/dashboard/estudiantes` | `ADMIN`, `DIRECTOR`, `RECEPCION` |
| `/dashboard/pagos` | `ADMIN`, `DIRECTOR`, `CAJA` |
| `/dashboard/incidencias` | `ADMIN`, `DIRECTOR`, `COORDINADOR` |
| `/dashboard/inhabilitaciones` | `ADMIN`, `DIRECTOR`, `COORDINADOR` |
| `/dashboard/reportes` | `ADMIN`, `DIRECTOR`, `COORDINADOR`, `CAJA` |
| `/dashboard/comunicados` | `ADMIN`, `DIRECTOR` |
| `/dashboard/calendar` | `ADMIN`, `DIRECTOR`, `COORDINADOR`, `DOCENTE` |

## Server Actions protegidas

Se agregaron llamadas a `requireAuth()` y `requireRole()` en acciones criticas.

Archivos protegidos:

- `src/lib/actions/student.actions.ts`
- `src/lib/actions/enrollment.actions.ts`
- `src/lib/actions/payment.actions.ts`
- `src/lib/actions/grade.actions.ts`
- `src/lib/actions/attendance.actions.ts`
- `src/lib/actions/incident.actions.ts`
- `src/lib/actions/disability.actions.ts`
- `src/lib/actions/report.actions.ts`
- `src/lib/actions/teacher.actions.ts`
- `src/lib/actions/course.actions.ts`
- `src/lib/actions/schedule.actions.ts`
- `src/lib/actions/academic.actions.ts`
- `src/lib/actions/announcement.actions.ts`
- `src/lib/actions/calendar.actions.ts`
- `src/lib/actions/dashboard.actions.ts`
- `src/lib/actions/upload.actions.ts`

## Politica de permisos aplicada por modulo

| Modulo | Politica aplicada |
|---|---|
| Estudiantes | Lectura con sesion; creacion/edicion con `ADMISSIONS`. |
| Matriculas | Lectura con sesion; creacion, importacion, traslado y cambio de estado con `ADMISSIONS`. |
| Pagos | Acceso financiero con `FINANCE`; reportes financieros con `REPORTS`. |
| Notas | Acceso y escritura academica con `ACADEMIC`. |
| Asistencia | Lectura general con sesion; registro y justificacion con `ACADEMIC`. |
| Incidencias | Acceso y escritura con `DISCIPLINE`. |
| Inhabilitaciones | Acceso y escritura con `DISCIPLINE`. |
| Reportes | Exportaciones con `REPORTS`. |
| Docentes | Lectura con sesion; gestion con `ADMINISTRATION`. |
| Cursos y horarios | Gestion con `ACADEMIC`. |
| Calendario | Lectura con sesion; gestion con `ACADEMIC`. |
| Comunicados | Lectura con sesion; gestion con `ADMINISTRATION`. |
| Fotos | Foto de estudiante con `ADMISSIONS`; foto de docente con `ADMINISTRATION`. |

## Proteccion de PDFs

Se actualizo `src/app/api/pdf/route.tsx` para validar permisos por tipo de documento:

| Tipo de PDF | Grupo permitido |
|---|---|
| `receipt` | `FINANCE` |
| `attendance`, `grades`, `student-attendance`, `student-schedule` | `ACADEMIC` |
| `incident`, `student-incidents`, `student-disabilities` | `DISCIPLINE` |
| Otros tipos documentales | `REPORTS` |

Si el usuario no tiene permiso, el endpoint devuelve `403 Forbidden`.

## Archivos nuevos

- `src/lib/rbac.ts`
- `src/types/next-auth.d.ts`

## Archivos modificados

- `src/app/(dashboard)/layout.tsx`
- `src/app/api/pdf/route.tsx`
- `src/lib/auth.ts`
- `src/lib/auth.config.ts`
- `src/middleware.ts`
- `src/lib/actions/academic.actions.ts`
- `src/lib/actions/announcement.actions.ts`
- `src/lib/actions/attendance.actions.ts`
- `src/lib/actions/calendar.actions.ts`
- `src/lib/actions/course.actions.ts`
- `src/lib/actions/dashboard.actions.ts`
- `src/lib/actions/disability.actions.ts`
- `src/lib/actions/enrollment.actions.ts`
- `src/lib/actions/grade.actions.ts`
- `src/lib/actions/incident.actions.ts`
- `src/lib/actions/payment.actions.ts`
- `src/lib/actions/report.actions.ts`
- `src/lib/actions/schedule.actions.ts`
- `src/lib/actions/student.actions.ts`
- `src/lib/actions/teacher.actions.ts`
- `src/lib/actions/upload.actions.ts`

## Validaciones realizadas

Se ejecuto:

```bash
npx.cmd tsc --noEmit
```

Resultado:

- TypeScript paso correctamente.

Tambien se ejecuto:

```bash
npm.cmd run build
```

Resultado:

- La fase de compilacion de Next.js paso.
- La fase de lint fallo por deuda tecnica preexistente del proyecto: uso amplio de `any`, imports no usados, textos JSX sin escapar y scripts CommonJS dentro de `src/scripts`.
- No se identificaron errores TypeScript causados por el RBAC nuevo.

## Pruebas manuales sugeridas

| Caso | Resultado esperado |
|---|---|
| Usuario no autenticado abre `/dashboard/pagos` | Redireccion a `/login`. |
| Usuario `DOCENTE` abre `/dashboard/pagos` | Redireccion a `/dashboard/notas`. |
| Usuario `CAJA` abre `/dashboard/pagos` | Acceso permitido. |
| Usuario `CAJA` intenta registrar notas | Accion denegada. |
| Usuario `RECEPCION` crea estudiante | Accion permitida. |
| Usuario `RECEPCION` intenta registrar pago | Accion denegada. |
| Usuario `COORDINADOR` registra incidencia | Accion permitida. |
| Usuario `DOCENTE` intenta crear inhabilitacion | Accion denegada. |
| Usuario sin rol valido intenta entrar al dashboard | Debe quedar redirigido o bloqueado por reglas RBAC. |
| API PDF `receipt` con usuario `DOCENTE` | Respuesta `403 Forbidden`. |
| API PDF `receipt` con usuario `CAJA` | Respuesta permitida si la sesion es valida. |

## Pendientes detectados

1. Estandarizar el manejo visual de errores `AuthenticationError` y `AuthorizationError` en formularios cliente.
2. Agregar pruebas automatizadas unitarias e integracion para RBAC.
3. Crear usuarios seed para cada rol y facilitar pruebas manuales.
4. Revisar si `DIRECTOR` debe tener permisos equivalentes a `ADMIN` en todos los modulos.
5. Crear auditoria de acciones criticas en un sprint posterior.
6. Limpiar deuda de lint preexistente para permitir `npm run build` completamente exitoso.

## Estado del sprint

Sprint completado a nivel de implementacion y validacion TypeScript.

No se modifico `prisma/schema.prisma` porque el campo existente `User.role` permite soportar los roles solicitados sin migracion adicional.
