# Sprint 09 - Pruebas de integracion de modulos criticos

## Objetivo del sprint

Crear pruebas de integracion controladas para validar flujos criticos de TerraNova Academy, conectando Server Actions reales con mocks de Prisma, RBAC, auditoria, reportes y uploads.

El sprint se enfoco solo en pruebas. No se modificaron reglas de negocio, Prisma, migraciones, RBAC, auditoria, pagos, matriculas ni UI.

## Rama usada

- Rama creada: `feature/sprint-09-integration-tests`
- Observacion: no existe rama local `develop`. Se continuo desde la ultima rama limpia disponible: `feature/sprint-08-lint-typescript-cleanup`.

## Estrategia de integracion elegida

Se eligio la opcion A: integracion con mocks controlados de Prisma.

Motivos:

- No existe `TEST_DATABASE_URL` configurada en el proyecto.
- No se debe usar `DATABASE_URL` productiva ni Supabase real para pruebas.
- Las pruebas deben ser repetibles, rapidas y sin dependencia de red externa.
- Permite ejecutar Server Actions reales y validar interaccion con Prisma, RBAC, auditoria y revalidacion sin escribir datos reales.

Dependencias mockeadas:

- `@/lib/prisma`
- `@/lib/auth`
- `@/lib/audit` en pruebas de acciones que solo verifican llamada de auditoria
- `next/cache`
- `@/lib/supabase` en pruebas de uploads
- acciones academicas auxiliares para reportes Excel

## Archivos creados

Helpers:

- `src/test/integration/test-auth.ts`
- `src/test/integration/test-fixtures.ts`
- `src/test/integration/test-prisma.ts`

Pruebas de integracion:

- `src/lib/actions/__tests__/enrollment.integration.test.ts`
- `src/lib/actions/__tests__/payment.integration.test.ts`
- `src/lib/actions/__tests__/audit.integration.test.ts`
- `src/lib/actions/__tests__/rbac-server-actions.integration.test.ts`
- `src/lib/actions/__tests__/reports.integration.test.ts`
- `src/lib/actions/__tests__/upload.integration.test.ts`

Configuracion:

- `package.json`: se agrego el script `test:integration`.

## Modulos cubiertos

| Modulo | Casos cubiertos | Tipo de validacion |
|---|---|---|
| Matriculas | Matricula con vacantes, seccion llena antes de transaccion, seccion llena dentro de transaccion, rol no autorizado | Server Action real con Prisma mock |
| Pagos | Pago parcial, pago total, pago mayor al saldo, monto cero, rol no autorizado | Server Action real con transaccion mock |
| Auditoria | Creacion con usuario actual, sanitizacion de datos sensibles, tolerancia a error de Prisma, lectura protegida | Helper real y Server Action real |
| RBAC | Roles requeridos por matricula, pagos y reporte financiero | Guards mockeados y llamadas esperadas |
| Reportes | Reporte financiero, notas y asistencia protegidos por rol, auditoria de exportacion | Server Actions reales con datos mock |
| Uploads | Rechazo de archivo invalido, path seguro, auditoria de foto de estudiante/docente, roles requeridos | Server Actions reales con Supabase mock |

## Casos destacados

### Matriculas

- `createEnrollment()` permite matricular cuando `Section.capacity` es mayor que matriculas activas.
- `createEnrollment()` bloquea cuando `capacity = occupied`.
- La validacion se cubre antes y dentro de la transaccion para evitar condiciones de carrera.
- Se verifica generacion automatica de 11 pagos: matricula + 10 mensualidades.
- Se verifica auditoria `ENROLLMENT`.

### Pagos

- `registerPayment()` crea `PaymentTransaction`.
- Pago parcial actualiza `Payment.balance` y conserva estado pendiente.
- Pago total deja `balance = 0` y cambia estado a `PAGADO`.
- Monto mayor al saldo no crea transaccion ni actualiza pago.
- Monto cero no abre transaccion.
- Rol fuera de `FINANCE` no ejecuta Prisma.

### Auditoria

- `createAuditLog()` agrega usuario actual desde `getCurrentUser()`.
- Se sanitizan `passwordHash` y `token`.
- Si `prisma.auditLog.create()` falla, la funcion no lanza error.
- `getAuditLogs()` y `getAuditLogsByEntity()` exigen roles administrativos.

### Reportes

- `exportFinancialReport()` exige `ADMIN`, `DIRECTOR` o `CAJA`.
- Roles no financieros no consultan datos.
- Exportaciones exitosas generan auditoria con metadata, sin guardar el archivo Excel completo.
- Reportes academicos usan permisos academicos.

### Uploads

- Archivo PDF subido como foto se rechaza antes de llamar Supabase.
- Imagen valida usa path generado, no el nombre original.
- Upload exitoso audita metadata segura, no el contenido del archivo.
- Foto de docente exige roles administrativos.

## Comandos ejecutados

| Comando | Resultado |
|---|---|
| `npm.cmd run test:integration` | Pasa. 6 archivos, 23 pruebas. |
| `npm.cmd run test:run` | Pasa. 21 archivos, 122 pruebas. |
| `npm.cmd run test:coverage` | Pasa. |
| `npx.cmd tsc --noEmit` | Pasa. |
| `npm.cmd run lint` | Pasa con warnings heredados del Sprint 08. |
| `npm.cmd run build` | Pasa con warnings heredados y mensajes de rutas dinamicas durante prerender. |

## Resultado de cobertura

Coverage global despues del sprint:

- Statements: 42.1%
- Branches: 44.83%
- Functions: 48.05%
- Lines: 42.38%

Observacion: la cobertura global baja respecto al Sprint 08 porque las pruebas de integracion importan Server Actions grandes, lo que aumenta mucho el total de lineas instrumentadas. Esto no indica perdida de pruebas; indica que ahora entran archivos de negocio mas amplios en el calculo.

## Limitaciones

- No se validaron constraints reales de PostgreSQL.
- No se uso `TEST_DATABASE_URL` porque no existe configuracion de base de test.
- No se ejecutaron migraciones ni seed de test.
- No se validaron archivos Excel binarios con lectura profunda; solo permisos, respuesta basica y auditoria.
- No se hicieron pruebas E2E ni navegador.

## Recomendaciones para siguiente fase

1. Crear una base PostgreSQL aislada de test y configurar `TEST_DATABASE_URL`.
2. Agregar suite separada para pruebas contra base real con setup/teardown transaccional.
3. Validar constraints reales de Prisma/PostgreSQL: uniques, relaciones y cascadas.
4. Separar coverage unitario de coverage de integracion para medir mejor cada capa.
5. Agregar pruebas de PDF protegidos cuando exista una capa testeable sin render pesado.
6. Mantener los mocks actuales como suite rapida de CI.

## Mensaje de commit sugerido

```bash
git add .
git commit -m "test: agregar pruebas de integracion para modulos criticos (Sprint 09)"
git push origin feature/sprint-09-integration-tests
```
