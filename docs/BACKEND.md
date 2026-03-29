# TerraNova Academy — Análisis Completo del Backend

## 1. Arquitectura General

### Estructura de carpetas clave

```
src/
├── app/(dashboard)/dashboard/     ← Rutas Next.js App Router (Server Components)
│   ├── asistencia/page.tsx        ← Carga getAcademicStructure()
│   ├── notas/page.tsx             ← Carga getAcademicStructure()
│   ├── pagos/page.tsx
│   ├── matriculas/page.tsx
│   └── ...
├── lib/
│   ├── prisma.ts                  ← Singleton de PrismaClient + Pool de pg
│   ├── constants.ts               ← MIN_PASSING_SCORE, RISK_ABSENCE_PERCENT
│   ├── actions/                   ← 17 Server Actions (la capa de backend completa)
│   ├── utils/
│   │   ├── grade-calculator.ts    ← Lógica pura de notas (sin DB)
│   │   ├── student-status.ts      ← Lógica pura de semáforo (sin DB)
│   │   └── perf.ts                ← Wrapper withTiming para benchmarking
│   └── validations/               ← 8 schemas Zod (validación de entrada)
├── components/
│   └── modules/                   ← Client Components por dominio
└── middleware.ts                  ← Auth guard (next-auth)
```

### Cómo se conectan Server Actions con el frontend

```
Browser click
  → Client Component (useTransition / startTransition)
    → Server Action ("use server" directive)
      → Zod validation → Prisma query → DB response
        → revalidatePath() invalidates Next.js cache
          → Client Component re-renders con datos frescos
```

No hay API REST. Todo el backend vive en las Server Actions de Next.js — se invocan como funciones normales pero corren en el servidor. El estado del cliente se actualiza via `revalidatePath()` que invalida el cache de React Server Components.

### Dónde vive la lógica

| Tipo | Dónde |
|---|---|
| Lógica de negocio pura | `src/lib/utils/` (sin dependencias de DB) |
| Orquestación y reglas con BD | `src/lib/actions/*.actions.ts` |
| Acceso a datos (ORM) | `prisma.*` dentro de las actions |
| Validación de entrada | `src/lib/validations/*.schema.ts` (Zod) |
| Configuración DB | `src/lib/prisma.ts` |

---

## 2. Capa de Base de Datos

### Configuración de Prisma (`src/lib/prisma.ts`)

- **Adapter**: `@prisma/adapter-pg` v7 con `pg.Pool` — usa el Transaction Pooler de Supabase (`port 6543`)
- **Pool**: Singleton global guardado en `globalThis` para sobrevivir hot-reloads de Next.js
- **SSL**: `rejectUnauthorized: false` (necesario para Supabase)
- **Logs**: Listener `$on('query')` que loggea queries >100ms como `[SLOW QUERY]`
- **Flag `listenerRegistered`**: evita registro duplicado del listener en cada hot-reload

### Modelos y relaciones principales

```
AcademicYear ──── Section[] ──── Enrollment[] ──── GradeRecord[]
                                              ├──── Attendance[]
                                              ├──── Payment[]
                                              ├──── Incident[]
                                              └──── DisabilityRecord[]

Section ──── GradeLevel ──── Course[]
        └─── Teacher? (nullable)

Student ──── Guardian[]
        └─── Enrollment[]

Schedule ──── Section, Course, Teacher (teacherId NOT nullable)
PaymentConcept ──── Payment[]
```

### Modelos centrales y sus campos clave

| Modelo | Campos críticos | Constraints |
|---|---|---|
| `Student` | `status: StudentStatus` (denormalizado) | `dni` unique |
| `Enrollment` | `active: Boolean`, `studentId`, `sectionId`, `academicYearId` | `@@unique([studentId, academicYearId])` |
| `GradeRecord` | `period: GradePeriod`, `score: Float?` | `@@unique([enrollmentId, courseId, period])` |
| `Attendance` | `status: AttendanceStatus`, `date` | `@@unique([enrollmentId, date])` |
| `Payment` | `status: PaymentStatus`, `dueDate`, `paidAt?`, `amount` | FK a Enrollment + Concept |
| `Section` | `teacherId: String?` (nullable — causa del NULL-IN bug) | `@@unique([gradeLevelId, academicYearId])` |

