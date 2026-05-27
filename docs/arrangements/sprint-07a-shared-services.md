# Sprint 07A - Servicios puros compartidos para refactor frontend

## Datos generales

- Sistema: TerraNova Academy
- Rama: `feature/sprint-07a-shared-services`
- Objetivo: iniciar el refactor frontend creando servicios puros reutilizables, sin cambiar comportamiento visual ni reglas de negocio.

## Diagnostico inicial

Se revisaron los modulos principales de frontend y componentes compartidos:

- `src/components/modules/payments/`
- `src/components/modules/students/`
- `src/components/modules/courses/`
- `src/components/modules/teachers/`
- `src/components/modules/incidents/`
- `src/components/modules/disabilities/`
- `src/components/modules/dashboard/`
- `src/components/shared/`

Hallazgos:

- Formato de moneda duplicado en:
  - `PaymentsDashboardClient.tsx`
  - `OverduePaymentsClient.tsx`
  - `StudentPaymentHistory.tsx`
- Calculos visuales de pagos duplicados en:
  - `StudentPaymentHistory.tsx`
  - `PendingPaymentsList.tsx`
- Filtros por texto repetidos en:
  - `StudentsClient.tsx`
  - `CoursesClient.tsx`
  - `TeachersClient.tsx`
  - `IncidentsClient.tsx`
  - `DisabilitiesClient.tsx`
- Busqueda, paginacion y acceso a campos anidados en:
  - `src/components/shared/DataTable.tsx`
- Transformaciones de dashboard existentes pero dispersas o acopladas a componentes.

## Riesgos identificados

- Reemplazar filtros en listados grandes puede alterar resultados visibles si no se compara con cuidado cada caso.
- Mover logica de hooks o formularios podria afectar flujo visual y validaciones.
- Tipar componentes existentes implicaria tocar muchos `any`, lo cual pertenece a un sprint posterior de mantenibilidad.
- Build/lint ya fallan por deuda tecnica preexistente; no se corrige en este sprint.

## Servicios creados

### `src/services/formatting.service.ts`

Funciones:

- `formatCurrency(value, currency = "PEN")`
- `formatDate(value)`
- `formatDateTime(value)`
- `formatStudentName(student)`

Responsabilidad:

- Formatos estables y testeables de moneda, fechas y nombres.
- No usa React, Prisma, Server Actions, `window` ni router.

### `src/services/table.service.ts`

Funciones:

- `getNestedValue(obj, path)`
- `filterBySearchKeys(items, searchTerm, keys)`
- `paginate(items, page, pageSize)`
- `getTotalPages(totalItems, pageSize)`

Responsabilidad:

- Busqueda case-insensitive.
- Soporte de rutas anidadas como `student.dni` o `section.gradeLevel.name`.
- Paginacion sin mutar arreglos originales.

### `src/services/payment.service.ts`

Funciones:

- `calculatePaidTotal(transactions)`
- `calculatePaymentBalance(payment)`
- `calculateDebtTotal(payments)`
- `getPaymentStatusConfig(status)`
- `isPaymentOverdue(payment, today)`

Responsabilidad:

- Calculos visuales compatibles con Sprint 03.
- Respeta `Payment.balance`.
- Calcula saldo desde transacciones solo si no hay `balance`.
- No toca Prisma ni `registerPayment()`.

### `src/services/directory-filter.service.ts`

Funciones:

- `filterByStatus(items, status)`
- `filterByLevel(items, level, getLevel)`
- `filterDirectory(items, options)`

Responsabilidad:

- Filtros reutilizables para directorios/listados.
- Preparado para refactor de listados en Sprint 07C.

### `src/services/dashboard.service.ts`

Funciones:

- `mapRevenueData(data)`
- `mapPriorityAlerts(data)`
- `buildAttendanceChartData(data)`

Responsabilidad:

- Transformaciones puras para visualizacion de dashboard.
- Preparado para Sprint 07E.

## Reemplazos aplicados

Reemplazos seguros realizados:

- `src/components/shared/DataTable.tsx`
  - Usa `filterBySearchKeys()`.
  - Usa `getNestedValue()`.
  - Usa `paginate()`.
  - Usa `getTotalPages()`.
- `src/components/modules/payments/PaymentsDashboardClient.tsx`
  - Reemplaza `formatCurrency` local por `formatCurrency()` del servicio.
- `src/components/modules/payments/OverduePaymentsClient.tsx`
  - Reemplaza `formatCurrency` local por `formatCurrency()` del servicio.
