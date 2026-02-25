# MASTER — TerraNova Academy · Sistema de Gestión Escolar

> **Documento Maestro del Proyecto**
> Stack: Next.js 14 (App Router) · Prisma ORM · Supabase (PostgreSQL) · NextAuth v5 · Tailwind CSS · shadcn/ui · Vercel
> Versión: 1.0 | Este archivo es la fuente de verdad del proyecto. Toda IA o desarrollador debe leerlo completo antes de escribir cualquier línea de código.

---

## ÍNDICE

1. [Descripción General](https://claude.ai/chat/c98e1f95-55ed-44b7-bce1-a94c0e02d8f4#1-descripci%C3%B3n-general)
2. [Stack Tecnológico](https://claude.ai/chat/c98e1f95-55ed-44b7-bce1-a94c0e02d8f4#2-stack-tecnol%C3%B3gico)
3. [Reglas de Desarrollo](https://claude.ai/chat/c98e1f95-55ed-44b7-bce1-a94c0e02d8f4#3-reglas-de-desarrollo)
4. [Estructura de Carpetas](https://claude.ai/chat/c98e1f95-55ed-44b7-bce1-a94c0e02d8f4#4-estructura-de-carpetas)
5. [Esquema de Base de Datos](https://claude.ai/chat/c98e1f95-55ed-44b7-bce1-a94c0e02d8f4#5-esquema-de-base-de-datos)
6. [Lógica de Negocio Crítica](https://claude.ai/chat/c98e1f95-55ed-44b7-bce1-a94c0e02d8f4#6-l%C3%B3gica-de-negocio-cr%C3%ADtica)
7. [Módulos y Rutas](https://claude.ai/chat/c98e1f95-55ed-44b7-bce1-a94c0e02d8f4#7-m%C3%B3dulos-y-rutas)
8. [API Routes y Server Actions](https://claude.ai/chat/c98e1f95-55ed-44b7-bce1-a94c0e02d8f4#8-api-routes-y-server-actions)
9. [Autenticación y Seguridad](https://claude.ai/chat/c98e1f95-55ed-44b7-bce1-a94c0e02d8f4#9-autenticaci%C3%B3n-y-seguridad)
10. [Plan de Sprints](https://claude.ai/chat/c98e1f95-55ed-44b7-bce1-a94c0e02d8f4#10-plan-de-sprints)

---

## 1. Descripción General

**TerraNova Academy** es un colegio privado con tres niveles educativos:

| Nivel      | Grados                       | Aulas            |
| ---------- | ---------------------------- | ---------------- |
| Inicial    | 1er año, 2do año, 3er año | 1 aula por grado |
| Primaria   | 1er grado al 6to grado       | 1 aula por grado |
| Secundaria | 1ro al 5to año              | 1 aula por grado |

**Total: 14 secciones** (una por grado). Cada sección tiene un tutor asignado.

### Usuarios del sistema

El sistema es manejado principalmente por  **el director del colegio** . No se requiere gestión de múltiples roles complejos, pero sí una autenticación robusta. Solo existe un rol `ADMIN` (director).

### Alcance funcional

El sistema gestiona de forma integral:

* Matrículas anuales de estudiantes
* Expediente completo del estudiante (datos, apoderado, foto, documentos)
* Registro y historial de notas por periodo
* Control de asistencia diaria con justificaciones
* Cobros: mensualidades, matrícula, exámenes y servicios extra
* Alertas automáticas de pagos vencidos o por vencer
* Inhabilitación automática/manual por exceso de faltas o bajo rendimiento
* Registro de incidencias disciplinarias
* Generación de documentos PDF oficiales
* Comunicados internos y observaciones en el expediente
* Horarios por aula
* Calendario académico

---

## 2. Stack Tecnológico

```
Frontend + Backend:  Next.js 14 (App Router, Server Components, Server Actions)
ORM:                 Prisma 5+
Base de datos:       PostgreSQL via Supabase
Autenticación:       NextAuth.js v5 (Auth.js)
UI Components:       shadcn/ui + Tailwind CSS
Formularios:         React Hook Form + Zod
Gráficas:            Recharts
PDF:                 React-PDF (@react-pdf/renderer)
Emails:              Resend
Fechas:              date-fns
Deploy:              Vercel
Storage (fotos):     Supabase Storage
```

### Dependencias principales (`package.json`)

```json
{
  "dependencies": {
    "next": "^14.2.0",
    "@prisma/client": "^5.14.0",
    "next-auth": "^5.0.0-beta",
    "@auth/prisma-adapter": "^2.4.0",
    "zod": "^3.23.0",
    "react-hook-form": "^7.51.0",
    "@hookform/resolvers": "^3.6.0",
    "@react-pdf/renderer": "^3.4.0",
    "recharts": "^2.12.0",
    "date-fns": "^3.6.0",
    "resend": "^3.2.0",
    "@supabase/supabase-js": "^2.43.0"
  },
  "devDependencies": {
    "prisma": "^5.14.0",
    "typescript": "^5.4.0",
    "@types/node": "^20.0.0",
    "@types/react": "^18.0.0",
    "tailwindcss": "^3.4.0"
  }
}
```

---

## 3. Reglas de Desarrollo

> Estas reglas son  **no negociables** . Cualquier IA o desarrollador debe seguirlas estrictamente.

### 3.1 Reglas Generales

* **TypeScript estricto** en todo el proyecto. Sin `any` implícito.
* **Zod** para validar toda entrada de datos (formularios y API).
* **Server Actions** para mutaciones de datos. No crear API Routes innecesarias.
* **Server Components** por defecto. Solo usar `'use client'` cuando sea estrictamente necesario (interactividad, hooks).
* **Prisma** es el único ORM. No escribir SQL crudo salvo para queries complejas con `$queryRaw`.
* Todas las rutas bajo `/dashboard/*` requieren sesión activa. El middleware protege el acceso.
* Las fotos de estudiantes y docentes van a  **Supabase Storage** , no a la base de datos.
* Manejo de errores explícito en cada Server Action: retornar `{ success, error, data }`.

### 3.2 Convenciones de Nomenclatura

```
Archivos:         kebab-case         (nueva-matricula.tsx)
Componentes:      PascalCase         (StudentCard.tsx)
Variables/funcs:  camelCase          (getStudentById)
Constantes:       UPPER_SNAKE_CASE   (MAX_ABSENCE_PERCENT)
Server Actions:   verbo + entidad    (createEnrollment, updateGrade)
Rutas API:        /api/[recurso]     (solo si es necesario)
```

### 3.3 Estructura de una Server Action

```typescript
// lib/actions/enrollment.actions.ts
'use server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

const CreateEnrollmentSchema = z.object({ ... })

export async function createEnrollment(formData: unknown) {
  const parsed = CreateEnrollmentSchema.safeParse(formData)
  if (!parsed.success) {
    return { success: false, error: parsed.error.flatten() }
  }
  try {
    const result = await prisma.enrollment.create({ data: parsed.data })
    revalidatePath('/dashboard/matriculas')
    return { success: true, data: result }
  } catch (error) {
    return { success: false, error: 'Error al crear la matrícula' }
  }
}
```

### 3.4 Orden de Desarrollo

**NUNCA mezclar backend y frontend en el mismo sprint.**

```
FASE 1 → Backend completo y testeado
FASE 2 → Frontend sobre backend ya funcional
```

Dentro de cada fase, seguir el orden de sprints definido en la sección 10.

---

## 4. Estructura de Carpetas

```
terranova-academy/
├── prisma/
│   ├── schema.prisma              ← Modelo de datos (fuente de verdad)
│   └── seed.ts                    ← Datos iniciales del sistema
│
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   └── login/
│   │   │       ├── page.tsx
│   │   │       ├── recover/page.tsx
│   │   │       └── reset/page.tsx
│   │   │
│   │   └── (dashboard)/
│   │       ├── layout.tsx         ← Layout protegido con sidebar
│   │       └── dashboard/
│   │           ├── page.tsx                        ← Dashboard principal
│   │           ├── matriculas/
│   │           │   ├── page.tsx
│   │           │   ├── nueva/page.tsx
│   │           │   ├── importar/page.tsx
│   │           │   └── [id]/
│   │           │       ├── page.tsx
│   │           │       ├── editar/page.tsx
│   │           │       └── trasladar/page.tsx
│   │           ├── estudiantes/
│   │           │   ├── page.tsx
│   │           │   ├── nuevo/page.tsx
│   │           │   └── [id]/
│   │           │       ├── page.tsx
│   │           │       ├── editar/page.tsx
│   │           │       ├── historial/page.tsx
│   │           │       ├── documentos/page.tsx
│   │           │       └── estado/page.tsx
│   │           ├── docentes/
│   │           │   ├── page.tsx
│   │           │   ├── nuevo/page.tsx
│   │           │   └── [id]/
│   │           │       ├── page.tsx
│   │           │       ├── editar/page.tsx
│   │           │       └── horario/page.tsx
│   │           ├── cursos/
│   │           │   ├── page.tsx
│   │           │   ├── nuevo/page.tsx
│   │           │   └── [id]/editar/page.tsx
│   │           ├── horarios/
│   │           │   ├── page.tsx
│   │           │   └── [seccionId]/editar/page.tsx
│   │           ├── secciones/
│   │           │   └── page.tsx
│   │           ├── notas/
│   │           │   ├── page.tsx
│   │           │   ├── reporte/page.tsx
│   │           │   ├── riesgo/page.tsx
│   │           │   └── [matriculaId]/
│   │           │       ├── page.tsx
│   │           │       └── editar/page.tsx
│   │           ├── asistencia/
│   │           │   ├── page.tsx
│   │           │   ├── justificar/page.tsx
│   │           │   ├── reporte/page.tsx
│   │           │   ├── critica/page.tsx
│   │           │   └── [matriculaId]/page.tsx
│   │           ├── pagos/
│   │           │   ├── page.tsx
│   │           │   ├── registrar/page.tsx
│   │           │   ├── vencidos/page.tsx
│   │           │   ├── por-vencer/page.tsx
│   │           │   ├── conceptos/page.tsx
│   │           │   ├── reporte/page.tsx
│   │           │   └── [matriculaId]/page.tsx
│   │           ├── inhabilitaciones/
│   │           │   ├── page.tsx
│   │           │   ├── nueva/page.tsx
│   │           │   └── [id]/resolver/page.tsx
│   │           ├── incidencias/
│   │           │   ├── page.tsx
│   │           │   ├── nueva/page.tsx
│   │           │   ├── [id]/page.tsx
│   │           │   └── alumno/[matriculaId]/page.tsx
│   │           ├── reportes/
│   │           │   ├── page.tsx
│   │           │   ├── libreta/[matriculaId]/page.tsx
│   │           │   ├── constancia/[matriculaId]/page.tsx
│   │           │   ├── asistencia/[seccionId]/page.tsx
│   │           │   └── financiero/page.tsx
│   │           ├── comunicados/
│   │           │   ├── page.tsx
│   │           │   ├── nuevo/page.tsx
│   │           │   └── [id]/page.tsx
│   │           ├── calendario/
│   │           │   ├── page.tsx
│   │           │   └── nuevo/page.tsx
│   │           └── configuracion/
│   │               ├── page.tsx
│   │               ├── año-lectivo/page.tsx
│   │               ├── niveles/page.tsx
│   │               └── reglas/page.tsx
│   │
│   ├── components/
│   │   ├── ui/                    ← shadcn/ui (no editar)
│   │   ├── shared/                ← Reutilizables globales
│   │   │   ├── Sidebar.tsx
│   │   │   ├── PageHeader.tsx
│   │   │   ├── DataTable.tsx
│   │   │   ├── StatusBadge.tsx
│   │   │   ├── StudentAvatar.tsx
│   │   │   └── ConfirmDialog.tsx
│   │   └── modules/               ← Componentes por módulo
│   │       ├── dashboard/
│   │       ├── students/
│   │       ├── enrollment/
│   │       ├── grades/
│   │       ├── attendance/
│   │       ├── payments/
│   │       └── reports/
│   │
│   ├── lib/
│   │   ├── prisma.ts              ← Cliente Prisma singleton
│   │   ├── auth.ts                ← Configuración NextAuth v5
│   │   ├── supabase.ts            ← Cliente Supabase (storage)
│   │   ├── constants.ts           ← Constantes globales
│   │   ├── utils.ts               ← Helpers generales
│   │   ├── validations/           ← Schemas Zod por módulo
│   │   │   ├── student.schema.ts
│   │   │   ├── enrollment.schema.ts
│   │   │   ├── grade.schema.ts
│   │   │   ├── attendance.schema.ts
│   │   │   └── payment.schema.ts
│   │   └── actions/               ← Server Actions por módulo
│   │       ├── student.actions.ts
│   │       ├── enrollment.actions.ts
│   │       ├── teacher.actions.ts
│   │       ├── grade.actions.ts
│   │       ├── attendance.actions.ts
│   │       ├── payment.actions.ts
│   │       ├── incident.actions.ts
│   │       └── report.actions.ts
│   │
│   └── middleware.ts              ← Protección de rutas
│
├── public/
│   └── logo.png                   ← Logo de TerraNova Academy
│
├── .env.local                     ← Variables de entorno (nunca commitear)
├── MASTER.md                      ← Este archivo
└── PROMPTS.md                     ← Prompts de trabajo para IA
```

---

## 5. Esquema de Base de Datos

### 5.1 Enums

```prisma
enum Level {
  INICIAL
  PRIMARIA
  SECUNDARIA
}

enum StudentStatus {
  ACTIVO
  OBSERVADO
  EN_RIESGO
  INHABILITADO
  RETIRADO
}

enum AttendanceStatus {
  PRESENTE
  TARDANZA
  FALTA_JUSTIFICADA
  FALTA_INJUSTIFICADA
}

enum PaymentStatus {
  PENDIENTE
  PAGADO
  VENCIDO
  ANULADO
}

enum PaymentType {
  MENSUALIDAD
  MATRICULA
  EXAMEN
  UNIFORME
  OTRO
}

enum DisabilityReason {
  EXCESO_FALTAS
  BAJO_RENDIMIENTO
  DISCIPLINA
  OTRO
}

enum GradePeriod {
  P1
  P2
  P3
  P4
  FINAL
}

enum IncidentSeverity {
  LEVE
  MODERADO
  GRAVE
}

enum EventType {
  EXAMEN
  FERIADO
  EVENTO
  REUNION
  OTRO
}
```

### 5.2 Modelos Prisma

```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  passwordHash  String
  name          String
  role          String    @default("ADMIN")
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model AcademicYear {
  id          String    @id @default(cuid())
  year        Int       @unique
  startDate   DateTime
  endDate     DateTime
  active      Boolean   @default(false)
  createdAt   DateTime  @default(now())

  sections    Section[]
  enrollments Enrollment[]
  events      CalendarEvent[]
}

model GradeLevel {
  id       String  @id @default(cuid())
  name     String  @unique
  level    Level
  order    Int

  sections Section[]
  courses  Course[]
}

model Section {
  id             String    @id @default(cuid())
  name           String
  gradeLevelId   String
  academicYearId String
  teacherId      String?

  gradeLevel     GradeLevel    @relation(fields: [gradeLevelId], references: [id])
  academicYear   AcademicYear  @relation(fields: [academicYearId], references: [id])
  teacher        Teacher?      @relation(fields: [teacherId], references: [id])
  enrollments    Enrollment[]
  schedules      Schedule[]

  @@unique([gradeLevelId, academicYearId])
}

model Student {
  id           String        @id @default(cuid())
  dni          String        @unique
  firstName    String
  lastName     String
  birthDate    DateTime
  gender       String
  address      String?
  photoUrl     String?
  status       StudentStatus @default(ACTIVO)
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt

  guardians    Guardian[]
  enrollments  Enrollment[]
}

model Guardian {
  id           String  @id @default(cuid())
  studentId    String
  dni          String
  firstName    String
  lastName     String
  relation     String
  phone        String
  email        String?
  address      String?
  isPrimary    Boolean @default(false)

  student      Student @relation(fields: [studentId], references: [id])
}

model Teacher {
  id          String    @id @default(cuid())
  dni         String    @unique
  firstName   String
  lastName    String
  email       String    @unique
  phone       String?
  photoUrl    String?
  specialty   String?
  active      Boolean   @default(true)
  createdAt   DateTime  @default(now())

  sections    Section[]
  schedules   Schedule[]
}

model Course {
  id           String     @id @default(cuid())
  name         String
  gradeLevelId String
  hoursPerWeek Int        @default(2)
  active       Boolean    @default(true)

  gradeLevel   GradeLevel   @relation(fields: [gradeLevelId], references: [id])
  schedules    Schedule[]
  gradeRecords GradeRecord[]

  @@unique([name, gradeLevelId])
}

model Schedule {
  id          String  @id @default(cuid())
  sectionId   String
  courseId    String
  teacherId   String
  dayOfWeek   Int
  startTime   String
  endTime     String

  section     Section @relation(fields: [sectionId], references: [id])
  course      Course  @relation(fields: [courseId], references: [id])
  teacher     Teacher @relation(fields: [teacherId], references: [id])
}

model Enrollment {
  id             String    @id @default(cuid())
  studentId      String
  sectionId      String
  academicYearId String
  enrollDate     DateTime  @default(now())
  active         Boolean   @default(true)
  notes          String?

  student        Student      @relation(fields: [studentId], references: [id])
  section        Section      @relation(fields: [sectionId], references: [id])
  academicYear   AcademicYear @relation(fields: [academicYearId], references: [id])

  gradeRecords     GradeRecord[]
  attendances      Attendance[]
  payments         Payment[]
  incidents        Incident[]
  disabilities     DisabilityRecord[]

  @@unique([studentId, academicYearId])
}

model GradeRecord {
  id           String      @id @default(cuid())
  enrollmentId String
  courseId     String
  period       GradePeriod
  score        Float?
  status       String?
  updatedAt    DateTime    @updatedAt

  enrollment   Enrollment @relation(fields: [enrollmentId], references: [id])
  course       Course     @relation(fields: [courseId], references: [id])

  @@unique([enrollmentId, courseId, period])
}

model Attendance {
  id              String           @id @default(cuid())
  enrollmentId    String
  date            DateTime
  status          AttendanceStatus
  justification   String?
  justifiedBy     String?
  createdAt       DateTime         @default(now())

  enrollment      Enrollment @relation(fields: [enrollmentId], references: [id])

  @@unique([enrollmentId, date])
}

model PaymentConcept {
  id          String      @id @default(cuid())
  name        String
  type        PaymentType
  amount      Float
  description String?
  active      Boolean     @default(true)

  payments    Payment[]
}

model Payment {
  id              String        @id @default(cuid())
  enrollmentId    String
  conceptId       String
  amount          Float
  dueDate         DateTime
  paidAt          DateTime?
  status          PaymentStatus @default(PENDIENTE)
  method          String?
  reference       String?
  notes           String?
  createdAt       DateTime      @default(now())

  enrollment      Enrollment     @relation(fields: [enrollmentId], references: [id])
  concept         PaymentConcept @relation(fields: [conceptId], references: [id])
}

model Incident {
  id           String           @id @default(cuid())
  enrollmentId String
  date         DateTime
  description  String
  action       String?
  severity     IncidentSeverity @default(LEVE)
  createdAt    DateTime         @default(now())

  enrollment   Enrollment @relation(fields: [enrollmentId], references: [id])
}

model DisabilityRecord {
  id           String           @id @default(cuid())
  enrollmentId String
  reason       DisabilityReason
  description  String?
  startDate    DateTime         @default(now())
  resolvedAt   DateTime?
  resolvedNote String?
  active       Boolean          @default(true)

  enrollment   Enrollment @relation(fields: [enrollmentId], references: [id])
}

model Announcement {
  id          String    @id @default(cuid())
  title       String
  body        String
  targetLevel Level?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

model CalendarEvent {
  id             String    @id @default(cuid())
  title          String
  description    String?
  date           DateTime
  endDate        DateTime?
  type           EventType
  academicYearId String
  allDay         Boolean   @default(true)

  academicYear   AcademicYear @relation(fields: [academicYearId], references: [id])
}
```

---

## 6. Lógica de Negocio Crítica

### 6.1 Estado del Estudiante (Semáforo)

El estado se recalcula automáticamente cada vez que se registran notas o asistencia.

| Estado           | Condición                                                               |
| ---------------- | ------------------------------------------------------------------------ |
| `ACTIVO`       | Estado normal. Sin alertas.                                              |
| `OBSERVADO`    | Promedio general < 11**O**asistencia entre 70%–85%                |
| `EN_RIESGO`    | Jalando 3+ cursos**O**asistencia entre 50%–70%                    |
| `INHABILITADO` | Faltas injustificadas > 30%**O**jalando más de la mitad de cursos |
| `RETIRADO`     | Retiro voluntario registrado manualmente                                 |

```typescript
// lib/utils/student-status.ts
export function calculateStudentStatus(
  attendancePercent: number,
  failingCourses: number,
  totalCourses: number,
  average: number
): StudentStatus {
  const failingRatio = failingCourses / totalCourses

  if (attendancePercent < 70 || failingRatio > 0.5) return 'INHABILITADO'
  if (attendancePercent < 85 || failingCourses >= 3 || average < 11) {
    if (attendancePercent < 70 || failingRatio > 0.5) return 'INHABILITADO'
    if (failingCourses >= 3 || attendancePercent < 70) return 'EN_RIESGO'
    return 'OBSERVADO'
  }
  return 'ACTIVO'
}
```

### 6.2 Cálculo de Nota Final

```
Nota Final = (P1 + P2 + P3 + P4) / 4
Nota mínima de aprobación: 11 (configurable en sistema)
```

### 6.3 Alertas de Pago

* **Por vencer** : `dueDate` entre hoy y los próximos 7 días y `status = PENDIENTE`
* **Vencido** : `dueDate < hoy` y `status = PENDIENTE` → se actualiza automáticamente a `VENCIDO`

### 6.4 Inhabilitación Automática vs Manual

* **Automática** : Se activa al guardar notas o asistencia si se cumplen las condiciones.
* **Manual** : El director puede inhabilitar o reactivar desde el perfil del estudiante con motivo obligatorio.

### 6.5 Periodo Académico Activo

Solo puede haber **un** `AcademicYear` con `active: true` a la vez. Al activar un año se desactivan los demás automáticamente.

---

## 7. Módulos y Rutas

### Resumen de módulos

| #  | Módulo              | Rutas | Prefijo                         |
| -- | -------------------- | ----- | ------------------------------- |
| 01 | 🔐 Autenticación    | 3     | `/login`                      |
| 02 | 📊 Dashboard         | 1     | `/dashboard`                  |
| 03 | 📋 Matrículas       | 6     | `/dashboard/matriculas`       |
| 04 | 👨‍🎓 Estudiantes   | 7     | `/dashboard/estudiantes`      |
| 05 | 👩‍🏫 Docentes      | 5     | `/dashboard/docentes`         |
| 06 | 📅 Cursos y Horarios | 6     | `/dashboard/cursos`           |
| 07 | 📝 Notas             | 5     | `/dashboard/notas`            |
| 08 | ✅ Asistencia        | 5     | `/dashboard/asistencia`       |
| 09 | 💰 Cobros y Pagos    | 7     | `/dashboard/pagos`            |
| 10 | 🚫 Inhabilitaciones  | 3     | `/dashboard/inhabilitaciones` |
| 11 | ⚠️ Incidencias     | 4     | `/dashboard/incidencias`      |
| 12 | 📄 Reportes PDF      | 5     | `/dashboard/reportes`         |
| 13 | 📢 Comunicados       | 3     | `/dashboard/comunicados`      |
| 14 | 🗓️ Calendario      | 2     | `/dashboard/calendario`       |
| 15 | ⚙️ Configuración  | 4     | `/dashboard/configuracion`    |

### Detalle por módulo

#### MOD-01 · Autenticación

| Ruta               | Página               | Descripción                                             |
| ------------------ | --------------------- | -------------------------------------------------------- |
| `/login`         | Login                 | Email + contraseña. Rate limiting. Sesión cifrada JWT. |
| `/login/recover` | Recuperar contraseña | Envío de token por correo via Resend.                   |
| `/login/reset`   | Restablecer password  | Formulario protegido por token temporal.                 |

#### MOD-02 · Dashboard Principal

| Ruta           | Página         | Descripción                                                                                                                                           |
| -------------- | --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `/dashboard` | Panel ejecutivo | KPIs: pagos vencidos del mes, estudiantes en riesgo, asistencia crítica, cobros pendientes, matrículas activas. Gráficas de tendencia con Recharts. |

#### MOD-03 · Matrículas

| Ruta                                     | Página          | Descripción                                                                 |
| ---------------------------------------- | ---------------- | ---------------------------------------------------------------------------- |
| `/dashboard/matriculas`                | Lista            | Tabla filtrable por año/nivel/grado. Búsqueda por nombre o DNI.            |
| `/dashboard/matriculas/nueva`          | Nueva matrícula | Wizard: datos del estudiante → sección → apoderado → pago de matrícula. |
| `/dashboard/matriculas/[id]`           | Detalle          | Expediente completo: datos, notas, pagos, asistencia, incidencias.           |
| `/dashboard/matriculas/[id]/editar`    | Editar           | Modificar sección, apoderado, notas, estado.                                |
| `/dashboard/matriculas/[id]/trasladar` | Traslado         | Cambio de sección con historial registrado.                                 |
| `/dashboard/matriculas/importar`       | Importar         | Carga masiva desde CSV/Excel.                                                |

#### MOD-04 · Estudiantes

| Ruta                                       | Página    | Descripción                                                |
| ------------------------------------------ | ---------- | ----------------------------------------------------------- |
| `/dashboard/estudiantes`                 | Directorio | Foto, nombre, DNI, nivel, estado (semáforo). Filtros.      |
| `/dashboard/estudiantes/nuevo`           | Nuevo      | Datos personales completos + foto.                          |
| `/dashboard/estudiantes/[id]`            | Perfil 360 | Todos los datos + historial de matrículas + estado actual. |
| `/dashboard/estudiantes/[id]/editar`     | Editar     | Datos personales, foto, apoderado, contactos.               |
| `/dashboard/estudiantes/[id]/historial`  | Historial  | Notas y asistencia de todos los años.                      |
| `/dashboard/estudiantes/[id]/documentos` | Documentos | Generar PDFs oficiales.                                     |
| `/dashboard/estudiantes/[id]/estado`     | Estado     | Cambiar estado con motivo obligatorio.                      |

#### MOD-05 · Docentes

| Ruta                                 | Página    | Descripción                                          |
| ------------------------------------ | ---------- | ----------------------------------------------------- |
| `/dashboard/docentes`              | Directorio | Foto, nombre, DNI, especialidad, secciones asignadas. |
| `/dashboard/docentes/nuevo`        | Nuevo      | Registro completo.                                    |
| `/dashboard/docentes/[id]`         | Perfil     | Datos + cursos + horario.                             |
| `/dashboard/docentes/[id]/editar`  | Editar     | Modificar datos y asignaciones.                       |
| `/dashboard/docentes/[id]/horario` | Horario    | Grilla semanal de cursos a su cargo.                  |

#### MOD-06 · Cursos y Horarios

| Ruta                                       | Página        | Descripción                                  |
| ------------------------------------------ | -------------- | --------------------------------------------- |
| `/dashboard/cursos`                      | Lista          | Por nivel. Nombre, horas, docente asignado.   |
| `/dashboard/cursos/nuevo`                | Nuevo          | Nivel, nombre, horas semanales.               |
| `/dashboard/cursos/[id]/editar`          | Editar         | Modificar y reasignar docente.                |
| `/dashboard/horarios`                    | Por sección   | Selector año/nivel/grado → grilla semanal.  |
| `/dashboard/horarios/[seccionId]/editar` | Editar horario | Asignar cursos a bloques. Validar conflictos. |
| `/dashboard/secciones`                   | Secciones      | Crear y configurar aulas por grado/año.      |

#### MOD-07 · Notas

| Ruta                                      | Página      | Descripción                                                  |
| ----------------------------------------- | ------------ | ------------------------------------------------------------- |
| `/dashboard/notas`                      | Por sección | Selector año→nivel→grado→curso→periodo. Grilla editable. |
| `/dashboard/notas/[matriculaId]`        | Por alumno   | Boleta de notas por periodos + promedio final.                |
| `/dashboard/notas/[matriculaId]/editar` | Editar       | Ingresar/corregir notas con historial de cambios.             |
| `/dashboard/notas/reporte`              | Reporte      | Promedio, aprobados/desaprobados, ranking. Exportar.          |
| `/dashboard/notas/riesgo`               | En riesgo    | Alumnos jalando 2+ cursos con semáforo visual.               |

#### MOD-08 · Asistencia

| Ruta                                    | Página          | Descripción                                                                    |
| --------------------------------------- | ---------------- | ------------------------------------------------------------------------------- |
| `/dashboard/asistencia`               | Tomar asistencia | Sección + fecha. Lista con toggles: Presente/Tardanza/Falta. Guardado en lote. |
| `/dashboard/asistencia/justificar`    | Justificar       | Tipo (médico/familiar/otro) + documento adjunto.                               |
| `/dashboard/asistencia/[matriculaId]` | Historial        | Calendario visual con días y estados.                                          |
| `/dashboard/asistencia/reporte`       | Reporte          | % por sección y alumno. Ranking de inasistencias.                              |
| `/dashboard/asistencia/critica`       | Crítica         | Alumnos con >20% de faltas injustificadas.                                      |

#### MOD-09 · Cobros y Pagos

| Ruta                               | Página            | Descripción                                                  |
| ---------------------------------- | ------------------ | ------------------------------------------------------------- |
| `/dashboard/pagos`               | Panel              | Resumen mensual: cobrado, pendiente, vencido.                 |
| `/dashboard/pagos/registrar`     | Registrar          | Buscar alumno → concepto → monto → método. Genera recibo. |
| `/dashboard/pagos/[matriculaId]` | Por alumno         | Historial completo de pagos + estado.                         |
| `/dashboard/pagos/vencidos`      | Vencidos           | Lista ordenada por días de retraso.                          |
| `/dashboard/pagos/por-vencer`    | Por vencer         | Vencen en los próximos 7 días.                              |
| `/dashboard/pagos/conceptos`     | Conceptos          | Configurar: Mensualidad, Matrícula, Examen, Otros.           |
| `/dashboard/pagos/reporte`       | Reporte financiero | Ingresos por mes/año. Gráfica de morosidad.                 |

#### MOD-10 · Inhabilitaciones

| Ruta                                          | Página  | Descripción                                  |
| --------------------------------------------- | -------- | --------------------------------------------- |
| `/dashboard/inhabilitaciones`               | Lista    | Alumnos inhabilitados: razón, fecha, estado. |
| `/dashboard/inhabilitaciones/nueva`         | Nueva    | Alumno + motivo + descripción.               |
| `/dashboard/inhabilitaciones/[id]/resolver` | Resolver | Levantar con nota de resolución.             |

#### MOD-11 · Incidencias

| Ruta                                            | Página    | Descripción                                         |
| ----------------------------------------------- | ---------- | ---------------------------------------------------- |
| `/dashboard/incidencias`                      | Lista      | Filtros por alumno/sección/tipo/fecha.              |
| `/dashboard/incidencias/nueva`                | Nueva      | Alumno + fecha + descripción + acción + severidad. |
| `/dashboard/incidencias/[id]`                 | Detalle    | Vista completa con seguimiento.                      |
| `/dashboard/incidencias/alumno/[matriculaId]` | Por alumno | Historial completo del alumno.                       |

#### MOD-12 · Reportes y PDF

| Ruta                                             | Página        | Descripción                                  |
| ------------------------------------------------ | -------------- | --------------------------------------------- |
| `/dashboard/reportes`                          | Centro         | Hub de todos los reportes disponibles.        |
| `/dashboard/reportes/libreta/[matriculaId]`    | Libreta PDF    | Boleta de notas oficial con logo del colegio. |
| `/dashboard/reportes/constancia/[matriculaId]` | Constancia PDF | Constancia de matrícula vigente.             |
| `/dashboard/reportes/asistencia/[seccionId]`   | Asistencia PDF | Planilla mensual del aula.                    |
| `/dashboard/reportes/financiero`               | Financiero     | Consolidado exportable a Excel/PDF.           |

#### MOD-13 · Comunicados

| Ruta                             | Página | Descripción                                         |
| -------------------------------- | ------- | ---------------------------------------------------- |
| `/dashboard/comunicados`       | Lista   | Filtro por nivel/fecha.                              |
| `/dashboard/comunicados/nuevo` | Nuevo   | Destinatario (nivel/grado/todos) + título + cuerpo. |
| `/dashboard/comunicados/[id]`  | Ver     | Detalle con opción de impresión/PDF.               |

#### MOD-14 · Calendario Académico

| Ruta                            | Página      | Descripción                                                                       |
| ------------------------------- | ------------ | ---------------------------------------------------------------------------------- |
| `/dashboard/calendario`       | Calendario   | Vista mensual de eventos: exámenes, feriados, reuniones. Se cruza con asistencia. |
| `/dashboard/calendario/nuevo` | Nuevo evento | Título, fecha, tipo, descripción, si afecta asistencia.                          |

#### MOD-15 · Configuración

| Ruta                                      | Página          | Descripción                                                |
| ----------------------------------------- | ---------------- | ----------------------------------------------------------- |
| `/dashboard/configuracion`              | General          | Nombre del colegio, logo, dirección, correo institucional. |
| `/dashboard/configuracion/año-lectivo` | Año lectivo     | Crear/cerrar año. Definir periodos. Migrar secciones.      |
| `/dashboard/configuracion/niveles`      | Niveles y grados | Gestionar estructura académica.                            |
| `/dashboard/configuracion/reglas`       | Reglas           | Nota mínima, % máximo de faltas, periodos activos.        |

---

## 8. API Routes y Server Actions

Usar **Server Actions** para la mayoría de operaciones. Solo crear API Routes (`/api/...`) para:

* Webhooks externos
* Endpoints consumidos por clientes externos
* Generación de archivos (PDF/Excel) que requieran streaming

### Convención de retorno en Server Actions

```typescript
type ActionResult<T> = 
  | { success: true; data: T }
  | { success: false; error: string | ZodError }
```

### Server Actions por módulo

```
lib/actions/
├── student.actions.ts        → createStudent, updateStudent, changeStudentStatus
├── enrollment.actions.ts     → createEnrollment, updateEnrollment, transferSection
├── teacher.actions.ts        → createTeacher, updateTeacher, deactivateTeacher
├── grade.actions.ts          → saveGrades, calculateFinalGrade, getStudentsAtRisk
├── attendance.actions.ts     → saveAttendance, justifyAbsence, getAttendanceStats
├── payment.actions.ts        → registerPayment, updateOverduePayments, getPaymentSummary
├── incident.actions.ts       → createIncident, updateIncident
├── disability.actions.ts     → createDisability, resolveDisability
├── schedule.actions.ts       → saveSchedule, validateConflicts
└── report.actions.ts         → generatePDF, exportExcel
```

---

## 9. Autenticación y Seguridad

### NextAuth v5 — Credentials Provider

```typescript
// lib/auth.ts
import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from './prisma'
import bcrypt from 'bcryptjs'

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Credentials({
      async authorize(credentials) {
        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string }
        })
        if (!user) return null
        const valid = await bcrypt.compare(credentials.password as string, user.passwordHash)
        if (!valid) return null
        return user
      }
    })
  ],
  session: { strategy: 'jwt' },
  pages: { signIn: '/login' }
})
```

### Middleware de protección de rutas

```typescript
// src/middleware.ts
import { auth } from '@/lib/auth'

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const isDashboard = req.nextUrl.pathname.startsWith('/dashboard')
  if (isDashboard && !isLoggedIn) {
    return Response.redirect(new URL('/login', req.nextUrl))
  }
})

export const config = {
  matcher: ['/dashboard/:path*']
}
```

### Variables de entorno requeridas

```bash
# .env.local
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."         # Para Prisma + Supabase
AUTH_SECRET="..."                      # NextAuth secret
NEXTAUTH_URL="http://localhost:3000"
SUPABASE_URL="https://xxx.supabase.co"
SUPABASE_ANON_KEY="..."
SUPABASE_SERVICE_ROLE_KEY="..."
RESEND_API_KEY="re_..."
```

---

## 10. Plan de Sprints

> **Regla fundamental:** Completar y validar cada sprint antes de avanzar al siguiente. No saltar adelante.

---

### FASE 1 — BACKEND

#### SPRINT B-01 · Setup y Base del Proyecto

```
[ ] Inicializar Next.js 14 con TypeScript y App Router
[ ] Configurar Tailwind CSS + shadcn/ui
[ ] Instalar y configurar Prisma con Supabase
[ ] Ejecutar prisma db push con el schema completo
[ ] Configurar NextAuth v5 con Credentials provider
[ ] Configurar middleware de protección de rutas
[ ] Crear seed.ts con datos iniciales (usuario admin, año lectivo, niveles, grados)
[ ] Crear lib/prisma.ts, lib/auth.ts, lib/supabase.ts
[ ] Verificar: login funcional, rutas protegidas, DB conectada
```

#### SPRINT B-02 · Estudiantes y Apoderados

```
[ ] Schema Zod para Student y Guardian
[ ] Server Actions: createStudent, updateStudent, getStudentById, searchStudents
[ ] Server Action: changeStudentStatus (con validación de motivo)
[ ] Lógica: calculateStudentStatus (semáforo automático)
[ ] Upload de foto a Supabase Storage
[ ] Tests manuales de cada action
```

#### SPRINT B-03 · Docentes y Estructura Académica

```
[ ] Schema Zod para Teacher, Course, Section, Schedule
[ ] Server Actions: createTeacher, updateTeacher, deactivateTeacher
[ ] Server Actions: createCourse, updateCourse
[ ] Server Actions: createSection, assignTeacherToSection
[ ] Server Actions: saveSchedule, validateScheduleConflicts
[ ] Server Action: getAcademicStructure (año → niveles → grados → secciones)
```

#### SPRINT B-04 · Matrículas

```
[ ] Schema Zod para Enrollment
[ ] Server Actions: createEnrollment, updateEnrollment, transferSection
[ ] Server Action: getEnrollmentById (con todos los datos relacionados)
[ ] Server Action: getEnrollmentsBySection
[ ] Validación: un estudiante no puede tener 2 matrículas en el mismo año
[ ] Server Action: importEnrollments (carga masiva desde array)
```

#### SPRINT B-05 · Notas y Rendimiento

```
[ ] Schema Zod para GradeRecord
[ ] Server Actions: saveGrades (guardado en lote por sección/curso/periodo)
[ ] Server Action: calculateFinalGrade (promedio de periodos)
[ ] Server Action: getStudentGrades (boleta completa)
[ ] Server Action: getStudentsAtRisk (jalando 2+ cursos)
[ ] Server Action: getSectionGradeReport (estadísticas por sección)
[ ] Trigger: recalcular StudentStatus al guardar notas
```

#### SPRINT B-06 · Asistencia

```
[ ] Schema Zod para Attendance
[ ] Server Actions: saveAttendance (guardado en lote)
[ ] Server Action: justifyAbsence
[ ] Server Action: getAttendanceByStudent (historial completo)
[ ] Server Action: getAttendanceStats (% por alumno y sección)
[ ] Server Action: getCriticalAttendance (>20% faltas)
[ ] Trigger: recalcular StudentStatus al guardar asistencia
```

#### SPRINT B-07 · Cobros y Pagos

```
[ ] Schema Zod para Payment y PaymentConcept
[ ] Server Actions: createPaymentConcept, updatePaymentConcept
[ ] Server Action: generateMonthlyPayments (generar cuotas para todos los alumnos)
[ ] Server Action: registerPayment (marcar como pagado)
[ ] Server Action: updateOverduePayments (cron: PENDIENTE → VENCIDO)
[ ] Server Action: getPaymentsByEnrollment
[ ] Server Action: getOverduePayments, getUpcomingPayments
[ ] Server Action: getFinancialSummary (totales por mes)
```

#### SPRINT B-08 · Incidencias, Inhabilitaciones y Comunicados

```
[ ] Server Actions: createIncident, updateIncident, getIncidentsByEnrollment
[ ] Server Actions: createDisability, resolveDisability, getActiveDisabilities
[ ] Server Actions: createAnnouncement, getAnnouncements
[ ] Server Actions: createCalendarEvent, getEventsByMonth
```

#### SPRINT B-09 · Generación de PDFs y Reportes

```
[ ] Configurar @react-pdf/renderer
[ ] Template PDF: Libreta de notas (con logo TerraNova Academy)
[ ] Template PDF: Constancia de matrícula
[ ] Template PDF: Planilla de asistencia mensual
[ ] Template PDF: Recibo de pago
[ ] Server Action: exportGradesToExcel (usando xlsx)
[ ] Server Action: exportFinancialReport (Excel)
```

---

### FASE 2 — FRONTEND

#### SPRINT F-01 · Layout Base y Autenticación

```
[ ] Página de login con React Hook Form + Zod
[ ] Layout del dashboard: sidebar, header, area de contenido
[ ] Sidebar con navegación a todos los módulos
[ ] Responsive: sidebar colapsable en móvil
[ ] Componentes shared: PageHeader, StatusBadge, LoadingSpinner, ConfirmDialog
[ ] Manejo de sesión: mostrar nombre del director
```

#### SPRINT F-02 · Dashboard Principal

```
[ ] KPI Cards: pagos vencidos, alumnos en riesgo, asistencia crítica, matrículas activas
[ ] Gráfica de ingresos mensuales (Recharts)
[ ] Gráfica de asistencia promedio por nivel
[ ] Lista de alertas prioritarias del día
[ ] Accesos rápidos a módulos frecuentes
```

#### SPRINT F-03 · Estudiantes y Matrículas

```
[ ] Página: directorio de estudiantes con DataTable, filtros y semáforo
[ ] Página: perfil 360 del estudiante (tabs: datos, notas, pagos, asistencia, incidencias)
[ ] Formulario: nuevo estudiante (con upload de foto)
[ ] Wizard: nueva matrícula (multi-step)
[ ] Página: lista de matrículas con filtros
```

#### SPRINT F-04 · Docentes, Cursos y Horarios

```
[ ] Directorio de docentes con perfil
[ ] Formulario: nuevo/editar docente
[ ] Lista y formulario de cursos por nivel
[ ] Vista de horario semanal (grilla interactiva)
[ ] Editor de horario por sección
```

#### SPRINT F-05 · Notas y Asistencia

```
[ ] Grilla de notas editable por sección/curso/periodo
[ ] Boleta de notas del alumno con promedios
[ ] Vista de alumnos en riesgo académico
[ ] Formulario de toma de asistencia (lista con toggles)
[ ] Calendario visual de asistencia por alumno
[ ] Formulario de justificación de falta
```

#### SPRINT F-06 · Pagos

```
[ ] Panel de pagos con resumen financiero
[ ] Formulario: registrar pago con búsqueda de alumno
[ ] Lista de pagos vencidos y por vencer (con alertas visuales)
[ ] Historial de pagos por alumno
[ ] Gestión de conceptos de cobro
```

#### SPRINT F-07 · Inhabilitaciones, Incidencias y Comunicados

```
[ ] Lista y formulario de inhabilitaciones
[ ] Flujo de resolución de inhabilitación
[ ] Libro de incidencias con formulario
[ ] Lista y formulario de comunicados
[ ] Calendario académico con vista mensual
```

#### SPRINT F-08 · Reportes y PDFs

```
[ ] Centro de reportes: hub visual
[ ] Botones de generación PDF en cada módulo relevante
[ ] Preview de PDF antes de descargar
[ ] Exportación a Excel desde reportes de notas y financiero
[ ] Página de configuración del sistema
```

---

*Documento generado para TerraNova Academy — Sistema de Gestión Escolar*
*Mantener actualizado ante cualquier cambio de arquitectura o requerimientos*