### Enums del sistema

- `GradePeriod`: P1, P2, P3, P4, FINAL
- `StudentStatus`: ACTIVO, OBSERVADO, EN_RIESGO, INHABILITADO, RETIRADO
- `AttendanceStatus`: PRESENTE, TARDANZA, FALTA_JUSTIFICADA, FALTA_INJUSTIFICADA
- `PaymentStatus`: PENDIENTE, PAGADO, VENCIDO, ANULADO

### Índices definidos en schema.prisma

| Tabla | Índices |
|---|---|
| `GradeRecord` | `@@unique([enrollmentId, courseId, period])` |
| `Attendance` | `@@unique([enrollmentId, date])` |
| `Enrollment` | `@@unique([studentId, academicYearId])` |
| `Section` | `@@unique([gradeLevelId, academicYearId])` |
| `Payment` | `@@index([status])`, `@@index([dueDate])`, `@@index([paidAt])`, `@@index([status, dueDate])` ← **agregados recientemente** |

> [!WARNING]
> Los 4 índices de Payment están definidos en schema.prisma pero **NO se aplicaron a Supabase** (db push se canceló con exit code 130). Deben crearse manualmente con `CREATE INDEX CONCURRENTLY` en el SQL Editor.

---

## 3. Inventario Completo de Server Actions (17 archivos)

### 📊 Dominio: GRADES (`grade.actions.ts`)

| Función | Qué hace | Tablas | Validación | Transacción |
|---|---|---|---|---|
| `getGradesBySection` | Lista alumnos + notas actuales de sección/curso/periodo | Enrollment, GradeRecord | No | No |
| `saveGrades` | Guarda notas en lote (upsert). Recalcula FINAL y sincroniza status | GradeRecord, Student | Zod `BatchGradeSchema` | Sí (Fase 1+2 en tx, Fase 3 fuera) |
| `getStudentGrades` | Boleta completa (todos los cursos, todos los periodos) de un alumno | GradeRecord, Course | No | No |
| `calculateFinalGrade` | Calcula y persiste nota FINAL de un curso puntual | GradeRecord | No | Sí |
| `calculateAllFinalGrades` | Recalcula FINAL de todos los cursos de una matrícula | GradeRecord, Student | No | Sí |
| `getStudentsAtRisk` | Alumnos con 2+ cursos reprobados (notas FINAL) | Enrollment, GradeRecord | No | No |
| `getSectionGradeReport` | Estadísticas de la sección para un periodo (ranking, promedio) | Enrollment, GradeRecord | No | No |

**Funciones internas (no exportadas):**
- `internalCalculateFinalGrade(tx, enrollmentId, courseId, period?, score?)` — usa Map y fetch optimizado
- `syncStudentStatus(client, enrollmentId)` — acepta tx o prisma global

### 📋 Dominio: ATTENDANCE (`attendance.actions.ts`)

| Función | Qué hace | Tablas | Validación | Transacción |
|---|---|---|---|---|
| `getAttendanceBySection` | Lista alumnos de la sección con estado de asistencia en una fecha | Enrollment, Attendance | Manual (sectionId) | No |
| `getAttendanceByStudent` | Historial de asistencia de un alumno (filtrable mes/año) | Enrollment, Attendance | Manual (month/year) | No |
| `saveAttendance` | Guarda asistencia en lote (upsert). Valida rango académico. Actualiza status | Attendance, Student | Zod `SaveAttendanceBatchSchema` | No (loop for + updateStudentStatus) |
| `justifyAbsence` | Cambia FALTA_INJUSTIFICADA → FALTA_JUSTIFICADA | Attendance, Student | Zod `JustifyAbsenceSchema` | No |
| `getAttendanceStats` | Estadísticas de asistencia de un alumno (%, counts) | Attendance, CalendarEvent | Manual | No |
| `getCriticalAttendance` | Alumnos con >20% faltas injustificadas (optimizado, 2 queries totales) | Enrollment, Attendance, CalendarEvent | Zod `CriticalAttendanceFilterSchema` | No |
| `getSectionAttendanceReport` | Planilla completa de una sección por mes (para exportar a Excel) | Section, Enrollment, Attendance, CalendarEvent | Zod `SectionAttendanceReportSchema` | No |

