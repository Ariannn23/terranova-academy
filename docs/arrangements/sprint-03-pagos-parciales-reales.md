# Sprint 03 - Pagos parciales reales

## Datos generales

- Sistema: TerraNova Academy
- Rama: `feature/sprint-03-payment-transactions`
- Objetivo: registrar abonos parciales como transacciones independientes, mantener el saldo de cada obligacion de pago y marcar como `PAGADO` solo cuando el saldo llegue a 0.

## Cambios implementados

### Base de datos

- Se agrego `balance Float @default(0)` al modelo `Payment` para representar el saldo pendiente.
- Se creo el modelo `PaymentTransaction` en `prisma/schema.prisma` con los campos:
  - `id`
  - `paymentId`
  - `amount`
  - `method`
  - `paidAt`
  - `createdBy`
  - `createdAt`
- Se relaciono `PaymentTransaction` con `Payment` mediante `paymentId`.
- Se agregaron indices para consultas por pago, fecha de abono y usuario creador.
- Se creo la migracion SQL manual:
  - `prisma/migrations/20260525153000_add_payment_transactions/migration.sql`
- La migracion agrega `balance`, inicializa saldos existentes y crea la tabla `PaymentTransaction`.
- Se actualizo `prisma/init-schema.sql` para reflejar el nuevo modelo en instalaciones limpias.

### Server Actions

- `src/lib/actions/payment.actions.ts`
  - Mantiene RBAC con `requireRole(ROLE_GROUPS.FINANCE)`.
  - `registerPayment()` ahora valida monto parcial, saldo disponible y estado del pago.
  - Cada abono crea un registro en `PaymentTransaction`.
  - El saldo de `Payment.balance` se recalcula dentro de una transaccion Prisma.
  - El estado cambia a `PAGADO` solo cuando `balance` llega a 0.
  - Se bloquean pagos con monto menor o igual a 0, pagos mayores al saldo, pagos anulados y pagos ya completados.
  - Dashboard financiero ahora calcula lo cobrado desde `PaymentTransaction`, no desde el monto total de la deuda.
  - Pagos pendientes, vencidos y proximos usan `balance > 0`.
- `src/lib/actions/report.actions.ts`
  - El reporte financiero anual usa transacciones para ingresos reales.
  - El Excel financiero incluye detalle de abonos con fecha, estudiante, DNI, concepto, metodo y monto.
- `src/lib/actions/dashboard.actions.ts`
  - Resumen financiero del dashboard usa abonos reales para ingresos y saldo para pendientes/vencidos.
- `src/lib/actions/enrollment.actions.ts`
  - Los pagos generados por matricula se crean con `balance` igual al monto original.
- `src/lib/actions/student.actions.ts`
  - El perfil del estudiante carga historial de transacciones por pago.

### Validaciones

- `src/lib/validations/payment.schema.ts`
  - `RegisterPaymentReceiptSchema` ahora exige `amount > 0`.
  - `PaymentFormSchema` ahora incluye `amount` obligatorio y positivo.

### Interfaz de pagos

- `src/components/modules/payments/RegisterPaymentClient.tsx`
  - Se agrego campo para ingresar monto del abono.
  - Se muestra el saldo pendiente de la cuota seleccionada.
  - El resumen del formulario muestra el abono a cobrar.
- `src/components/modules/payments/_components/PendingPaymentsList.tsx`
  - Muestra saldo pendiente, monto total y monto abonado.
  - Al seleccionar una deuda precarga el saldo como monto sugerido.
- `src/components/modules/payments/hooks/usePaymentForm.ts`
  - Envia `amount` al Server Action.
  - Si el pago queda con saldo, actualiza la cuota en pantalla.
  - Si el saldo llega a 0, remueve la cuota de pendientes.
- `src/components/modules/payments/ReceiptModal.tsx`
  - Usa el id de transaccion como referencia visual del recibo cuando existe.
  - Muestra saldo pendiente despues del abono.
- `src/components/modules/payments/StudentPaymentHistory.tsx`
  - Calcula total pagado desde transacciones.
  - Calcula deuda desde `balance`.
  - Muestra saldo pendiente por cuota.

## Migracion de base de datos

Archivo creado:

```bash
prisma/migrations/20260525153000_add_payment_transactions/migration.sql
```

SQL principal:

```sql
ALTER TABLE "Payment"
ADD COLUMN "balance" DOUBLE PRECISION NOT NULL DEFAULT 0;

UPDATE "Payment"
SET "balance" = CASE
  WHEN "status" = 'PAGADO' THEN 0
  ELSE "amount"
END;

CREATE TABLE "PaymentTransaction" (...);
```

Nota: la migracion aun debe aplicarse en la base de datos del entorno correspondiente antes de probar pagos parciales en ejecucion real.

## Validaciones realizadas

- `npx.cmd prisma format`: correcto.
- `npx.cmd prisma validate`: correcto.
- `npx.cmd prisma generate`: correcto.
- `npx.cmd tsc --noEmit`: correcto.

## Pruebas manuales sugeridas

| ID | Caso | Resultado esperado |
| --- | --- | --- |
| P-01 | Registrar abono parcial menor al saldo | Se crea `PaymentTransaction`, baja `Payment.balance` y el estado no cambia a `PAGADO`. |
| P-02 | Registrar abono igual al saldo | Se crea `PaymentTransaction`, `balance` queda en 0 y el pago cambia a `PAGADO`. |
| P-03 | Registrar monto mayor al saldo | El sistema rechaza la accion con mensaje de error. |
| P-04 | Registrar monto 0 o negativo | El sistema rechaza la accion por validacion Zod/servidor. |
| P-05 | Usuario sin rol financiero | La Server Action debe ser denegada por RBAC. |
| P-06 | Revisar dashboard financiero | El total cobrado debe sumar abonos reales, no deudas completas. |
| P-07 | Exportar reporte financiero | El Excel debe reflejar ingresos por transacciones y mostrar detalle de abonos. |
| P-08 | Historial del estudiante | Debe mostrar deuda segun saldo y total pagado segun transacciones. |

## Archivos modificados o creados

- `prisma/schema.prisma`
- `prisma/init-schema.sql`
- `prisma/migrations/20260525153000_add_payment_transactions/migration.sql`
- `src/lib/actions/payment.actions.ts`
- `src/lib/actions/report.actions.ts`
- `src/lib/actions/dashboard.actions.ts`
- `src/lib/actions/enrollment.actions.ts`
- `src/lib/actions/student.actions.ts`
- `src/lib/validations/payment.schema.ts`
- `src/components/modules/payments/RegisterPaymentClient.tsx`
- `src/components/modules/payments/_components/PendingPaymentsList.tsx`
- `src/components/modules/payments/hooks/usePaymentForm.ts`
- `src/components/modules/payments/ReceiptModal.tsx`
- `src/components/modules/payments/StudentPaymentHistory.tsx`

## Mensaje de commit sugerido

```bash
git commit -m "feat: implementar pagos parciales con transacciones y actualizacion de saldo (Sprint 03)"
```

