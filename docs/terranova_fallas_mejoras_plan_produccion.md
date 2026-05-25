# TerraNova Academy — Fallas encontradas, mejoras y plan por sprints para producción

**Proyecto:** TerraNova Academy  
**Tipo de sistema:** ERP / Dashboard escolar web  
**Objetivo del documento:** ordenar todas las fallas detectadas, proponer mejoras concretas y dividir el trabajo en sprints para llevar el proyecto a producción sin romper el sistema de golpe.  
**Estado actual resumido:** desarrollo avanzado, pero todavía no listo para producción.

---

## 1. Resumen ejecutivo

TerraNova Academy ya cuenta con una base funcional importante: autenticación, dashboard, estudiantes, apoderados, docentes, cursos, horarios, matrículas, notas, asistencia, pagos, incidencias, inhabilitaciones, reportes, exportaciones Excel/PDF, calendario, comunicados y subida de imágenes.

El stack técnico es adecuado para un sistema moderno: **Next.js, TypeScript, React, Prisma ORM, PostgreSQL, Tailwind CSS, shadcn/ui, Zod, NextAuth, Supabase Storage, xlsx y @react-pdf/renderer**.

Sin embargo, el sistema todavía presenta fallas críticas antes de considerarse productivo:

- No hay pruebas automatizadas.
- El control de roles y permisos está incompleto.
- Los pagos parciales no están modelados correctamente.
- La capacidad real de secciones no se guarda en base de datos.
- No existe auditoría formal de acciones críticas.
- No hay migraciones Prisma versionadas identificadas.
- Existe una ruta temporal de seed que debe eliminarse o restringirse.
- Falta documentación operativa para despliegue, backups y variables de entorno.
- Hay riesgos de mantenimiento por uso de `any`, lógica duplicada y componentes grandes.

La estrategia recomendada es avanzar por sprints pequeños, priorizando primero **seguridad, estabilidad, base de datos y pruebas**, antes de mejorar interfaz o agregar funciones nuevas.

---

## 2. Principio de trabajo para no romper el sistema

Antes de tocar módulos críticos, se recomienda trabajar con estas reglas:

1. **No hacer refactor masivo al inicio.** Primero estabilizar y cubrir con pruebas.
2. **Crear rama por sprint.** Ejemplo: `sprint-01-quality-baseline`, `sprint-02-rbac`, etc.
3. **Cada sprint debe cerrar con build exitoso.** Comandos mínimos:
   ```bash
   npm run lint
   npm run build
   ```
4. **Agregar pruebas antes o junto con cambios críticos.** Especialmente en pagos, matrículas, notas y asistencia.
5. **Migraciones compatibles hacia atrás.** No borrar columnas o modelos de golpe.
6. **Crear respaldo antes de migraciones de base de datos.**
7. **Evitar cambiar toda la UI mientras se corrige la lógica.** Primero corregir negocio y seguridad.
8. **Separar errores visuales de errores funcionales.** No mezclar ambos en el mismo sprint.
9. **Hacer pruebas manuales con datos reales de ejemplo.** Un flujo completo debe probar: estudiante → matrícula → pagos → asistencia → notas → reporte.
10. **Documentar cada cambio importante.** Especialmente cambios en base de datos, roles y despliegue.

---

## 3. Matriz general de fallas encontradas

