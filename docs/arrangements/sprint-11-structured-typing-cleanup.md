# Sprint 11 - Tipado estructural por módulos

## Objetivo

Reducir de forma controlada los warnings restantes de `@typescript-eslint/no-explicit-any`, atacando el tipado por módulos sin cambiar comportamiento funcional, reglas de negocio, Prisma, RBAC, auditoría ni diseño visual.

## Rama usada

`feature/sprint-11-structured-typing-cleanup`

Nota: no se encontró una rama local `develop`; el sprint se inició desde la rama limpia disponible `feature/sprint-10-eslint-typescript-debt-cleanup`.

## Diagnóstico inicial

El diagnóstico inicial de `npm.cmd run lint` mostraba el proyecto en estado verde, pero con `197` warnings de `@typescript-eslint/no-explicit-any`.

Distribución inicial aproximada:

| Carpeta / módulo | Warnings `any` |
| --- | ---: |
| Otros módulos | 63 |
| `src/lib/actions` | 39 |
| `src/components/modules/students` | 27 |
| `src/components/pdf` | 22 |
| `src/components/modules/payments` | 17 |
| `src/components/modules/attendance` | 14 |
| `src/components/modules/grades` | 14 |
| `src/components/modules/reports` | 1 |

Archivos con mayor concentración inicial:

| Archivo | Observación |
| --- | --- |
| `src/components/modules/grades/_components/GradeGridFilters.tsx` | Uso de estructuras académicas sin tipado. |
| `src/components/modules/attendance/_components/AttendanceLevelFilters.tsx` | Filtros académicos con datos anidados sin tipo. |
| `src/components/modules/payments/OverduePaymentsClient.tsx` | Filas de pagos vencidos tipadas como `any`. |
| `src/components/pdf/*` | Props de PDFs y filas de reportes sin contratos explícitos. |
| `src/lib/actions/report.actions.ts` | Acciones de reportes con datos Prisma complejos pendientes de tipado. |

## Tipos creados

Se agregaron tipos compartidos para reducir `any` sin acoplar innecesariamente la UI a Prisma:

| Archivo | Propósito |
| --- | --- |
| `src/types/academic.ts` | Tipos para estructura académica usada por filtros de asistencia y notas. |
| `src/types/payment.ts` | Tipos de filas visuales para pagos vencidos y pagos pendientes. |
| `src/types/pdf.ts` | Tipos reutilizables para estudiantes, matrículas, secciones, asistencia, incidencias, inhabilitaciones y horarios en PDFs. |

Además, se agregaron tipos exportados en módulos existentes:

| Archivo | Tipo |
| --- | --- |
| `src/lib/validations/payment.schema.ts` | `PaymentFormSchemaType` basado en `z.infer`. |
| `src/components/modules/courses/hooks/useCourseForm.ts` | `CourseInitialData`. |

## Módulos tipados

| Módulo | Cambios realizados |
| --- | --- |
| PDFs | Se eliminaron los `any` en componentes PDF mediante tipos locales y compartidos. |
| Notas | Se tiparon filtros de grado, sección, nivel y curso en `GradeGridFilters`. |
| Asistencia | Se tiparon filtros académicos en `AttendanceLevelFilters`. |
| Pagos | Se tiparon pagos vencidos, pagos pendientes y control del formulario de abono. |
| Cursos | Se tiparon datos iniciales y niveles académicos usados por el listado y formulario. |
| Estudiantes | Se tiparon filas principales del directorio de estudiantes. |
| API PDF | Se agregaron guardas de nulidad para matrículas no encontradas en PDFs de incidencias e inhabilitaciones. |

## Cantidad final de any

| Métrica | Cantidad |
| --- | ---: |
| Warnings iniciales `no-explicit-any` | 197 |
| Warnings finales `no-explicit-any` | 126 |
| Reducción lograda | 71 |

Distribución final aproximada:

| Carpeta / módulo | Warnings restantes |
| --- | ---: |
| Otros módulos | 53 |
| `src/lib/actions` | 39 |
| `src/components/modules/students` | 22 |
| `src/components/modules/attendance` | 6 |
| `src/components/modules/grades` | 3 |
| `src/components/modules/payments` | 2 |
| `src/components/modules/reports` | 1 |
| `src/components/pdf` | 0 |
| `src/services` | 0 |
| `src/components/shared` | 0 |

## Reglas ESLint

No se restauró `@typescript-eslint/no-explicit-any` a `error`, porque todavía quedan `126` warnings distribuidos en módulos complejos. La regla debe mantenerse como warning hasta completar el tipado de Server Actions, calendario, horarios, wizard de matrícula y perfil de estudiante.

No se agregaron desactivaciones masivas de ESLint.

## Validaciones ejecutadas

| Comando | Resultado |
| --- | --- |
| `npx.cmd tsc --noEmit` | Correcto |
| `npm.cmd run lint` | Correcto, con warnings restantes de `no-explicit-any` |
| `npm.cmd run test:run` | Correcto: 21 archivos, 122 pruebas |
| `npm.cmd run test:integration` | Correcto: 6 archivos, 23 pruebas |
| `npm.cmd run test:coverage` | Correcto |
| `npm.cmd run build` | Correcto |

Durante `npm.cmd run build` se mantienen mensajes de rutas dinámicas de Next.js asociados a uso de `headers()` en rutas protegidas y advertencias de `any` todavía existentes. No bloquearon el build.

## Pendientes por módulo

| Módulo | Pendiente |
| --- | --- |
| `src/lib/actions/report.actions.ts` | Tipar filas, filtros y retornos de reportes sin modificar exportaciones. |
| `src/lib/actions/grade.actions.ts` | Tipar estructuras de grilla y retornos de notas. |
| `src/lib/actions/disability.actions.ts` | Tipar payloads y resultados de inhabilitaciones. |
| `src/app/api/pdf/route.tsx` | Reducir `any` en renderizado dinámico de PDFs y manejo de errores. |
| Calendario y horarios | Tipar estructuras de eventos, bloques y celdas. |
| Wizard de matrícula | Tipar pasos, opciones académicas y payloads intermedios. |
| Perfil de estudiante | Tipar pestañas de asistencia, incidencias, pagos e historial. |

## Conclusión

El Sprint 11 redujo deuda real de TypeScript sin cambiar comportamiento funcional. El avance más importante fue dejar sin `any` los componentes PDF, servicios y componentes compartidos, además de mejorar tipado en pagos, cursos, estudiantes, notas y asistencia. La deuda restante se concentra en módulos con datos Prisma complejos y Server Actions, por lo que debe abordarse en un sprint posterior de tipado backend/UI profundo.
