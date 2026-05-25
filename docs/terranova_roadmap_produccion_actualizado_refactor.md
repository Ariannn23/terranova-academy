# TerraNova Academy — Fallas, mejoras y roadmap actualizado hacia producción

**Proyecto:** TerraNova Academy  
**Tipo de sistema:** ERP / Dashboard escolar web  
**Documento:** Roadmap técnico actualizado  
**Objetivo:** ordenar las fallas detectadas, registrar el avance real de los sprints 01, 02 y 03, agregar el refactor frontend en el orden correcto y definir el plan restante para llegar a producción sin romper el sistema.  
**Estado actual resumido:** desarrollo avanzado, con mejoras críticas ya iniciadas, pero todavía no listo para producción.

---

## 1. Resumen ejecutivo actualizado

TerraNova Academy ya cuenta con una base funcional importante: autenticación, dashboard, estudiantes, apoderados, docentes, cursos, horarios, matrículas, notas, asistencia, pagos, incidencias, inhabilitaciones, reportes, exportaciones Excel/PDF, calendario, comunicados y subida de imágenes.

El stack técnico es adecuado para un sistema moderno: **Next.js, TypeScript, React, Prisma ORM, PostgreSQL, Tailwind CSS, shadcn/ui, Zod, NextAuth, Supabase Storage, xlsx y @react-pdf/renderer**.

El roadmap inicial identificó fallas críticas como RBAC incompleto, falta de capacidad real en secciones, pagos parciales no modelados, ausencia de auditoría, falta de pruebas automatizadas, riesgos en reportes sensibles, deuda técnica frontend y falta de documentación operativa.

Actualmente ya se avanzó con tres sprints clave:

| Sprint | Estado | Resultado principal |
|---|---|---|
| Sprint 01 — Seguridad base y RBAC | Completado a nivel de implementación | Se protegieron rutas, Server Actions y PDFs con roles. |
| Sprint 02 — Capacidad real de secciones | Completado a nivel de código y base real | Se agregó `capacity` en `Section` y el wizard bloquea secciones llenas. |
| Sprint 03 — Pagos parciales reales | Completado a nivel de código | Se agregó `PaymentTransaction`, `balance` y lógica de abonos parciales. La migración debe aplicarse en el entorno correspondiente antes de probar en ejecución real. |

Con estos avances, el siguiente paso **no debe ser refactorizar frontend todavía**. Primero conviene cerrar trazabilidad, pruebas y seguridad de reportes. El refactor frontend debe entrar después, como un sprint de mantenibilidad controlada, para no chocar con los cambios críticos ya realizados.

---

## 2. Principio de trabajo para no romper el sistema

A partir de este punto, se recomienda mantener estas reglas:

1. **Un sprint = una falla o grupo coherente de fallas.** No mezclar seguridad, pagos, auditoría, pruebas y refactor en un solo bloque.
2. **Cada sprint debe crear su propia rama.** Ejemplo: `feature/sprint-04-audit-log`.
3. **No tocar módulos fuera del alcance del sprint**, salvo dependencias estrictamente necesarias.
4. **Mantener compatibilidad con los sprints anteriores.** El trabajo nuevo no debe romper RBAC, capacity ni pagos parciales.
5. **No hacer refactor masivo antes de pruebas y auditoría.** Primero se estabiliza, luego se limpia.
6. **Proteger reglas críticas en backend.** La UI puede ocultar botones, pero la seguridad real vive en Server Actions.
7. **Todo cambio de base de datos debe tener migración versionada.** Si Prisma no puede aplicar la migración por conexión, dejar SQL manual y documentar aplicación.
8. **Cada sprint debe terminar con validaciones mínimas:**

```bash
npx.cmd tsc --noEmit
npx.cmd prisma validate
npx.cmd prisma generate
npm.cmd run build
```

9. **Actualizar documentación por sprint.** Cada sprint debe dejar su archivo en `docs/arrangements/`.
10. **No avanzar a producción sin UAT y backup.**

---

## 3. Estado real de sprints ejecutados

### 3.1 Sprint 01 — Seguridad base y RBAC