**Función interna:**
- `updateStudentStatusByEnrollment(enrollmentId)` — versión de la attendance (tiene guard de 10 días mínimos)

### 💳 Dominio: PAYMENTS (`payment.actions.ts`)

| Función | Qué hace | Tablas | Validación | Transacción |
|---|---|---|---|---|
| `getPaymentConcepts` | Lista conceptos de pago (filtrable por tipo) | PaymentConcept | No | No |
| `createPaymentConcept` | Crea nuevo concepto | PaymentConcept | Zod | No |
| `getPaymentDashboardStats` | Stats del mes: pagado, pendiente, vencido, semana + últimos 10 pagados | Payment | No | No (1 $queryRaw + 1 findMany) |
| `searchStudentsForPayment` | Búsqueda rápida de alumnos para registrar cobros | Student, Enrollment | No | No |
| `getStudentPendingPayments` | Pagos pendientes/vencidos del alumno activo | Enrollment, Payment | No | No |
| `getPaymentsByEnrollment` | Historial completo de pagos de una matrícula | Payment | No | No |
| `registerPayment` | Marca pago como PAGADO, genera número de recibo correlativo | Payment | Zod `RegisterPaymentReceiptSchema` | Sí |
| `updateOverduePayments` | Batch: cambia PENDIENTE → VENCIDO si dueDate < hoy | Payment | No | No (updateMany) |
| `getOverduePayments` | Lista todos los pagos VENCIDO con datos del alumno | Payment, Enrollment, Student | No | No |
| `getUpcomingPayments` | Pagos que vencen en N días (default 7) | Payment, Enrollment | No | No |
| `getFinancialSummary` | Resumen mes a mes (billed/paid/pending/overdue) | Payment | No | No |
| `getFinancialReport` | Reporte anual completo en 1 $queryRaw con DATE_TRUNC | Payment | No | No (1 $queryRaw) |

### 🎓 Dominio: ENROLLMENT (`enrollment.actions.ts`)

| Función | Qué hace | Tablas | Validación | Transacción |
|---|---|---|---|---|
| `getEnrollments` | Lista paginada con filtros (search, level, year, active) | Enrollment, Student, Section | No | No (Promise.all) |
| `getEnrollmentById` | Detalle completo de una matrícula | Enrollment, Student, Section, Teacher | No | No |
| `getEnrollmentsBySection` | Alumnos de una sección | Enrollment, Student | No | No |
| `createEnrollment` | Crea matrícula + genera pagos automáticos (matrícula + mensualidades) | Enrollment, AcademicYear, Payment | Zod `EnrollmentSchema` | Sí |
| `transferSection` | Transfiere alumno de sección | Enrollment | Zod | No |
| `withdrawEnrollment` | Retira alumno (active=false, status=RETIRADO) | Enrollment, Student | Zod | Sí |

### 🏫 Dominio: ACADEMIC (`academic.actions.ts`)

| Función | Qué hace | Tablas | Validación | Transacción |
|---|---|---|---|---|
| `getAcademicStructure` | Estructura del año activo por niveles/grados/secciones (con teacher join en memoria) | AcademicYear, Section, Teacher | No | No (Promise.all) |
| `getCoursesByGradeLevel` | Cursos de un grado | Course | No | No |
| `getGradesBySection` | Secciones de un grado con alumnos | Section, Enrollment | No | No |
| `createAcademicYear` | Crea año académico | AcademicYear | Zod | No |
| `createSection` | Crea sección | Section | Zod | No |
| `updateSection` | Actualiza sección (nombre, docente, año) | Section | Zod | No |
| `deleteAcademicYear` | Elimina año académico | AcademicYear | No | No |
| `deleteSection` | Elimina sección | Section | No | No |
| `saveSchedule` | Reemplaza horario completo de una sección (delete+create atómico) | Schedule | Zod | Sí (`$transaction([deleteMany, createMany])`) |
| `getScheduleBySection` | Horario de sección con docente (join en memoria) | Schedule, Teacher | No | No (Promise.all) |
| `getScheduleByTeacher` | Horario de un docente | Schedule, Course, Section | No | No |

