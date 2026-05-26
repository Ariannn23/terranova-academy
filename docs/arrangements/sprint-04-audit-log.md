# Sprint 04 - Auditoria de acciones criticas

## Datos generales

- Sistema: TerraNova Academy
- Rama: `feature/sprint-04-audit-log`
- Objetivo: implementar auditoria formal de acciones criticas mediante `AuditLog`, helpers reutilizables y registros controlados de eventos sensibles.

## Diagnostico previo

- No existia un modelo `AuditLog` ni helper de auditoria en los archivos revisados.
- Ya existian `getCurrentUser()`, `requireAuth()` y `requireRole()` en `src/lib/auth.ts`.
- Ya existian grupos RBAC en `src/lib/rbac.ts`.
- Los sprints previos estaban documentados:
  - Sprint 01: RBAC implementado.
  - Sprint 02: `Section.capacity` implementado y aplicado manualmente en BD.
  - Sprint 03: pagos parciales con `PaymentTransaction` implementados.

## Modelo Prisma creado

Se agrego el modelo `AuditLog` en `prisma/schema.prisma` con:

- Usuario: `userId`, `userEmail`, `userRole`.
- Accion: `action`.
- Entidad: `entity`, `entityId`.
- Cambios: `oldValue`, `newValue`.
- Contexto: `metadata`, `ip`, `userAgent`.
- Fecha: `createdAt`.
- Indices por usuario, accion, entidad, entidadId y fecha.

No se agrego relacion obligatoria con `User` para evitar romper migraciones o datos existentes.

## Migracion

Se creo migracion manual versionada:

```bash
prisma/migrations/20260525165000_add_audit_log/migration.sql
```

Contenido principal:

```sql
CREATE TABLE "AuditLog" (
  "id" TEXT NOT NULL,
  "userId" TEXT,
  "userEmail" TEXT,
  "userRole" TEXT,
  "action" TEXT NOT NULL,
  "entity" TEXT NOT NULL,
  "entityId" TEXT,
  "oldValue" JSONB,
  "newValue" JSONB,
  "metadata" JSONB,
  "ip" TEXT,
  "userAgent" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);
```

Tambien se agregaron indices para consultas frecuentes.

Se intento ejecutar:

```bash
npx.cmd prisma migrate dev --name add_audit_log
```

Resultado: timeout por conexion/ejecucion de migracion. La migracion manual queda lista para aplicarse en la base real.

## Helper de auditoria

Archivo creado:

```bash
src/lib/audit.ts
```

Exporta:

- `AuditAction`
- `AuditEntity`
- `safeSerializeAuditValue()`
- `createAuditLog()`

Reglas aplicadas:

- Si falla la auditoria, la accion principal no se rompe.
- Se usa `getCurrentUser()` para capturar usuario autenticado.
- Se sanitizan campos sensibles como `password`, `passwordHash`, `token`, `secret`, `authorization` y `cookie`.
- No se guardan archivos completos, PDFs completos, tokens ni credenciales.

## Accion opcional de lectura

Archivo creado:

```bash
src/lib/actions/audit.actions.ts
```

Funciones:

- `getAuditLogs()`
- `getAuditLogsByEntity()`

Proteccion:

```ts
await requireRole(ROLE_GROUPS.ADMINISTRATION);
```

No se creo UI en este sprint.

## Acciones auditadas