**Rama:** `feature/sprint-01-rbac-security`  
**Estado:** Completado a nivel de implementación.  
**Resultado principal:** el sistema cuenta con helpers de seguridad, grupos de roles, protección de rutas del dashboard, protección de Server Actions críticas y control de PDFs por tipo documental.

#### Cambios logrados

- Creación de `src/lib/rbac.ts`.
- Actualización de `src/lib/auth.ts` con:
  - `getCurrentUser()`
  - `requireAuth()`
  - `requireRole()`
  - `AuthenticationError`
  - `AuthorizationError`
- Tipado de NextAuth con `src/types/next-auth.d.ts`.
- Middleware con reglas de ruta por rol.
- Protección de Server Actions críticas.
- Protección de `src/app/api/pdf/route.tsx`.

#### Pendientes derivados

- Estandarizar visualmente errores de autorización en formularios cliente.
- Agregar pruebas automatizadas para RBAC.
- Crear usuarios seed por rol para pruebas.
- Revisar si `DIRECTOR` debe ser equivalente a `ADMIN` en todos los módulos.

---

### 3.2 Sprint 02 — Capacidad real de secciones

**Rama:** `feature/sprint-02-section-capacity`  
**Estado:** Completado a nivel de código, esquema, migración versionada y base real.  
**Resultado principal:** el sistema ya calcula vacantes usando `Section.capacity` y bloquea secciones llenas desde UI y backend.

#### Cambios logrados

- Agregado `capacity Int @default(30)` al modelo `Section`.
- Migración SQL versionada:

```text
prisma/migrations/20260525142000_add_capacity_to_section/migration.sql
```

- Validación en `academic.schema.ts`.
- `getWizardData()` devuelve `capacity`, `occupied` y `available`.
- `createEnrollment()` valida capacidad antes y dentro de la transacción.
- Wizard de matrícula bloquea secciones llenas.
- Campo aplicado manualmente en Supabase SQL Editor y verificado.

#### Pendientes derivados

- Crear o actualizar UI administrativa para editar `capacity` de secciones.
- Agregar pruebas automatizadas de sección llena.
- Evaluar bloqueo transaccional más fuerte para concurrencia alta.

---

### 3.3 Sprint 03 — Pagos parciales reales

**Rama:** `feature/sprint-03-payment-transactions`  
**Estado:** Completado a nivel de código y validaciones.  
**Resultado principal:** el sistema ya modela abonos parciales como transacciones independientes y mantiene saldo pendiente por obligación de pago.

#### Cambios logrados

- Agregado `balance Float @default(0)` en `Payment`.
- Creado modelo `PaymentTransaction`.
- Migración SQL manual:

```text
prisma/migrations/20260525153000_add_payment_transactions/migration.sql
```

- Actualización de `prisma/init-schema.sql`.
- `registerPayment()` crea transacción, recalcula saldo y marca `PAGADO` solo si `balance = 0`.
- Reportes financieros usan transacciones reales como ingresos.
- Dashboard financiero usa abonos reales.
- Historial de estudiante carga transacciones.
- UI de pagos muestra monto del abono, saldo pendiente, total abonado y saldo posterior.

#### Pendientes derivados

- Aplicar la migración en la base de datos del entorno correspondiente si aún no se aplicó.
- Validar manualmente pagos parciales en ejecución real.
- Crear pruebas unitarias e integración para pagos.
- Auditar pagos en Sprint 04.

---

## 4. Matriz actualizada de fallas y ubicación en el roadmap