### Otros dominios

| Dominio | Archivo | Funciones clave |
|---|---|---|
| **Students** | `student.actions.ts` | `getStudents`, `getStudentById`, `createStudent`, `updateStudent`, `toggleStudentStatus` |
| **Teachers** | `teacher.actions.ts` | `getTeachers`, `getTeacherById`, `createTeacher`, `updateTeacher`, `toggleTeacherStatus` |
| **Dashboard** | `dashboard.actions.ts` | `getFinancialSummary`, `getStudentsAtRisk` (count), `getCriticalAttendance` (hoy), `getUpcomingPayments`, `getPriorityAlerts` |
| **Schedule** | `schedule.actions.ts` | `getSectionSchedule` (con join en memoria), `checkTeacherConflict`, `getActiveSectionsForSchedules`, `createSchedule`, `updateSchedule`, `deleteSchedule` |
| **Disability** | `disability.actions.ts` | `getActiveDisabilities`, `createDisability` (tx: status=INHABILITADO + enrollment.active=false), `resolveDisability` (tx: reactiva matrícula + recalcula status) |
| **Incidents** | `incident.actions.ts` | CRUD de incidentes por severidad |
| **Calendar** | `calendar.actions.ts` | CRUD de eventos del calendario académico |
| **Reports** | `report.actions.ts` | `exportGradesToExcel`, `exportAttendanceReport`, `exportFinancialReport` (usa xlsx lib) |
| **Upload** | `upload.actions.ts` | Subida de fotos a Supabase Storage |
| **Auth** | `auth.actions.ts` | Login/logout via next-auth |
| **Announcement** | `announcement.actions.ts` | CRUD de anuncios |
| **Course** | `course.actions.ts` | CRUD de cursos por grado |

---

## 4. Lógica de Negocio Crítica

### `internalCalculateFinalGrade(tx, enrollmentId, courseId, period?, score?)`

```
Objetivo: Calcular y persistir la nota FINAL = promedio(P1, P2, P3, P4)

Flujo:
1. Si se pasa currentPeriod+currentScore (call desde saveGrades):
   → Traer solo los OTROS 3 periodos de DB (1 findMany)
   → Inyectar el score ya conocido en un Map (evita re-leer lo que se acaba de escribir)
   Sino (call standalone):
   → Traer los 4 periodos de DB (1 findMany)

2. calculateFinalScore(P1, P2, P3, P4)
   → calculateAverage([p1, p2, p3, p4])
   → Ignora nulls, promedia los que tienen valor
   → Si ninguno tiene valor → null

3. gradeRecord.upsert(FINAL) → guarda el promedio calculado

Regla de negocio: FINAL es el promedio simple de los periodos no-nulos.
No hay ponderación diferente por periodo (todos pesan igual).
```

### `syncStudentStatus(client, enrollmentId)` — versión de `grade.actions.ts`

```
Objetivo: Actualizar Student.status basado solo en notas FINAL

Flujo:
1. enrollment.findUnique (con student, gradeRecords[FINAL], section.gradeLevel.courses)
2. totalCourses = gradeLevel.courses.length (cursos del grado)
3. failingCourses = gradeRecords.filter(r => !isPassing(r.score)).length
   → isPassing: score >= MIN_PASSING_SCORE (constante, probablemente 11)
4. average = promedio de todos los scores FINAL non-null
5. attendancePercent = 100 (HARDCODEADO — asistencia no integrada aquí aún)
6. calculateStudentStatus(attendance, failingCourses, totalCourses, average)
7. Si newStatus !== student.status → student.update()

Limitación conocida: usa attendancePercent = 100 fijo. La asistencia real
solo se considera en updateStudentStatusByEnrollment (attendance.actions.ts).
```

### `updateStudentStatusByEnrollment(enrollmentId)` — versión de `attendance.actions.ts`