| ID | Área | Falla encontrada | Nivel | Impacto | Mejora recomendada | Sprint sugerido |
|---|---|---|---|---|---|---|
| F-01 | Pruebas | No hay framework de pruebas automatizadas identificado | Crítico | No se detectan regresiones al modificar código | Implementar Vitest/Jest, Testing Library y Playwright | Sprint 1 y 6 |
| F-02 | Seguridad | Roles existen, pero no hay RBAC granular por módulo/acción | Crítico | Usuarios pueden acceder a funciones indebidas | Crear `requireAuth`, `requireRole` y permisos por Server Action | Sprint 2 |
| F-03 | Seguridad | Acciones destructivas sin autorización fuerte | Crítico | Eliminación o modificación no autorizada de datos sensibles | Proteger deletes, pagos, notas, incidencias y reportes | Sprint 2 |
| F-04 | Seguridad | Ruta temporal `/api/seed` puede quedar expuesta | Alto | Creación o alteración indebida de datos | Eliminar en producción o bloquear por entorno/token | Sprint 2 |
| F-05 | Seguridad | Credenciales o usuarios seed por defecto | Alto | Riesgo de acceso no autorizado | Mover credenciales a `.env`, rotar claves y no usar defaults | Sprint 2 |
| F-06 | Base de datos | Falta `capacity` persistente en `Section` | Alto | Matrículas incorrectas en secciones llenas | Agregar campo `capacity` y migración Prisma | Sprint 3 |
| F-07 | Base de datos | Pagos parciales no modelados como transacciones | Crítico | Saldos incorrectos y pérdida de historial financiero | Crear `PaymentTransaction` y calcular saldo real | Sprint 4 |
| F-08 | Base de datos | No hay auditoría formal | Alto | No se sabe quién cambió pagos, notas o incidencias | Crear modelo `AuditLog` y registrar acciones críticas | Sprint 3 |
| F-09 | Base de datos | No hay migraciones versionadas identificadas | Alto | Cambios de BD difíciles de controlar | Crear migraciones Prisma y documentarlas | Sprint 3 |
| F-10 | Autenticación | Docente existe como entidad, pero no como usuario autenticado | Medio | No se puede aplicar permisos docentes reales | Relacionar `Teacher` con `User` o definir estrategia de acceso | Sprint 5 |
| F-11 | Pagos | `registerPayment` no soporta pago parcial real | Crítico | El módulo financiero no cumple el PRD | Rediseñar registro de pagos con abonos | Sprint 4 |
| F-12 | Pagos | Falta trazabilidad completa de recibos y abonos | Alto | Dificulta reclamos y conciliación | Vincular recibo con cada transacción de pago | Sprint 4 |
| F-13 | Matrículas | Aforo usa valor por defecto en vez de capacidad real | Alto | Secciones pueden sobrellenarse | Usar `section.capacity - enrollments activos` | Sprint 3 |
| F-14 | Matrículas | Falta prueba de matrícula duplicada o sección llena | Alto | Error de datos académicos | Tests de integración de matrícula | Sprint 6 |
| F-15 | Notas | Lógica de cálculo de promedio/estado posiblemente duplicada | Medio-Alto | Diferencias entre UI, PDF, Excel y BD | Centralizar cálculo en una utilidad única | Sprint 5 |
| F-16 | Notas | Falta cobertura de pruebas para cálculo final | Alto | Promedios incorrectos | Unit tests para notas y estados | Sprint 6 |
| F-17 | Asistencia | Registro masivo requiere pruebas de rendimiento | Medio-Alto | Lentitud o duplicados con secciones grandes | Usar upsert/transacciones y pruebas de carga básica | Sprint 7 |
| F-18 | Asistencia | Alertas de inasistencia requieren validación | Medio | Alertas falsas o ausentes | Probar porcentajes, días hábiles y estados | Sprint 6 |
| F-19 | Reportes | PDF/Excel contienen datos sensibles | Alto | Exposición de datos de estudiantes | Proteger reportes por rol y auditar descargas | Sprint 2 y 8 |
| F-20 | Reportes | Falta prueba de consistencia entre pantalla, Excel y PDF | Medio-Alto | Reportes con datos diferentes | Tests funcionales y snapshots básicos | Sprint 7 |
| F-21 | Uploads | Subida de fotos requiere validar MIME, extensión y tamaño en servidor | Alto | Riesgo de archivos maliciosos | Validación server-side y políticas Supabase | Sprint 8 |
| F-22 | Calidad | Uso de `any` en componentes o acciones | Medio | Errores de tipo y mantenimiento difícil | Crear DTOs y tipos compartidos | Sprint 5 |
| F-23 | Calidad | Componentes grandes en módulos | Medio | Dificulta pruebas y mantenimiento | Dividir en componentes menores | Sprint 5 |
| F-24 | Calidad | Manejo de errores heterogéneo | Medio | UX inconsistente y debugging difícil | Crear patrón `ActionResult<T>` | Sprint 5 |
| F-25 | Calidad | Mezcla de nombres en inglés/español | Bajo-Medio | Inconsistencia en código y carpetas | Definir convención de nombres | Sprint 9 |
| F-26 | Calidad | Caracteres mal codificados o encoding inconsistente | Bajo-Medio | Textos corruptos en UI/docs | Normalizar UTF-8 | Sprint 9 |
| F-27 | Dashboard | Página raíz aún podría conservar plantilla base | Bajo-Medio | Mala presentación inicial | Redirigir `/` a `/login` o dashboard | Sprint 9 |
| F-28 | Dashboard | Algunos KPIs pueden requerir validación | Medio | Indicadores incorrectos para dirección | Tests de queries y datos de dashboard | Sprint 7 |
| F-29 | Performance | Riesgo en grillas, búsquedas y reportes masivos | Medio-Alto | Lentitud con muchos alumnos | Paginación, debounce, índices y streaming cuando aplique | Sprint 8 |
| F-30 | Operación | No hay documentación formal de despliegue | Alto | Riesgo al publicar | Crear guía de deploy, env, backups y rollback | Sprint 9 |
| F-31 | Operación | Backups no documentados | Alto | Pérdida de datos | Política de backup/restore y prueba de restauración | Sprint 9 |
| F-32 | Observabilidad | No hay logs/auditoría técnica suficiente | Medio-Alto | Difícil detectar fallos en producción | Logging estructurado y monitoreo básico | Sprint 8 y 9 |