| ID | Área | Falla encontrada | Nivel | Estado actual | Sprint asignado |
|---|---|---|---|---|---|
| F-01 | Seguridad | RBAC granular incompleto | Crítico | Corregido en Sprint 01 | Sprint 01 |
| F-02 | Seguridad | Server Actions críticas sin autorización fuerte | Crítico | Corregido en Sprint 01 | Sprint 01 |
| F-03 | Reportes | PDFs sensibles sin control suficiente | Alto | Mejorado en Sprint 01; falta auditoría y pruebas | Sprint 06 |
| F-04 | Base de datos | `Section.capacity` no persistía capacidad real | Alto | Corregido en Sprint 02 | Sprint 02 |
| F-05 | Matrículas | Wizard usaba capacidad hardcodeada | Alto | Corregido en Sprint 02 | Sprint 02 |
| F-06 | Pagos | Pagos parciales no modelados | Crítico | Corregido en código en Sprint 03 | Sprint 03 |
| F-07 | Pagos | Falta trazabilidad granular de abonos | Alto | Mejorado con `PaymentTransaction`; falta auditoría | Sprint 03 y 04 |
| F-08 | Base de datos | No existe auditoría formal | Alto | Pendiente | Sprint 04 |
| F-09 | Pruebas | No hay pruebas automatizadas suficientes | Crítico | Pendiente | Sprint 05 |
| F-10 | Reportes | Falta consistencia y pruebas en Excel/PDF | Medio-Alto | Pendiente | Sprint 06 |
| F-11 | Uploads | Validación server-side de archivos incompleta | Alto | Pendiente | Sprint 06 |
| F-12 | Calidad | Uso de `any`, componentes grandes y lógica duplicada | Medio | Pendiente; no abordar todavía | Sprint 07 |
| F-13 | Frontend | Componentes mezclan JSX con lógica, filtros, cálculos y Server Actions | Medio-Alto | Detectado por inspección | Sprint 07 |
| F-14 | Performance | Riesgo en grillas, búsquedas y reportes masivos | Medio-Alto | Pendiente | Sprint 08 |
| F-15 | Operación | Falta documentación formal de deploy, backups y rollback | Alto | Pendiente | Sprint 09 |
| F-16 | Producción | Falta UAT, release notes y validación final | Alto | Pendiente | Sprint 10 |

---

## 5. Roadmap actualizado hacia producción

> **Importante:** los Sprints 01, 02 y 03 ya fueron trabajados. El roadmap restante empieza en Sprint 04. El refactor frontend entra después de auditoría, pruebas y seguridad de reportes para evitar choques con el avance actual.

---

# Sprint 04 — Auditoría de acciones críticas

**Rama sugerida:** `feature/sprint-04-audit-log`  
**Objetivo:** implementar trazabilidad institucional para acciones sensibles.

## Alcance

Este sprint debe encargarse **solo de auditoría**, no de refactor frontend ni de pruebas automatizadas completas.

## Fallas que corrige

- No existe `AuditLog`.
- No se sabe quién modificó pagos, notas, matrículas, incidencias o reportes.
- Los cambios críticos no tienen trazabilidad formal.

## Tareas

1. Crear modelo `AuditLog` en Prisma.
2. Crear migración versionada.
3. Crear helper `createAuditLog()`.
4. Registrar auditoría en acciones críticas:
   - crear matrícula
   - registrar pago
   - modificar nota
   - registrar asistencia masiva
   - registrar incidencia
   - crear inhabilitación
   - resolver inhabilitación
   - generar/exportar reporte sensible
5. Guardar datos mínimos:
   - `userId`
   - `action`
   - `entity`
   - `entityId`
   - `oldValue`
   - `newValue`
   - `createdAt`
6. No registrar contraseñas, secretos ni datos excesivamente sensibles.
7. Mantener RBAC del Sprint 01.
8. Mantener compatibilidad con pagos del Sprint 03.

## Modelo sugerido

```prisma
model AuditLog {
  id        String   @id @default(cuid())
  userId    String?
  action    String
  entity    String
  entityId  String?
  oldValue  Json?
  newValue  Json?
  ip        String?
  userAgent String?
  createdAt DateTime @default(now())

  @@index([userId])
  @@index([entity, entityId])
  @@index([createdAt])
}
```

## Entregables

- `AuditLog` implementado.
- Migración SQL o Prisma versionada.
- Helper `createAuditLog()`.
- Acciones críticas auditadas.
- Documento `docs/arrangements/sprint-04-audit-log.md`.

## Definition of Done

- Una matrícula creada genera auditoría.
- Un pago parcial o total genera auditoría.
- Una nota modificada genera auditoría.
- Una incidencia grave genera auditoría.
- Una inhabilitación genera auditoría.
- Un reporte sensible exportado genera auditoría.
- TypeScript y Prisma validan correctamente.

---

# Sprint 05 — Pruebas automatizadas base

**Rama sugerida:** `feature/sprint-05-testing-base`  
**Objetivo:** instalar y configurar pruebas automatizadas para evitar regresiones.

## Alcance