```
Igual que syncStudentStatus PERO:
- SÍ calcula el attendancePercent real desde registros de Attendance
- Guard: si totalDays < 10, no actualiza (periodo muy corto)
- Usa MIN_PASSING_SCORE hardcodeado (< 11) en lugar de isPassing()
  → INCONSISTENCIA: pasa `< 11` en lugar de `<= 11` (o usar isPassing)
```

### `calculateStudentStatus(attendance, failing, total, average)` — el semáforo

```
Reglas (en orden de prioridad):

1. INHABILITADO si:
   - attendancePercent < 70 (faltas > 30%)
   - OR failingRatio > 0.5 (jalando > 50% de cursos)

2. EN_RIESGO si (dentro del bloque "alerta"):
   - failingCourses >= 3
   - OR attendancePercent < 70

3. OBSERVADO si (dentro del bloque "alerta"):
   - attendancePercent < 85 (faltas 15-30%)
   - OR failingCourses >= 3 (ver arriba, prioridad EN_RIESGO)
   - OR average < MIN_PASSING_SCORE (promedio general reprobado)

4. ACTIVO → si ninguna condición anterior aplica
```

> [!NOTE]
> La lógica del paso 2 tiene un doble-check redundante:
> `if (attendancePercent < 70 || failingRatio > 0.5) return "INHABILITADO"` 
> aparece DOS veces (líneas 17 y 26). El segundo check nunca se alcanza.

---

## 5. Flujos Completos End-to-End

### Flujo A: Profesor guarda notas → `saveGrades`

```
1. Profesor llena la grilla de notas en GradeGridClient (Client Component)
2. Click "Guardar" → startTransition(() => saveGrades(formData))
3. [Server] Zod valida BatchGradeSchema (courseId, period, grades[])
4. [Server] prisma.$transaction(async tx => {
     FASE 1: Promise.all(N × gradeRecord.upsert)
             ↳ Cada alumno: SELECT (existe?) + INSERT/UPDATE en GradeRecord
     FASE 2: Promise.all(N × internalCalculateFinalGrade(tx, id, courseId, period, score))
             ↳ Por alumno: SELECT 3 periodos + UPSERT GradeRecord[FINAL]
     COMMIT (más liviano sin syncStatus)
   })
5. [Server - post-tx] try {
     await Promise.all(uniqueEnrollments.map(id => syncStudentStatus(prisma, id)))
   } catch (err) { console.error; /* no relanza */ }
6. revalidatePath("/dashboard/notas")
7. UI recibe { success: true } → toast de confirmación
8. React invalida cache → re-fetch Server Component con datos actualizados
```

### Flujo B: Se registra asistencia → `saveAttendance`

```
1. Professor marca presentes/ausentes en AttendanceClient
2. Click "Guardar" → saveAttendance(batchData)
3. [Server] Zod valida SaveAttendanceBatchSchema (records[])
4. [Server] Verifica año académico activo
5. [Server] Valida que cada fecha esté dentro del rango académico (for loop síncrono)
6. [Server] Promise.all(N × attendance.upsert) [usando @@unique([enrollmentId, date])]
7. [Server] for (const enrollmentId of uniqueEnrollmentIds) {
     await updateStudentStatusByEnrollment(enrollmentId)
     // Secuencial — 4 queries por alumno: enrollment, attendance, holidays, student.update
   }
8. revalidatePath("/dashboard/asistencia")
```

> [!WARNING]
> El paso 7 es secuencial (`for...await`) en lugar de `Promise.all`. Con 14 alumnos y RTT de 180ms por query, esto puede sumar ~10s. Es la deuda técnica más impactante que queda.

### Flujo C: Reporte financiero → `getFinancialReport`

```
1. Admin selecciona año en el módulo de pagos
2. getFinancialReport(year) invocada por Client Component
3. [Server] 1 sola $queryRaw:
   SELECT
     EXTRACT(MONTH FROM "dueDate") AS month,
     status,
     SUM(amount) AS total
   FROM "Payment"
   WHERE EXTRACT(YEAR FROM "dueDate") = $year
   GROUP BY month, status
4. [Server] Construye array de 12 meses en memoria (reduce en JS, 0 queries adicionales)
5. Retorna { month, totalBilled, totalPaid, totalPending, totalOverdue }[] (12 elementos)
```

