# Sprint 13 — Tipado final de acciones críticas y componentes heredados

## Objetivo

Eliminar los warnings restantes de `@typescript-eslint/no-explicit-any` en acciones críticas y componentes heredados, sin cambiar comportamiento funcional, reglas de negocio, Prisma, RBAC, auditoría, pagos parciales ni diseño visual.

## Rama usada

`feature/sprint-13-final-any-cleanup`

Nota: no se identificó una rama local `develop` disponible al iniciar este bloque de trabajo; el sprint se creó desde la última rama limpia disponible del flujo anterior.

## Diagnóstico inicial

El Sprint 12 dejó `41` warnings de `@typescript-eslint/no-explicit-any`.

Distribución aproximada indicada para el cierre pendiente:

| Módulo | Warnings aproximados | Riesgo |
| --- | ---: | --- |
| Componentes heredados de UI | 25 | Medio |
| `src/lib/actions/disability.actions.ts` | 7 | Alto |
| `src/lib/actions/grade.actions.ts` | 7 | Alto |
| `src/lib/actions/enrollment.actions.ts` | 2 | Medio |

## Resultado de tipado

| Métrica | Cantidad |
| --- | ---: |
| Warnings iniciales `no-explicit-any` | 41 |
| Warnings finales `no-explicit-any` | 0 |
| Reducción lograda | 41 |

## Módulos tipados

- Acciones críticas de inhabilitaciones en `src/lib/actions/disability.actions.ts`.
- Acciones críticas de notas en `src/lib/actions/grade.actions.ts`.
- Acción de importación y manejo de errores de matrícula en `src/lib/actions/enrollment.actions.ts`.
- Componentes heredados de asistencia, configuración, inhabilitaciones, incidencias, pagos, reportes, comunicados, docentes y notas.

## Cambios principales

- Se reemplazaron `any` por tipos explícitos, tipos derivados o estructuras mínimas locales.
- Se tiparon errores `catch` como `unknown` y se agregaron helpers seguros para extraer mensajes.
- Se tiparon props de componentes heredados sin modificar JSX ni textos visibles.
- Se tiparon datos de asistencia, historial de pagos, recibos, docentes, comunicados y reportes batch.
- Se ajustó `useAttendanceState` para aceptar la estructura académica real usada por la pantalla.
- Se restauró `@typescript-eslint/no-explicit-any` de `warn` a `error` en `.eslintrc.json`.

## Archivos modificados

- `.eslintrc.json`
- `src/components/modules/announcements/AnnouncementsClient.tsx`
- `src/components/modules/attendance/AttendanceClient.tsx`
- `src/components/modules/attendance/StudentAttendanceCalendar.tsx`
- `src/components/modules/attendance/_components/CalendarGrid.tsx`
- `src/components/modules/attendance/_components/CalendarStats.tsx`
- `src/components/modules/attendance/hooks/useAttendanceCalendar.ts`
- `src/components/modules/attendance/hooks/useAttendanceState.ts`
- `src/components/modules/attendance/types.ts`
- `src/components/modules/configuracion/ConfiguracionClient.tsx`
- `src/components/modules/configuracion/_components/ConfigYearTab.tsx`
- `src/components/modules/disabilities/DisabilityDetailClient.tsx`
- `src/components/modules/disabilities/_components/DisabilityFormFields.tsx`
- `src/components/modules/disabilities/hooks/useRegisterDisability.ts`
- `src/components/modules/enrollments/EnrollmentDetailsClient.tsx`
- `src/components/modules/grades/GradeGridClient.tsx`
- `src/components/modules/grades/StudentReportCard.tsx`
- `src/components/modules/incidents/IncidentDetailClient.tsx`
- `src/components/modules/incidents/_components/IncidentFormFields.tsx`
- `src/components/modules/payments/ReceiptModal.tsx`
- `src/components/modules/payments/StudentPaymentHistory.tsx`
- `src/components/modules/payments/hooks/useStudentPaymentHistory.ts`
- `src/components/modules/reports/_components/BatchExportGrid.tsx`
- `src/components/modules/teachers/TeacherForm.tsx`
- `src/components/modules/teachers/TeachersClient.tsx`
- `src/components/modules/teachers/hooks/useTeacherForm.ts`
- `src/lib/actions/disability.actions.ts`
- `src/lib/actions/enrollment.actions.ts`
- `src/lib/actions/grade.actions.ts`

## Estado de ESLint

`@typescript-eslint/no-explicit-any` volvió a `error`.

Resultado: `npm.cmd run lint` pasa sin warnings ni errores.

## Validaciones ejecutadas

| Comando | Resultado |
| --- | --- |
| `npm.cmd run lint` | Correcto, sin warnings ni errores |
| `npx.cmd tsc --noEmit` | Correcto |
| `npm.cmd run test:run` | Correcto, 21 archivos y 122 pruebas |
| `npm.cmd run test:integration` | Correcto, 6 archivos y 23 pruebas |
| `npm.cmd run test:coverage` | Correcto |
| `npm.cmd run build` | Correcto |

## Observaciones

- `npm.cmd run build` finaliza correctamente.
- Durante el build aparecen logs conocidos de `DYNAMIC_SERVER_USAGE` en rutas protegidas que usan `headers()` durante el intento de prerender estático. No bloquean el build y no fueron modificados en este sprint porque no forman parte del alcance de tipado.
- Vitest muestra una recomendación informativa sobre `vite-tsconfig-paths`; no bloquea pruebas ni coverage.

## Pendientes

- No quedan warnings de `@typescript-eslint/no-explicit-any`.
- Queda como mejora futura revisar los logs de `DYNAMIC_SERVER_USAGE` para decidir si algunas rutas deben marcarse explícitamente como dinámicas.
- Queda como mejora futura aumentar cobertura en Server Actions con baja cobertura, sin mezclarlo con limpieza de tipado.