Este sprint debe crear la base de pruebas. No debe refactorizar frontend masivamente.

## Fallas que corrige

- No hay framework de pruebas suficiente.
- No existen pruebas para RBAC, pagos parciales, capacidad de secciones ni reglas críticas.

## Tareas

1. Instalar Vitest o Jest.
2. Instalar Testing Library si aplica.
3. Configurar scripts:

```json
{
  "test": "vitest",
  "test:run": "vitest run",
  "test:coverage": "vitest run --coverage"
}
```

4. Crear estructura:

```text
src/__tests__/
src/lib/domain/__tests__/
src/lib/services/__tests__/
```

5. Crear pruebas unitarias para:
   - cálculo de promedio
   - cálculo de saldo de pago
   - cálculo de vacantes
   - validación de monto de abono
   - permisos RBAC básicos
6. Crear pruebas mínimas de integración para:
   - sección llena
   - pago parcial
   - pago total
   - usuario sin rol financiero
7. Crear datos mock o fixtures.

## Entregables

- Framework de pruebas configurado.
- Primer set de pruebas unitarias.
- Primer set de pruebas de integración básicas.
- Documento `docs/QA_PLAN.md` actualizado.

## Definition of Done

- `npm run test:run` funciona.
- Las reglas críticas tienen pruebas.
- No se rompe `tsc`.
- El equipo puede ejecutar pruebas localmente.

---

# Sprint 06 — Seguridad de reportes, uploads y datos sensibles

**Rama sugerida:** `feature/sprint-06-report-upload-security`  
**Objetivo:** asegurar reportes, exportaciones y subida de archivos.

## Alcance

Este sprint se enfoca en reportes y archivos. No debe hacer refactor frontend general.

## Fallas que corrige

- Reportes PDF/Excel contienen datos sensibles.
- Falta auditoría o validación fina en exportaciones.
- Uploads requieren validación server-side.
- Riesgo de archivos maliciosos o tipos no permitidos.

## Tareas

1. Revisar permisos por tipo de reporte.
2. Confirmar que reportes financieros solo sean accesibles por roles permitidos.
3. Auditar exportaciones sensibles usando `AuditLog` del Sprint 04.
4. Validar consistencia de datos entre pantalla, PDF y Excel.
5. Validar subida de fotos en servidor:
   - tamaño máximo
   - MIME permitido
   - extensión permitida
   - nombre seguro con UUID
6. Revisar políticas de Supabase Storage.
7. Evitar exposición innecesaria de datos personales.
8. Crear pruebas básicas de seguridad para reportes y uploads.

## Entregables

- Reportes protegidos.
- Exportaciones auditadas.
- Uploads con validación server-side.
- Documento `docs/arrangements/sprint-06-report-upload-security.md`.

## Definition of Done

- Un rol no autorizado no descarga reporte financiero.
- Una exportación sensible genera auditoría.
- No se aceptan archivos no permitidos.
- PDFs y Excel mantienen datos correctos.

---

# Sprint 07 — Refactor frontend controlado y mantenibilidad

**Rama sugerida:** `feature/sprint-07-frontend-refactor`  
**Objetivo:** separar visualización, hooks y servicios sin alterar reglas de negocio ya estabilizadas.

## Motivo para ubicarlo aquí

El refactor frontend fue detectado como necesario después de inspeccionar el proyecto. Sin embargo, no debe ejecutarse antes de auditoría, pruebas y seguridad de reportes, porque podría mezclar cambios visuales con cambios críticos. En este punto del roadmap ya deberían existir:

- RBAC funcional.
- Capacity real.
- Pagos parciales.
- Auditoría.
- Pruebas base.
- Reportes y uploads protegidos.

Con esa base, el refactor se puede hacer con menor riesgo.

## Diagnóstico del frontend

La inspección detectó:

| Problema | Ejemplos encontrados | Riesgo |
|---|---|---|
| Server Actions dentro de componentes | `CoursesClient.tsx`, `CourseForm.tsx`, `AnnouncementModal.tsx`, `CalendarModal.tsx`, `ScheduleCellModal.tsx` | Componentes difíciles de probar. |
| Filtros locales repetidos | `StudentsClient`, `TeachersClient`, `CoursesClient`, `IncidentsClient`, `DisabilitiesClient`, `AnnouncementsClient`, `EnrollmentsClient`, `SchedulesListClient` | Duplicación de lógica. |
| Cálculos financieros en JSX | `StudentPaymentHistory.tsx`, `PendingPaymentsList.tsx`, `FinancialSummaryCard.tsx` | Riesgo de inconsistencia. |
| Exportaciones mezcladas con DOM | `useReports.ts`, `OverduePaymentsClient.tsx` | Baja reutilización y testabilidad. |
| Transformaciones en `page.tsx` | Dashboard | Páginas con demasiada responsabilidad. |
| Hooks dispersos | attendance, grades, payments, students, reports | Falta arquitectura común. |

## Arquitectura objetivo

```text
src/
  components/
    modules/
      payments/
      students/
      grades/
      attendance/
      courses/
      calendar/
      announcements/
    shared/
    ui/

  hooks/
    shared/
      useDataTable.ts
      useDebouncedSearch.ts
      useServerActionToast.ts
    announcements/
      useAnnouncements.ts
      useAnnouncementForm.ts
    calendar/
      useCalendarEvents.ts
      useCalendarForm.ts
    courses/
      useCourses.ts
      useCourseForm.ts
    payments/
      useStudentPaymentHistory.ts
      useOverduePayments.ts
    schedules/
      useScheduleCell.ts
    students/
      useStudentsDirectory.ts
    incidents/
      useIncidentsDirectory.ts
    disabilities/
      useDisabilitiesDirectory.ts

  services/
    formatting.service.ts
    export.service.ts
    table.service.ts
    dashboard.service.ts
    payment.service.ts
    attendance.service.ts
    grade.service.ts
    calendar.service.ts
    directory-filter.service.ts
```

## Regla arquitectónica

```text
components = JSX, estructura visual, props y eventos simples.
hooks = estado, formularios, loading, toast, router.refresh y llamadas a Server Actions.
services = cálculos puros, filtros, formateos, exportaciones y transformaciones.
Server Actions = reglas críticas, RBAC, auditoría y acceso a base de datos.
```

## Sub-sprints recomendados dentro del Sprint 07

### Sprint 07A — Servicios puros compartidos

**Riesgo:** bajo.

Tareas:

- Crear `formatting.service.ts`.
- Crear `payment.service.ts`.
- Crear `table.service.ts`.
- Crear `export.service.ts`.
- Crear `dashboard.service.ts`.
- Mover funciones puras sin cambiar comportamiento visual.

Definition of Done:

- Los servicios tienen funciones puras.
- Los cálculos financieros se prueban unitariamente.
- No se altera la UI.

---

### Sprint 07B — Refactor de pagos

**Riesgo:** medio.

Tareas:

- Refactorizar `StudentPaymentHistory.tsx`.
- Refactorizar `PendingPaymentsList.tsx`.
- Refactorizar `OverduePaymentsClient.tsx`.
- Usar `payment.service.ts`.
- Usar `export.service.ts`.
- Mantener RBAC solo en Server Actions.

Definition of Done:

- Pagos siguen funcionando igual.
- Los totales se calculan desde servicios.
- No se duplican cálculos financieros en JSX.

---

### Sprint 07C — Refactor de listados

**Riesgo:** medio.

Tareas:

- Crear `useStudentsDirectory()`.
- Crear `useTeachersDirectory()`.
- Crear `useCourses()`.
- Crear `useIncidentsDirectory()`.
- Crear `useDisabilitiesDirectory()`.
- Crear `useAnnouncements()`.
- Reutilizar `table.service.ts` o `directory-filter.service.ts`.

Definition of Done:

- Filtros repetidos se reducen.
- Componentes de listados quedan más limpios.
- Búsquedas y filtros siguen dando los mismos resultados.

---

### Sprint 07D — Refactor de formularios y modales

**Riesgo:** medio-alto.

Tareas:

- Crear `useCourseForm()`.
- Crear `useAnnouncementForm()`.
- Crear `useCalendarForm()`.
- Crear `useScheduleCell()`.
- Sacar submit, loading, toast y `router.refresh()` de componentes visuales.

Definition of Done:

- Modales siguen abriendo y guardando correctamente.
- Los errores se muestran correctamente.
- Las Server Actions no se llaman directamente desde JSX.

---

### Sprint 07E — Dashboard y DataTable

**Riesgo:** medio.

Tareas:

- Crear `dashboard.service.ts`.
- Crear `useDataTable()`.
- Mover búsquedas por path anidado.
- Mover paginación.
- Mover mapeos de alertas y revenue.

Definition of Done:

- Dashboard visualmente no cambia.
- Datos transformados se calculan en servicios.
- DataTable queda más reutilizable.

## Entregables del Sprint 07

- Servicios puros creados.
- Hooks nuevos por dominio.
- Componentes con menos lógica interna.
- Documento `docs/arrangements/sprint-07-frontend-refactor.md`.
- Pruebas unitarias para servicios principales.

## Definition of Done general

- Los componentes quedan orientados a presentación.
- Los hooks manejan estado y eventos.
- Los services manejan lógica pura.
- No se mueve RBAC al frontend.
- No se cambia comportamiento funcional.
- `tsc`, build y pruebas pasan.

---

# Sprint 08 — Rendimiento, queries y estabilidad funcional

**Rama sugerida:** `feature/sprint-08-performance-stability`  
**Objetivo:** preparar el sistema para mayor volumen de datos.

## Tareas

- Revisar queries pesadas del dashboard.
- Revisar grillas de notas y asistencia masiva.
- Agregar paginación o límites cuando sea necesario.
- Confirmar debounce en búsquedas.
- Revisar índices de base de datos:
  - pagos por estado/fecha
  - asistencia por fecha/sección
  - estudiante por DNI/nombre
  - matrícula por sección/año
- Probar reportes con más registros.
- Optimizar renderizados innecesarios en componentes grandes.

## Entregables

- Checklist de rendimiento.
- Queries optimizadas.
- Recomendaciones de índices.
- Documento `docs/arrangements/sprint-08-performance-stability.md`.

## Definition of Done

- Búsquedas no saturan backend.
- Reportes no bloquean innecesariamente la UI.
- Grillas principales funcionan con volúmenes mayores.

---

# Sprint 09 — Operación, despliegue, backups y documentación

**Rama sugerida:** `feature/sprint-09-production-docs`  
**Objetivo:** preparar despliegue y operación real.

## Tareas

- Crear `docs/DEPLOYMENT.md`.
- Crear o actualizar `.env.example`.
- Documentar variables:
  - `DATABASE_URL`
  - `NEXTAUTH_SECRET`
  - `NEXTAUTH_URL`
  - `SUPABASE_URL`
  - claves de storage
  - variables de email si aplica
- Documentar migraciones:

```bash
npx prisma migrate deploy
```

- Crear política de backup.
- Crear guía de restore.
- Crear guía de rollback.
- Normalizar encoding UTF-8.
- Redirigir página raíz.
- Documentar roles y permisos.

## Entregables

- Guía de despliegue.
- Guía de backup/restore.
- Guía de rollback.
- `.env.example` actualizado.
- Documento de roles.

## Definition of Done

- Otra persona puede desplegar siguiendo la documentación.
- Existe recuperación ante fallo.
- No hay secretos hardcodeados.

---

# Sprint 10 — UAT, congelamiento y salida a producción

**Rama sugerida:** `release/v1.0.0`  
**Objetivo:** validar el sistema completo antes de publicar.

## Tareas

- Crear ambiente staging.
- Ejecutar validaciones:

```bash
npm.cmd run lint
npm.cmd run build
npm.cmd run test:run
npx.cmd prisma migrate deploy
```

- Probar usuarios reales por rol:
  - admin
  - dirección
  - recepción
  - caja
  - docente
  - coordinación
- Validar flujo completo:
  1. crear estudiante
  2. asociar apoderado
  3. crear matrícula
  4. generar cuotas
  5. registrar pago parcial
  6. registrar pago total
  7. registrar asistencia
  8. registrar notas
  9. registrar incidencia
  10. generar reportes
- Congelar cambios nuevos.
- Corregir bugs finales.
- Preparar release notes.
- Publicar versión `v1.0.0`.

## Entregables

- Versión candidata a producción.
- Checklist UAT aprobado.
- Release notes.
- Deploy productivo.