---

## 6. Deuda Técnica y Puntos Débiles

### ⚠️ Inconsistencias críticas

| # | Problema | Archivo | Impacto |
|---|---|---|---|
| 1 | `updateStudentStatusByEnrollment` usa `< 11` hardcodeado para cursos reprobados; `syncStudentStatus` usa `isPassing()` que lee `MIN_PASSING_SCORE`. Si el umbral cambia, quedan desfasados. | `attendance.actions.ts` L723 vs `grade-calculator.ts` L25 | Semáforo inconsistente según desde dónde se actualice el status |
| 2 | `syncStudentStatus` (grade) usa `attendancePercent = 100` hardcodeado. El status calculado desde notas nunca penaliza por asistencia. | `grade.actions.ts` L303 | Alumno puede tener 50% de faltas y seguir como ACTIVO si sus notas son buenas |
| 3 | `calculateAllFinalGrades` usa `for...of` con `await` secuencial para los cursos de una matrícula | `grade.actions.ts` L420 | N×2 queries secuenciales en vez de paralelas |

### ⚠️ Lógica de status duplicada

Hay **DOS implementaciones** del cálculo de status del alumno que viven en paralelo y compiten entre sí:

| Función | Dónde | Considera asistencia real | Se llama desde |
|---|---|---|---|
| `syncStudentStatus` | `grade.actions.ts` | ❌ (100% hardcoded) | `saveGrades`, `calculateAllFinalGrades` |
| `updateStudentStatusByEnrollment` | `attendance.actions.ts` | ✅ | `saveAttendance`, `justifyAbsence` |
| `resolveDisability` | `disability.actions.ts` | ✅ (vía `getAttendanceStats`) | `resolveDisability` |

Si se guarda una nota **después** de guardar asistencia, `syncStudentStatus` puede sobrescribir el status calculado con asistencia real con uno que ignora la asistencia.

### ⚠️ `saveAttendance` sync secuencial

```typescript
// attendance.actions.ts L246
for (const enrollmentId of uniqueEnrollmentIds) {
  await updateStudentStatusByEnrollment(enrollmentId);  // 4 queries × RTT × N alumnos
}
```
Con 14 alumnos y RTT de 180ms → mínimo ~10s solo en la fase de sync. Debería ser `Promise.all`.

### ⚠️ Validaciones faltantes

| Acción | Qué falta |
|---|---|
| `getGradesBySection` | No valida que sectionId, courseId o period sean no-vacíos |
| `getStudentGrades` | No valida enrollmentId |
| `getStudentsAtRisk` (grade) | No valida sectionId |
| `getFinancialSummary` (payment) | No valida month/year ranges |
| `updateOverduePayments` | Sin validación de entrada (es admin-only pero sin protección) |

### ⚠️ Manejo de errores inconsistente

| Patrón A (consistente) | Patrón B (inconsistente) |
|---|---|
| `return { success: false, error: "mensaje" }` | `throw new Error(...)` capturado con `try/catch` |
| Usado en: la mayoría de actions | Usado en: `createDisability`, `resolveDisability`, `createEnrollment` |

En Patrón B, si el `try/catch` falla de forma inesperada, puede llegar una excepción no serializable al cliente via React Server Actions, causando errores menos descriptivos.

### ✅ Lo que está bien hecho

- Todas las mutaciones de escritura críticas (`saveGrades`, `createDisability`, `resolveDisability`, `createEnrollment`, `registerPayment`, `saveSchedule`) usan `$transaction(async tx => ...)` —  atomicidad garantizada
- Los schemas Zod cubren los 8 dominios con mutaciones
- El patrón teacher null-IN fue eliminado de todos los puntos (getAcademicStructure, schedule, enrollment, academic)
- `getCriticalAttendance` fue optimizada de N+1 a 2 queries fijas
- `getFinancialReport` fue optimizado de 12 queries a 1 `$queryRaw`
- El batch `$transaction([findMany, count])` que causaba el DeprecationWarning de pg fue reemplazado por `Promise.all`