| Archivo | Acciones auditadas |
| --- | --- |
| `src/lib/actions/enrollment.actions.ts` | `createEnrollment`, `updateEnrollment`, `transferSection`, `toggleEnrollmentStatus` |
| `src/lib/actions/payment.actions.ts` | `createPaymentConcept`, `registerPayment`, `updateOverduePayments` |
| `src/lib/actions/grade.actions.ts` | `saveGrades`, `calculateFinalGrade`, `calculateAllFinalGrades` |
| `src/lib/actions/attendance.actions.ts` | `saveAttendance`, `justifyAbsence` |
| `src/lib/actions/incident.actions.ts` | `createIncident`, `updateIncident`, `deleteIncident` |
| `src/lib/actions/disability.actions.ts` | `createDisability`, `resolveDisability` |
| `src/lib/actions/report.actions.ts` | `exportGradesToExcel`, `exportAttendanceReport`, `exportFinancialReport` |
| `src/lib/actions/student.actions.ts` | `createStudent`, `updateStudent`, `toggleStudentStatus` |
| `src/lib/actions/teacher.actions.ts` | `createTeacher`, `updateTeacher`, `toggleTeacherStatus` |
| `src/lib/actions/course.actions.ts` | `createCourse`, `updateCourse` |
| `src/lib/actions/academic.actions.ts` | `createCourse`, `updateCourse`, `createSection`, `assignTeacherToSection`, `saveSchedule` |
| `src/app/api/pdf/route.tsx` | Generacion exitosa de PDFs |

## Datos auditados

- Identificador de entidad afectada.
- Accion realizada.
- Usuario, correo y rol cuando hay sesion.
- Valores anteriores y nuevos cuando aplica.
- Metadata contextual: modulo, operacion, tipo de reporte, filtros, conteos afectados, estado de pago, curso, periodo o seccion.

## Datos no auditados por seguridad

- `passwordHash`.
- Contraseñas.
- Tokens.
- Cookies.
- Secrets.
- PDFs completos.
- Excels completos.
- Archivos subidos completos.

## Validaciones ejecutadas

| Comando | Resultado |
| --- | --- |
| `npx.cmd prisma format` | Correcto |
| `npx.cmd prisma validate` | Correcto, con advertencia existente de `driverAdapters` deprecated |
| `npx.cmd prisma generate` | Correcto |
| `npx.cmd tsc --noEmit` | Correcto |
| `npm.cmd run build` | Compila, pero falla en lint por deuda tecnica existente |

## Observacion sobre build

`next build` compilo correctamente, pero fallo en la fase de lint por errores preexistentes generalizados:

- `no-explicit-any`.
- Imports no usados.
- Comillas sin escapar en JSX.
- Scripts CommonJS con `require`.
- Warnings de hooks y uso de `<img>`.

No se corrigieron en este sprint porque el alcance era solo auditoria.

## Pruebas manuales sugeridas

| Caso | Resultado esperado |
| --- | --- |
| Crear matricula | Se crea `AuditLog` con `entity = ENROLLMENT`. |
| Registrar pago parcial | Se crea `AuditLog` con `entity = PAYMENT_TRANSACTION`. |
| Registrar pago total | Se audita transaccion y saldo final. |
| Guardar notas | Se crea `AuditLog` con `entity = GRADE`. |
| Registrar asistencia | Se crea `AuditLog` con `entity = ATTENDANCE`. |
| Justificar falta | Se registra cambio anterior/nuevo de asistencia. |
| Registrar incidencia grave | Se crea `AuditLog` con `entity = INCIDENT`. |
| Crear inhabilitacion | Se crea `AuditLog` con `entity = DISABILITY`. |
| Resolver inhabilitacion | Se audita estado anterior/nuevo. |
| Exportar reporte financiero | Se crea `AuditLog` con `entity = REPORT`, sin guardar archivo. |
| Generar PDF de recibo | Se crea `AuditLog` con `entity = PDF`, sin guardar contenido del PDF. |
| Usuario sin permisos intenta accion | RBAC debe denegar; no es obligatorio auditar fallo en este sprint. |

## Pendientes futuros

1. Aplicar la migracion manual en la base real si `prisma migrate dev` sigue con timeout.
2. Crear pantalla administrativa para consultar auditoria.
3. Agregar filtros por usuario, modulo, entidad, accion y rango de fechas.
4. Auditar intentos fallidos o denegados por RBAC en un sprint posterior.
5. Definir politica de retencion de logs.
6. Agregar pruebas automatizadas especificas para auditoria.

## Mensaje de commit sugerido

```bash
git commit -m "feat: implementar auditoria de acciones criticas con AuditLog (Sprint 04)"
```