## Definition of Done

- No hay fallas críticas abiertas.
- Todos los roles funcionan.
- Los reportes generan datos correctos.
- Hay backup antes del deploy.
- Existe plan de rollback.

---

## 6. Orden actualizado de prioridad

| Prioridad | Acción | Estado |
|---|---|---|
| 1 | Implementar RBAC | Completado Sprint 01 |
| 2 | Agregar capacidad real a secciones | Completado Sprint 02 |
| 3 | Crear pagos parciales reales | Completado en código Sprint 03 |
| 4 | Crear auditoría | Próximo Sprint 04 |
| 5 | Crear base de pruebas automatizadas | Sprint 05 |
| 6 | Proteger reportes, uploads y datos sensibles | Sprint 06 |
| 7 | Refactor frontend controlado | Sprint 07 |
| 8 | Optimizar rendimiento y estabilidad | Sprint 08 |
| 9 | Documentar despliegue, backups y rollback | Sprint 09 |
| 10 | Ejecutar UAT y publicar v1.0.0 | Sprint 10 |

---

## 7. Checklist final para producción

### Seguridad

- [x] Rutas protegidas por sesión.
- [x] Server Actions protegidas por rol base.
- [x] PDFs protegidos por tipo documental.
- [ ] Reportes sensibles auditados.
- [ ] `/api/seed` eliminado o bloqueado en producción.
- [ ] No hay credenciales hardcodeadas.
- [ ] Uploads validados en cliente y servidor.
- [ ] Auditoría activa para acciones críticas.

### Base de datos

- [x] `capacity` en `Section`.
- [x] `PaymentTransaction` creado en código.
- [ ] Migración de pagos aplicada en entorno real.
- [ ] `AuditLog` implementado.
- [ ] Índices revisados.
- [ ] Backups documentados.
- [ ] Restore probado.

### Funcionalidad

- [x] Crear estudiante.
- [x] Asociar apoderado.
- [x] Matricular estudiante.
- [x] Bloquear sección llena.
- [x] Generar cuotas.
- [x] Registrar pago parcial en código.
- [x] Registrar pago total en código.
- [ ] Validar pagos parciales en ejecución real después de aplicar migración.
- [ ] Auditar pagos, notas, matrícula e incidencias.
- [ ] Probar flujo completo con usuarios por rol.

### Pruebas

- [ ] Pruebas unitarias.
- [ ] Pruebas de integración.
- [ ] Pruebas E2E.
- [ ] Pruebas de seguridad.
- [ ] Pruebas de reportes.
- [ ] Pruebas de rendimiento básico.

### Refactor frontend

- [ ] Servicios puros creados.
- [ ] Hooks compartidos creados.
- [ ] Filtros repetidos reducidos.
- [ ] Cálculos financieros fuera de JSX.
- [ ] Exportaciones centralizadas.
- [ ] Dashboard transformado mediante services.
- [ ] Componentes orientados a presentación.

### Operación

- [ ] `docs/DEPLOYMENT.md` completo.
- [ ] `.env.example` actualizado.
- [ ] Procedimiento de migración.
- [ ] Procedimiento de rollback.
- [ ] Logs básicos.
- [ ] Monitoreo mínimo.
- [ ] Release notes.

---

## 8. Conclusión actualizada

TerraNova Academy tiene una base funcional fuerte y un alcance completo para un ERP escolar. Además, ya se corrigieron tres fallas importantes: seguridad base con RBAC, capacidad real de secciones y pagos parciales en código.

El proyecto ya no debe enfocarse en agregar módulos nuevos. La ruta correcta es cerrar brechas de producción: auditoría, pruebas, seguridad de reportes, validación de archivos, rendimiento, documentación operativa y UAT.

El refactor frontend sí es necesario, porque existen componentes con lógica mezclada, filtros repetidos, cálculos financieros en JSX y exportaciones acopladas al DOM. Sin embargo, debe ubicarse después de auditoría, pruebas y seguridad de reportes. Así se evita romper la funcionalidad mientras todavía se están cerrando fallas críticas.

Con este roadmap actualizado, el sistema puede avanzar de manera ordenada hacia producción, trabajando cada sprint de forma parcial, controlada y verificable.