---

## 4. Fallas por área y mejoras detalladas

### 4.1 Seguridad y autenticación

#### Fallas detectadas

- El sistema tiene autenticación con NextAuth y middleware, pero el control por rol es parcial.
- El usuario tiene un campo `role`, pero no se identificó protección granular por módulo.
- Acciones críticas como pagos, modificación de notas, incidencias, inhabilitaciones, reportes y eliminación de registros deben validarse en servidor.
- Existe una ruta temporal `/api/seed` que puede representar riesgo si se despliega.
- Los datos sensibles de estudiantes pueden ser expuestos si los reportes no se protegen correctamente.

#### Mejoras propuestas

1. Crear helpers centrales:

```ts
// src/lib/security/permissions.ts
export const Roles = {
  ADMIN: 'ADMIN',
  DIRECTOR: 'DIRECTOR',
  RECEPCION: 'RECEPCION',
  DOCENTE: 'DOCENTE',
  CAJA: 'CAJA',
  COORDINADOR: 'COORDINADOR',
} as const;
```

```ts
// src/lib/security/auth-guards.ts
import { auth } from '@/lib/auth';

export async function requireAuth() {
  const session = await auth();

  if (!session?.user) {
    throw new Error('No autenticado');
  }

  return session;
}

export async function requireRole(allowedRoles: string[]) {
  const session = await requireAuth();

  if (!allowedRoles.includes(session.user.role)) {
    throw new Error('No autorizado');
  }

  return session;
}
```

2. Aplicar `requireRole()` en Server Actions, no solo en UI.
3. Crear matriz de permisos por módulo.
4. Eliminar `/api/seed` en producción o bloquearlo con `NODE_ENV !== 'production'`.
5. Auditar descargas de reportes PDF/Excel.

#### Resultado esperado

El usuario solo podrá ejecutar acciones según su rol real. La seguridad no dependerá de ocultar botones en el frontend, sino de validaciones en servidor.

---

### 4.2 Base de datos

#### Fallas detectadas

- `Section` no guarda capacidad real, aunque el PRD exige controlar aforo.
- `Payment` no modela pagos parciales con historial de abonos.
- No existe `AuditLog`.
- No se identificaron migraciones versionadas.
- La entidad `Teacher` no está claramente vinculada con usuarios autenticados.

#### Mejoras propuestas

1. Agregar capacidad real a secciones:

```prisma
model Section {
  id             String   @id @default(cuid())
  name           String
  capacity       Int      @default(30)
  gradeLevelId   String
  academicYearId String
  teacherId      String?
}
```

2. Crear modelo de transacciones de pago:

```prisma
model PaymentTransaction {
  id            String   @id @default(cuid())
  paymentId     String
  amount        Decimal
  method        String
  operationCode String?
  notes         String?
  paidAt        DateTime @default(now())
  createdById   String?

  payment       Payment  @relation(fields: [paymentId], references: [id])
}
```

3. Crear auditoría:

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
}
```

4. Crear migraciones:

```bash
npx prisma migrate dev --name add_section_capacity
npx prisma migrate dev --name add_payment_transactions
npx prisma migrate dev --name add_audit_log
```

#### Resultado esperado

La base de datos quedará más cercana a producción, con trazabilidad, control de vacantes real y pagos financieros confiables.

---

### 4.3 Matrículas

#### Fallas detectadas

- El wizard funciona, pero el control de vacantes depende de una capacidad por defecto.
- Falta validar con fuerza que un estudiante no tenga dos matrículas activas en el mismo año.
- Falta prueba automática para sección llena.

#### Mejoras propuestas

1. Usar capacidad persistida:

```ts
const available = section.capacity - activeEnrollmentsCount;