- `src/components/modules/payments/StudentPaymentHistory.tsx`
  - Reemplaza `formatCurrency` local.
  - Reemplaza calculo de total pagado por `calculatePaidTotal()`.
  - Reemplaza calculo de deuda por `calculateDebtTotal()`.
- `src/components/modules/payments/_components/PendingPaymentsList.tsx`
  - Reemplaza calculo de abonado por `calculatePaidTotal()`.
  - Reemplaza calculo de saldo por `calculatePaymentBalance()`.

No se modifico la UI, props, rutas, Server Actions, RBAC, Prisma, pagos parciales ni auditoria.

## Reemplazos pospuestos

Quedan documentados para sprints posteriores:

- `StudentsClient.tsx`: filtro combinado por texto, estado y nivel.
- `CoursesClient.tsx`: filtro por nombre/estado.
- `TeachersClient.tsx`: filtro por nombre, DNI y especialidad.
- `IncidentsClient.tsx`: filtro por estudiante/DNI/severidad.
- `DisabilitiesClient.tsx`: filtro por estudiante/estado.
- Hooks de pagos: migrar logica visual a hooks minimos en Sprint 07B.
- Dashboard: centralizar transformaciones reales en Sprint 07E.
- DataTable: mejorar tipado eliminando `any` en sprint de deuda tecnica.

## Pruebas creadas

Archivos:

- `src/services/__tests__/formatting.service.test.ts`
- `src/services/__tests__/table.service.test.ts`
- `src/services/__tests__/payment.service.test.ts`
- `src/services/__tests__/directory-filter.service.test.ts`
- `src/services/__tests__/dashboard.service.test.ts`

Cobertura de pruebas:

- Moneda con numero valido y cero.
- Fechas con `Date`, ISO, `null`, `undefined` e invalida.
- Nombre de estudiante completo e incompleto.
- Acceso a paths simples y anidados.
- Busqueda exacta y case-insensitive.
- Paginacion.
- Calculo de paginas.
- Total pagado.
- Saldo desde `balance`.
- Saldo desde `amount - transactions`.
- Deuda total.
- Pago vencido.
- Configuracion de estados de pago.
- Filtros por estado, nivel, texto y combinados.
- Transformaciones basicas de dashboard.

## Validaciones ejecutadas

```bash
npm.cmd run test:run
```

Resultado:

- 12 archivos de prueba.
- 74 pruebas pasadas.
- 0 pruebas fallidas.

```bash
npm.cmd run test:coverage
```

Resultado:

- 12 archivos de prueba.
- 74 pruebas pasadas.
- Coverage general:
  - Statements: 81.54%
  - Branches: 72.81%
  - Functions: 89.47%
  - Lines: 89.89%

Nota:

- Un primer intento de coverage ejecutado en paralelo fallo por resolucion del `setup.ts` desde un path interno del sandbox. Al repetirlo de forma aislada desde el workspace real, paso correctamente.

```bash
npx.cmd tsc --noEmit
```

Resultado:

- Correcto, sin errores TypeScript.

```bash
npm.cmd run build
npm.cmd run lint
```

Resultado:

- `next build` compila la aplicacion, pero falla en la fase de lint/check.
- `npm run lint` falla por deuda tecnica preexistente.

Errores representativos:

- `@typescript-eslint/no-explicit-any` en componentes, PDFs y Server Actions.
- `@typescript-eslint/no-unused-vars` en componentes y acciones.
- `react/no-unescaped-entities` en JSX.
- `@typescript-eslint/no-require-imports` en scripts JS bajo `src/scripts`.
- Warnings de hooks y uso de `<img>`.

Estos problemas no se corrigen en Sprint 07A por alcance.

## Pendientes por sprint

### Sprint 07B

- Refactor de pagos usando `payment.service`.
- Crear hooks minimos para separar estado de UI de calculos.
- Reducir duplicacion en `RegisterPaymentClient`, `PendingPaymentsList` y recibos.

### Sprint 07C

- Refactor de listados repetidos usando `directory-filter.service`.
- Aplicar filtros centralizados en estudiantes, docentes, cursos, incidencias e inhabilitaciones.

### Sprint 07D

- Refactor de formularios y modales.
- Separar handlers complejos de componentes visuales.

### Sprint 07E

- Refactor de dashboard y `DataTable`.
- Mejorar tipado generico de columnas.
- Centralizar transformaciones de graficos y alertas.

## Mensaje de commit sugerido

```bash
git add .
git commit -m "refactor: crear servicios puros compartidos para frontend (Sprint 07A)"
git push origin feature/sprint-07a-shared-services
```