if (available <= 0) {
  throw new Error('La sección ya no tiene vacantes disponibles');
}
```

2. Validar matrícula única por estudiante y año.
3. Bloquear matrícula si el estudiante está inhabilitado.
4. Crear pruebas de integración.

#### Resultado esperado

El proceso de matrícula será confiable y evitará duplicidad o sobrecupo.

---

### 4.4 Pagos

#### Fallas detectadas

- El pago parcial está definido en el PRD, pero no implementado como historial de abonos.
- El modelo actual puede cerrar cuotas, pero no conserva trazabilidad financiera granular.
- No hay auditoría fuerte de quién registró el pago.

#### Mejoras propuestas

1. Separar obligación de pago (`Payment`) de abono (`PaymentTransaction`).
2. Calcular saldo como:

```ts
saldo = payment.amount - suma(payment.transactions.amount)
```

3. Cambiar estado según saldo:

```ts
if (saldo <= 0) status = 'PAGADO';
else if (today > dueDate) status = 'VENCIDO';
else status = 'PENDIENTE';
```

4. Generar recibo por cada transacción.
5. Auditar cada registro de pago.

#### Resultado esperado

El sistema podrá registrar pagos parciales, pagos totales, saldos pendientes y comprobantes con trazabilidad real.

---

### 4.5 Notas

#### Fallas detectadas

- La grilla de notas está implementada, pero puede existir lógica duplicada de cálculo.
- Falta garantizar que el promedio mostrado, guardado y exportado sea el mismo.
- Falta prueba automatizada de promedios.

#### Mejoras propuestas

1. Centralizar lógica:

```ts
export function calculateFinalGrade(values: Array<number | null | undefined>) {
  const valid = values.filter((v): v is number => typeof v === 'number');
  if (valid.length === 0) return null;
  return Number((valid.reduce((a, b) => a + b, 0) / valid.length).toFixed(2));
}
```

2. Usar la misma función en:
   - Server Actions.
   - UI.
   - PDF.
   - Excel.
3. Crear pruebas unitarias.

#### Resultado esperado

Las notas serán consistentes en todo el sistema.

---

### 4.6 Asistencia

#### Fallas detectadas

- El módulo existe, pero requiere pruebas de rendimiento y consistencia.
- Riesgo de duplicidad si no se usa correctamente el `upsert`.
- Falta validar el comportamiento con estudiantes inhabilitados o retirados.

#### Mejoras propuestas

1. Usar clave única matrícula-fecha.
2. Registrar asistencia con transacción.
3. Bloquear o marcar visualmente alumnos inhabilitados.
4. Probar secciones de 30, 60 y 100 alumnos.
5. Validar cálculo de porcentaje de inasistencia.

#### Resultado esperado

La asistencia será rápida, consistente y sin duplicados.

---

### 4.7 Reportes PDF/Excel

#### Fallas detectadas

- Los reportes existen, pero contienen datos sensibles.
- Falta control de permisos por reporte.
- Falta validar que los datos exportados coincidan con el sistema.

#### Mejoras propuestas

1. Restringir reportes por rol.
2. Auditar descarga de reportes.
3. Crear pruebas de exportación.
4. Evitar exponer información financiera a roles no autorizados.
5. Validar columnas y formato.

#### Resultado esperado

Los reportes serán seguros, consistentes y útiles para dirección o administración.

---

### 4.8 Uploads y archivos

#### Fallas detectadas

- La subida de fotos existe, pero debe validarse también en servidor.
- No basta validar solo en frontend.
- Puede haber riesgo si se aceptan extensiones o MIME no permitidos.

#### Mejoras propuestas

1. Validar tamaño máximo en cliente y servidor.
2. Aceptar solo `image/jpeg`, `image/png`, `image/webp`.
3. Renombrar archivos con UUID.
4. Guardar rutas seguras.
5. Configurar políticas de Supabase Storage.

#### Resultado esperado

La subida de fotos será más segura y controlada.

---

### 4.9 Calidad interna del código

#### Fallas detectadas

- Uso de `any`.
- Componentes grandes.
- Manejo de errores inconsistente.
- Lógica de negocio mezclada con UI.
- Nombres mezclados en inglés y español.

#### Mejoras propuestas

1. Crear tipos DTO.
2. Crear patrón común de respuesta:

```ts
export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };
```

3. Separar reglas de negocio en `src/lib/domain`.
4. Dividir componentes por responsabilidad.
5. Definir convención de nombres.

#### Resultado esperado

El sistema será más fácil de mantener, probar y escalar.

---

## 5. Plan por sprints para dejar el proyecto listo para producción

> Recomendación: cada sprint debe terminar con `npm run lint`, `npm run build`, pruebas manuales del flujo afectado y actualización de documentación.

---

## Sprint 0 — Preparación y congelamiento de base

**Objetivo:** preparar el proyecto para trabajar ordenadamente sin romper la versión actual.

### Tareas

- Crear rama estable: `main` o `production-base`.
- Crear rama de trabajo: `develop`.
- Crear respaldo de base de datos actual.
- Documentar variables `.env` actuales sin exponer valores.
- Ejecutar diagnóstico inicial:
  ```bash
  npm install
  npm run lint
  npm run build
  npx prisma validate
  npx prisma format
  ```
- Crear archivo `docs/ROADMAP_PRODUCCION.md`.
- Crear checklist manual de módulos existentes.

### Entregables

- Rama estable protegida.
- Diagnóstico inicial documentado.
- Backup inicial.
- Checklist de módulos.

### Definition of Done

- El proyecto compila.
- La base de datos actual está respaldada.
- Existe una ruta clara de trabajo por sprints.

---

## Sprint 1 — Base de calidad y pruebas mínimas

**Objetivo:** instalar herramientas de prueba y dejar una base mínima para detectar errores.

### Tareas

- Instalar Vitest o Jest.
- Instalar Testing Library.
- Configurar scripts:
  ```json
  {
    "test": "vitest",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage"
  }
  ```
- Crear carpeta:
  ```text
  src/__tests__/
  src/lib/domain/__tests__/
  ```
- Crear primeras pruebas unitarias para:
  - Validación de DNI.
  - Cálculo de promedio.
  - Cálculo de saldo de pago.
  - Validación de estados.
- Crear `docs/QA_PLAN.md`.

### Entregables

- Framework de pruebas configurado.
- Primer set de pruebas unitarias.
- Plan QA inicial.

### Definition of Done

- `npm run test:run` funciona.
- `npm run lint` funciona.
- `npm run build` funciona.

---

## Sprint 2 — Seguridad y RBAC

**Objetivo:** cerrar la falla más crítica: usuarios autenticados sin permisos granulares.

### Tareas

- Crear helper `requireAuth()`.
- Crear helper `requireRole()`.
- Crear matriz de permisos:
  ```text
  ADMIN: todo
  DIRECTOR: reportes, estudiantes, notas, asistencia, incidencias
  RECEPCION: estudiantes, apoderados, matrículas
  DOCENTE: notas y asistencia asignadas
  CAJA: pagos y comprobantes
  COORDINADOR: incidencias e inhabilitaciones
  ```
- Proteger Server Actions:
  - estudiantes
  - matrículas
  - pagos
  - notas
  - asistencia
  - incidencias
  - inhabilitaciones
  - reportes
- Eliminar o bloquear `/api/seed` en producción.
- Auditar que los botones ocultos en UI no sean la única protección.

### Entregables

- RBAC funcional en servidor.
- Seed bloqueado o eliminado para producción.
- Tabla documentada de permisos.

### Definition of Done

- Un usuario sin rol válido no puede ejecutar acciones críticas.
- Acciones de reportes financieros están restringidas.
- `/api/seed` no funciona en producción.

---

## Sprint 3 — Base de datos productiva: capacidad, migraciones y auditoría

**Objetivo:** corregir la base de datos para soportar reglas reales del colegio.

### Tareas

- Agregar `capacity` a `Section`.
- Crear migración Prisma:
  ```bash
  npx prisma migrate dev --name add_section_capacity
  ```
- Actualizar formularios de sección para ingresar capacidad.
- Actualizar wizard de matrícula para usar capacidad real.
- Crear modelo `AuditLog`.
- Crear función `createAuditLog()`.
- Auditar acciones críticas:
  - crear matrícula
  - registrar pago
  - modificar nota
  - registrar incidencia
  - inhabilitar estudiante
  - generar reporte sensible

### Entregables

- Migración de capacidad.
- Migración de auditoría.
- Control real de vacantes.
- Auditoría inicial.

### Definition of Done

- La capacidad se guarda en BD.
- El wizard bloquea sección llena con capacidad real.
- Las acciones críticas generan registros en `AuditLog`.

---

## Sprint 4 — Rediseño financiero: pagos parciales y recibos

**Objetivo:** corregir el módulo de pagos para que sea confiable en producción.

### Tareas

- Crear modelo `PaymentTransaction`.
- Crear migración:
  ```bash
  npx prisma migrate dev --name add_payment_transactions
  ```
- Modificar `registerPayment` para recibir monto pagado.
- Validar:
  - monto mayor que cero
  - monto no mayor al saldo pendiente
  - método de pago obligatorio
  - código de operación opcional
- Calcular saldo con suma de transacciones.
- Actualizar estado:
  - `PENDIENTE`
  - `PAGADO`
  - `VENCIDO`
- Generar recibo por transacción.
- Actualizar reporte financiero.
- Crear pruebas de pago parcial y total.

### Entregables

- Pagos parciales reales.
- Historial de abonos.
- Recibos por abono.
- Reportes actualizados.

### Definition of Done

- Una cuota puede recibir varios abonos.
- El saldo pendiente se calcula correctamente.
- La cuota cambia a pagada solo cuando el saldo es cero.
- El sistema conserva historial financiero.

---

## Sprint 5 — Refactor controlado de reglas de negocio y tipos

**Objetivo:** mejorar mantenibilidad sin cambiar toda la interfaz.

### Tareas

- Crear carpeta:
  ```text
  src/lib/domain/
  ```
- Mover reglas puras:
  - cálculo de promedio
  - cálculo de saldo
  - cálculo de estado de pago
  - cálculo de vacantes
  - cálculo de porcentaje de inasistencia
- Crear DTOs compartidos:
  ```text
  src/lib/types/
  ```
- Reducir uso de `any`.
- Crear patrón `ActionResult<T>`.
- Estandarizar errores.
- Dividir componentes grandes únicamente cuando sea necesario.

### Entregables

- Reglas centralizadas.
- Tipos más claros.
- Menos lógica duplicada.
- Manejo de errores consistente.

### Definition of Done

- Las reglas críticas tienen pruebas unitarias.
- No se duplican cálculos de notas/pagos/vacantes.
- Las Server Actions devuelven respuestas consistentes.

---

## Sprint 6 — Pruebas de integración de módulos críticos

**Objetivo:** validar que los módulos principales funcionen conectados con base de datos.

### Tareas

- Configurar base de datos de pruebas.
- Crear tests de integración para:
  - login básico
  - creación de estudiante
  - asociación de apoderado
  - matrícula con vacantes
  - matrícula en sección llena
  - generación automática de pagos
  - pago parcial
  - pago total
  - registro de notas
  - cálculo final
  - registro de asistencia
  - incidencia grave
  - inhabilitación
- Crear datos seed de prueba controlados.

### Entregables

- Suite de integración.
- Cobertura mínima de módulos críticos.
- Documento de escenarios probados.

### Definition of Done

- Las pruebas de integración pasan.
- Se detectan errores antes de compilar a producción.
- Los flujos críticos tienen evidencia de calidad.

---

## Sprint 7 — Pruebas E2E y validación funcional completa

**Objetivo:** probar el sistema como lo usaría un usuario real.

### Tareas

- Instalar Playwright.
- Crear pruebas E2E para:
  - login correcto
  - bloqueo de acceso sin sesión
  - registrar estudiante
  - matricular estudiante
  - registrar pago parcial
  - registrar asistencia
  - registrar notas
  - generar boleta
  - exportar Excel
- Crear usuario de prueba por rol.
- Probar sidebar, navegación y modales.
- Probar responsive básico.

### Entregables

- Pruebas E2E principales.
- Evidencia funcional de flujo completo.
- Checklist de aceptación manual.

### Definition of Done

- Flujo estudiante → matrícula → pago → asistencia → notas → reporte funciona de punta a punta.
- No hay errores visibles en consola durante flujos principales.

---

## Sprint 8 — Rendimiento, seguridad avanzada y archivos

**Objetivo:** preparar el sistema para soportar datos reales y proteger archivos/reportes.

### Tareas

- Revisar queries pesadas de dashboard.
- Revisar reportes Excel/PDF.
- Agregar paginación donde sea necesario.
- Confirmar debounce en búsquedas.
- Validar índices de BD:
  - pagos por estado/fecha
  - asistencia por fecha/sección
  - estudiante por DNI/nombre
- Validar subida de fotos en servidor.
- Restringir tipos MIME.
- Auditar descargas de reportes.
- Revisar `$queryRaw` para evitar riesgos.
- Agregar rate limiting si aplica en endpoints sensibles.

### Entregables

- Upload seguro.
- Reportes protegidos.
- Queries optimizadas.
- Checklist de seguridad.

### Definition of Done

- No se aceptan archivos no permitidos.
- Reportes sensibles requieren rol autorizado.
- Búsquedas no saturan el backend.

---

## Sprint 9 — Operación, despliegue, backups y documentación

**Objetivo:** dejar el proyecto preparado para publicarse y mantenerse.

### Tareas

- Crear `docs/DEPLOYMENT.md`.
- Documentar variables de entorno:
  - `DATABASE_URL`
  - `NEXTAUTH_SECRET`
  - `NEXTAUTH_URL`
  - `SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY` o equivalente
  - variables de storage
- Crear guía de migraciones:
  ```bash
  npx prisma migrate deploy
  ```
- Crear política de backup:
  - diario automático
  - backup antes de deploy
  - prueba de restauración
- Crear guía de rollback.
- Configurar logs básicos.
- Normalizar encoding UTF-8.
- Redirigir página raíz.
- Documentar roles y permisos.

### Entregables

- Documentación de despliegue.
- Política de backups.
- Guía de rollback.
- Documentación de roles.

### Definition of Done

- Otra persona puede desplegar el sistema siguiendo la documentación.
- Existe procedimiento de recuperación ante fallo.
- Las variables sensibles no están hardcodeadas.

---

## Sprint 10 — UAT, congelamiento y salida a producción

**Objetivo:** validar el sistema completo antes de publicarlo.

### Tareas

- Crear ambiente staging.
- Ejecutar pruebas completas:
  ```bash
  npm run lint
  npm run build
  npm run test:run
  npx prisma migrate deploy
  ```
- Prueba manual con usuarios reales:
  - admin
  - recepción
  - caja
  - docente
  - coordinación
  - dirección
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

### Entregables

- Versión candidata a producción.
- Checklist UAT aprobado.
- Release notes.
- Deploy productivo.

### Definition of Done

- No hay fallas críticas abiertas.
- Todos los roles funcionan.
- Los reportes generan datos correctos.
- Hay backup antes del deploy.
- El sistema puede volver atrás si falla el despliegue.

---

## 6. Orden recomendado de prioridad

| Prioridad | Acción | Motivo |
|---|---|---|
| 1 | Instalar pruebas mínimas | Sin pruebas, cualquier cambio puede romper el sistema |
| 2 | Implementar RBAC | Seguridad de datos sensibles |
| 3 | Eliminar o restringir `/api/seed` | Riesgo directo en producción |
| 4 | Agregar capacidad real a secciones | Evita matrículas incorrectas |
| 5 | Crear pagos parciales reales | Corrige el núcleo financiero |
| 6 | Crear auditoría | Trazabilidad institucional |
| 7 | Crear migraciones formales | Control de base de datos |
| 8 | Centralizar reglas de negocio | Evita inconsistencias |
| 9 | Pruebas de integración y E2E | Evidencia de calidad |
| 10 | Documentar despliegue y backups | Preparación real para producción |

---

## 7. Checklist final para considerar listo para producción

### Seguridad

- [ ] Rutas protegidas.
- [ ] Server Actions protegidas por rol.
- [ ] Reportes protegidos por rol.
- [ ] `/api/seed` eliminado o bloqueado.
- [ ] No hay credenciales hardcodeadas.
- [ ] Uploads validados en cliente y servidor.
- [ ] Auditoría activa para acciones críticas.

### Base de datos

- [ ] Migraciones Prisma creadas.
- [ ] `capacity` en `Section`.
- [ ] `PaymentTransaction` implementado.
- [ ] `AuditLog` implementado.
- [ ] Índices revisados.
- [ ] Backups documentados.
- [ ] Restore probado.

### Funcionalidad

- [ ] Crear estudiante.
- [ ] Asociar apoderado.
- [ ] Matricular estudiante.
- [ ] Bloquear sección llena.
- [ ] Generar cuotas.
- [ ] Registrar pago parcial.
- [ ] Registrar pago total.
- [ ] Registrar asistencia.
- [ ] Registrar notas.
- [ ] Calcular promedio.
- [ ] Registrar incidencias.
- [ ] Inhabilitar estudiante.
- [ ] Generar PDF.
- [ ] Exportar Excel.

### Pruebas

- [ ] Pruebas unitarias.
- [ ] Pruebas de integración.
- [ ] Pruebas E2E.
- [ ] Pruebas de seguridad.
- [ ] Pruebas de reportes.
- [ ] Pruebas de rendimiento básico.

### Operación

- [ ] `docs/DEPLOYMENT.md` completo.
- [ ] `.env.example` actualizado.
- [ ] Procedimiento de migración.
- [ ] Procedimiento de rollback.
- [ ] Logs básicos.
- [ ] Monitoreo mínimo.
- [ ] Release notes.

---

## 8. Conclusión

TerraNova Academy tiene una base funcional fuerte y un alcance muy completo para un ERP escolar. El proyecto ya no debe enfocarse en agregar más módulos, sino en **cerrar brechas de producción**: seguridad, pruebas, pagos parciales, control real de vacantes, auditoría, migraciones, documentación y despliegue controlado.

La ruta más segura es avanzar por sprints. Primero se estabiliza el proyecto, luego se protege con permisos, después se corrige la base de datos y el módulo financiero, y recién al final se trabaja rendimiento, despliegue y validación de producción.

Con este plan, el sistema puede evolucionar de un proyecto avanzado académico/técnico a una aplicación lista para producción sin realizar cambios bruscos que rompan los módulos existentes.
