# TerraNova Academy — Análisis Completo del Frontend

Documento de referencia para desarrolladores nuevos. No tocar archivos — solo análisis.

> Última actualización: 2026-03-29

---

## 1. Tecnologías y Stack

### Framework y Lenguaje

| Tecnología            | Versión | Uso                                 |
| ---------------------- | -------- | ----------------------------------- |
| **Next.js**      | 14.2.35  | Framework principal (App Router)    |
| **React**        | 18       | UI Library                          |
| **TypeScript**   | ^5       | Lenguaje — todo `.tsx` y `.ts` |
| **Tailwind CSS** | ^3.4.1   | Sistema de estilos (utility-first)  |

### Librerías de UI

| Librería                     | Cómo se usa                                                                                            |
| ----------------------------- | ------------------------------------------------------------------------------------------------------- |
| **shadcn/ui**           | Componentes base en `src/components/ui/` (17 componentes)                                             |
| **Radix UI**            | Primitivos de shadcn (AlertDialog, Avatar, Dialog, Label, Select, Separator, Slot, Switch, Tabs, Toast) |
| **Lucide React**        | Iconos SVG (usado en sidebar, headers, forms)                                                           |
| **Recharts**            | Gráficas en el dashboard (RevenueChart, AttendanceChart)                                               |
| **@react-pdf/renderer** | Generación de PDFs en el cliente (`src/components/pdf/`)                                             |

### Formularios y Validación

| Librería                     | Uso                                                 |
| ----------------------------- | --------------------------------------------------- |
| **react-hook-form**     | Manejo de formularios en todos los módulos         |
| **@hookform/resolvers** | Conector entre react-hook-form y Zod                |
| **Zod**                 | Schemas de validación (compartidos con el backend) |

### Notificaciones y Feedback

| Librería                  | Uso                                                   |
| -------------------------- | ----------------------------------------------------- |
| **Sonner**           | Toasts de feedback (éxito/error de Server Actions)   |
| `src/hooks/use-toast.ts` | Hook personalizado para el sistema de Toast de shadcn |

### Autenticación

| Librería           | Versión                          |
| ------------------- | --------------------------------- |
| **next-auth** | ^5.0.0-beta (v5 App Router style) |
| **bcryptjs**  | Hash de contraseñas en el server |

---

## 2. Arquitectura y Estructura de Carpetas

### Árbol completo de `src/app/`

```
src/app/
├── layout.tsx                    ← Root layout (html, body, fuentes Geist)
├── page.tsx                      ← Redirige a /dashboard
├── globals.css                   ← Estilos globales + variables CSS
├── icon.png                      ← Favicon de la app
├── fonts/
│   ├── GeistVF.woff              ← Fuente principal
│   └── GeistMonoVF.woff          ← Fuente monoespaciada
│
├── (auth)/                       ← Route Group: rutas públicas sin layout del dashboard
│   └── login/
│       └── page.tsx              ← Página de login
│
├── (dashboard)/                  ← Route Group: rutas protegidas con layout del dashboard
│   ├── layout.tsx                ← Layout compartido: Sidebar + Header + auth guard
│   ├── loading.tsx               ← Loading state del grupo (React Suspense boundary)
│   ├── _components/              ← Componentes privados del layout (no crean rutas)
│   │   ├── Sidebar.tsx           ← Navegación lateral (Client Component)
│   │   ├── Header.tsx            ← Barra superior con session user (Client Component)
│   │   └── DashboardProvider.tsx ← Context de navegación (Client Component)
│   │
│   └── dashboard/                ← Rutas del dashboard
│       ├── page.tsx              ← /dashboard — Panel principal (Server Component)
│       ├── not-found.tsx         ← 404 personalizado
│       ├── asistencia/           ← /dashboard/asistencia
│       ├── calendar/             ← /dashboard/calendar
│       ├── comunicados/          ← /dashboard/comunicados
│       ├── configuracion/        ← /dashboard/configuracion
│       ├── cursos/               ← /dashboard/cursos
│       ├── docentes/             ← /dashboard/docentes
│       ├── estudiantes/          ← /dashboard/estudiantes
│       ├── horarios/             ← /dashboard/horarios
│       ├── incidencias/          ← /dashboard/incidencias
│       ├── inhabilitaciones/     ← /dashboard/inhabilitaciones
│       ├── matriculas/           ← /dashboard/matriculas
│       ├── notas/                ← /dashboard/notas
│       ├── pagos/                ← /dashboard/pagos
│       ├── reportes/             ← /dashboard/reportes
│       ├── reports/              ← ⚠️ Duplicado — ver sección deuda técnica
│       └── test-backend/         ← 🗑️ Ruta de testing, eliminar
│
└── api/
    ├── auth/[...nextauth]/       ← Handler de NextAuth (catch-all)
    ├── pdf/route.tsx             ← Generación de PDFs (11KB, @react-pdf/renderer)
    └── seed/route.ts             ← Seed protegido con NODE_ENV + SEED_TOKEN
```

### Rutas disponibles (15 módulos + login)

| URL                             | Título           | Tipo de página           |
| ------------------------------- | ----------------- | ------------------------- |
| `/login`                      | Inicio de sesión | Client Component          |
| `/dashboard`                  | Panel de Control  | Server Component          |
| `/dashboard/matriculas`       | Matrículas       | Server Component + Client |
| `/dashboard/estudiantes`      | Estudiantes       | Server Component + Client |
| `/dashboard/docentes`         | Docentes          | Server Component + Client |
| `/dashboard/cursos`           | Cursos            | Server Component + Client |
| `/dashboard/horarios`         | Horarios          | Server Component + Client |
| `/dashboard/notas`            | Calificaciones    | Server Component + Client |
| `/dashboard/asistencia`       | Asistencia        | Server Component + Client |
| `/dashboard/pagos`            | Finanzas          | Server Component + Client |
| `/dashboard/calendar`         | Calendario        | Server Component + Client |
| `/dashboard/comunicados`      | Comunicados       | Server Component + Client |
| `/dashboard/inhabilitaciones` | Inhabilitaciones  | Server Component + Client |
| `/dashboard/incidencias`      | Incidencias       | Server Component + Client |
| `/dashboard/reportes`         | Reportes          | Server Component + Client |
| `/dashboard/configuracion`    | Configuración    | Server Component          |

### Anidamiento de layouts

```
RootLayout (app/layout.tsx)
  └── DashboardLayout ((dashboard)/layout.tsx)  ← auth guard + Sidebar + Header
        └── DashboardProvider (Context)
              └── MainContentWrapper (loading state)
                    └── <page.tsx> de cada módulo
```

---

## 3. Separación Client / Server Components

### Patrón general seguido

El proyecto sigue el patrón **"Server shell + Client leaf"**:

```
app/dashboard/notas/page.tsx         ← SERVER: fetch datos + pasa como props
  └── GradeGridClient.tsx            ← CLIENT: interactividad (formulario, clicks)
```

Las páginas (`page.tsx`) son **Server Components** que:

1. Llaman Server Actions para obtener datos iniciales
2. Pasan los datos como props a un Client Component hijo
3. Usan `export const dynamic = "force-dynamic"` cuando los datos cambian frecuentemente

### Mapa Client/Server por componente

| Componente                                       | Tipo             | Razón                                      |
| ------------------------------------------------ | ---------------- | ------------------------------------------- |
| Todas las `page.tsx` del dashboard             | **Server** | Data fetching inicial, sin estado           |
| `DashboardLayout`                              | **Server** | Verifica sesión con `await auth()`       |
| `Sidebar.tsx`                                  | **Client** | `usePathname()`, `useState` para móvil |
| `Header.tsx`                                   | **Client** | `usePathname()`, signOut action           |
| `DashboardProvider.tsx`                        | **Client** | Context,`useState`, `useEffect`         |
| `GradeGridClient.tsx`                          | **Client** | Formulario interactivo + Server Actions     |
| `AttendanceClient.tsx`                         | **Client** | Estado de asistencia por alumno + fecha     |
| `RegisterPaymentClient.tsx`                    | **Client** | Wizard de búsqueda + registro de pago      |
| `EnrollmentWizard.tsx`                         | **Client** | Wizard multi-step                           |
| `StudentProfileClient.tsx`                     | **Client** | Tabbed view con estado local                |
| `ReportesClient.tsx`                           | **Client** | Filtros + generación de PDFs               |
| `LoginPage`                                    | **Client** | react-hook-form, useTransition              |
| Todos los componentes de `src/components/ui/`  | **Client** | shadcn/ui requiere interactividad           |
| Todos los componentes de `src/components/pdf/` | Mixto            | Renderizados en API route `/api/pdf`      |

### Posibles mejoras

- `dashboard/page.tsx` hace 5 awaits secuenciales en lugar de `Promise.all` — aunque el comentario menciona evitar saturar el pool, con el `@prisma/adapter-pg` esto podría paralelizarse de forma segura con `Promise.all`
- `KPICard.tsx`, `AlertList.tsx`, `QuickAccess.tsx`, `AttendanceChart.tsx`, `RevenueChart.tsx` — podrían ser Server Components (no tienen estado ni eventos), pero son Client para usar `recharts` que requiere DOM

---

## 4. Inventario de Componentes

### `src/components/ui/` — 17 componentes shadcn/ui

Todos son Client Components de bajo nivel reutilizables. Son wrappers de Radix UI con estilos de Tailwind via `class-variance-authority`.

`alert-dialog` · `avatar` · `badge` · `button` · `card` · `dialog` · `form` · `input` · `label` · `select` · `separator` · `switch` · `table` · `tabs` · `textarea` · `toast` · `toaster`

### `src/components/shared/` — 7 componentes reutilizables

| Componente             | Client/Server | Qué hace                                              |
| ---------------------- | ------------- | ------------------------------------------------------ |
| `PageHeader.tsx`     | Server        | Título + descripción de página                      |
| `DataTable.tsx`      | Client        | Tabla con paginación y búsqueda                      |
| `StatusBadge.tsx`    | Server        | Badge de color según status (ACTIVO, EN_RIESGO, etc.) |
| `StudentAvatar.tsx`  | Server        | Avatar con iniciales o foto del alumno                 |
| `ConfirmDialog.tsx`  | Client        | Modal de confirmación genérico (con AlertDialog)     |
| `EmptyState.tsx`     | Server        | Estado vacío con ícono y CTA                         |
| `LoadingSpinner.tsx` | Client        | Spinner de carga con texto                             |

### `src/components/modules/` — por dominio

#### Dashboard (5 componentes)

| Componente              | Client | Qué hace                                          |
| ----------------------- | ------ | -------------------------------------------------- |
| `KPICard.tsx`         | Client | Tarjeta de métrica con tendencia y color          |
| `AlertList.tsx`       | Client | Lista de alertas prioritarias mixtas               |
| `RevenueChart.tsx`    | Client | Gráfica de barras de ingresos (Recharts)          |
| `AttendanceChart.tsx` | Client | Gráfica de línea de asistencia semana (Recharts) |
| `QuickAccess.tsx`     | Client | Atajos a módulos frecuentes                       |

#### Grades / Notas (2 componentes)

| Componente                | Client | Qué hace                                                     | Server Actions                         |
| ------------------------- | ------ | ------------------------------------------------------------- | -------------------------------------- |
| `GradeGridClient.tsx`   | ✅     | Grilla de ingreso de notas por sección/curso/periodo. 14.9KB | `getGradesBySection`, `saveGrades` |
| `StudentReportCard.tsx` | ✅     | Boleta de calificaciones del alumno (todos los cursos)        | `getStudentGrades`                   |

#### Attendance / Asistencia (2 componentes)

| Componente                        | Client | Qué hace                                                                                                       | Server Actions                                                            |
| --------------------------------- | ------ | --------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| `AttendanceClient.tsx`          | ✅     | **Más grande del módulo (25KB)**. Selección de sección/fecha, lista de alumnos, marcado de asistencia | `getAttendanceBySection`, `saveAttendance`, `getCriticalAttendance` |
| `StudentAttendanceCalendar.tsx` | ✅     | Calendario visual del historial de asistencia de un alumno (14.6KB)                                             | `getAttendanceByStudent`, `getAttendanceStats`                        |

#### Payments / Pagos (5 componentes)

| Componente                      | Client | Qué hace                                                                                              | Server Actions                                                                   |
| ------------------------------- | ------ | ------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------- |
| `PaymentsDashboardClient.tsx` | ✅     | Stats del mes: pagado/pendiente/vencido, últimos pagos (6.7KB)                                        | `getPaymentDashboardStats`                                                     |
| `RegisterPaymentClient.tsx`   | ✅     | **Más grande del dominio (22KB)**. Búsqueda de alumno → pagos pendientes → registro de cobro | `searchStudentsForPayment`, `getStudentPendingPayments`, `registerPayment` |
| `OverduePaymentsClient.tsx`   | ✅     | Lista de pagos vencidos con acciones (5.2KB)                                                           | `getOverduePayments`, `updateOverduePayments`                                |
| `StudentPaymentHistory.tsx`   | ✅     | Historial de pagos de un alumno + modal de detalle                                                     | `getPaymentsByEnrollment`                                                      |
| `ReceiptModal.tsx`            | ✅     | Modal para ver/descargar recibo en PDF                                                                 | API `/api/pdf`                                                                 |

#### Enrollments / Matrículas (3 componentes)

| Componente                      | Client | Qué hace                                                     | Server Actions                                                     |
| ------------------------------- | ------ | ------------------------------------------------------------- | ------------------------------------------------------------------ |
| `EnrollmentsClient.tsx`       | ✅     | Lista paginada con filtros de matrículas (6.5KB)             | `getEnrollments`                                                 |
| `EnrollmentWizard.tsx`        | ✅     | Wizard multi-step: alumno → sección → confirmación (14KB) | `createEnrollment`, `getAcademicStructure`                     |
| `EnrollmentDetailsClient.tsx` | ✅     | Detalle de matrícula + acciones (transferencia, retiro)      | `getEnrollmentById`, `transferSection`, `withdrawEnrollment` |

#### Students / Estudiantes (3 componentes)

| Componente                   | Client | Qué hace                                                                                                                         | Server Actions                            |
| ---------------------------- | ------ | --------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| `StudentsClient.tsx`       | ✅     | Lista con filtros (search, nivel, status)                                                                                         | `getStudents`                           |
| `StudentProfileClient.tsx` | ✅     | **Componente más grande del proyecto (32KB)**. Vista de tabs: Info, Notas, Asistencia, Pagos, Incidentes, Inhabilitaciones | `getStudentById` + acciones de cada tab |
| `StudentForm.tsx`          | ✅     | Formulario de creación/edición de alumno con apoderado (16KB)                                                                   | `createStudent`, `updateStudent`      |

#### Schedules / Horarios (3 componentes)

| Componente                  | Client | Qué hace                                      |
| --------------------------- | ------ | ---------------------------------------------- |
| `SchedulesListClient.tsx` | ✅     | Lista de secciones seleccionable               |
| `ScheduleGrid.tsx`        | ✅     | Grilla de horario (lunes-sábado × horas)     |
| `ScheduleCell.tsx`        | ✅     | Celda de horario con curso/docente — editable |

#### Otros módulos

| Módulo            | Componentes principales                                  | Tamaño |
| ------------------ | -------------------------------------------------------- | ------- |
| `reports/`       | `ReportesClient.tsx` — filtros + exportar Excel/PDF   | 17KB    |
| `disabilities/`  | `DisabilityClient` — inhabilitaciones activas + modal | —      |
| `incidents/`     | `IncidentClient` — CRUD de incidentes                 | —      |
| `calendar/`      | `CalendarClient` — calendario de eventos académicos  | —      |
| `announcements/` | `AnnouncementModal`                                    | —      |
| `configuracion/` | `ConfiguracionClient` — gestión año académico      | —      |
| `courses/`       | CRUD de cursos por grado                                 | —      |

### `src/components/pdf/` — 11 templates PDF

Componentes de `@react-pdf/renderer` usados desde la API route `/api/pdf`:

`GradeReportPDF` · `AttendanceSheetPDF` · `StudentAttendancePDF` · `PaymentReceiptPDF` · `EnrollmentCertificatePDF` · `CommunicationPDF` · `IncidentReportPDF` · `StudentInfoPDF` · `StudentIncidentsPDF` · `StudentDisabilitiesPDF` · `Footer`

---

## 5. Manejo de Estado

### Estado global: Context único

Solo existe **un Context** en toda la aplicación: `DashboardContext` en `DashboardProvider.tsx`.

```typescript
// Solo expone:
{ isNavigating: boolean, setIsNavigating: (v: boolean) => void }
```

Sirve para mostrar un `LoadingSpinner` global mientras Next.js navega entre rutas. Se activa desde el click en `Sidebar.tsx` y se resetea automáticamente cuando `pathname` o `searchParams` cambian (`useEffect`).

**No hay Zustand, Redux, Jotai ni ningún otro estado global.** Toda la data viene de Server Actions (vía Server Components) o de re-fetches desde Client Components usando `startTransition`.

### Patrón de comunicación entre componentes

```
Server Component (page.tsx)
  ↓ props iniciales
Client Component (XyzClient.tsx)
  ↓ user action → startTransition
Server Action (xyz.actions.ts)
  ↓ revalidatePath / retorno { success, data }
React re-render (data fresca del servidor)
```

No hay prop drilling profundo — cada módulo tiene un Client Component raíz que recibe los datos iniciales como prop y tiene estado local para filtros/formularios.

### Estado local en componentes

Cada Client Component maneja su propio estado con `useState` y `useTransition`:

- `isLoading` / `isPending` para el botón de submit
- Filtros de búsqueda (search, page, level, etc.)
- Datos seleccionados (sección activa, alumno seleccionado)
- Modales abiertos/cerrados

---

## 6. Autenticación y Middleware

### Flujo completo de autenticación

```
1. Usuario accede a /dashboard/* sin sesión
2. middleware.ts (Edge Runtime) → verifica JWT via NextAuth
3. Sin sesión → redirect a /login
4. LoginPage → react-hook-form + Zod (validación frontend)
5. Submit → loginAction() (Server Action) → NextAuth signIn("credentials")
6. NextAuth → busca User en DB → bcrypt.compare()
7. JWT creado con { sub, role } → cookie segura
8. Redirect automático a /dashboard
9. DashboardLayout (Server) → doble verificación con await auth()
```

### `auth.config.ts` vs `auth.ts` — el split de Edge

NextAuth v5 requiere separar la configuración en dos archivos:

| Archivo            | Dónde corre                        | Qué contiene                                                           |
| ------------------ | ----------------------------------- | ----------------------------------------------------------------------- |
| `auth.config.ts` | **Edge Runtime** (middleware) | JWT + session callbacks, sin imports pesados (sin Prisma, sin bcrypt)   |
| `auth.ts`        | **Node.js Runtime**           | CredentialsProvider con `prisma.user.findUnique` + `bcrypt.compare` |

Esta separación es **necesaria** porque el middleware corre en Edge y no puede importar módulos de Node.js.

### Rutas protegidas vs públicas

| Ruta             | Estado                                 |
| ---------------- | -------------------------------------- |
| `/dashboard/*` | 🔒 Protegida — middleware + layout    |
| `/login`       | 🌐 Pública                            |
| `/api/auth/*`  | 🌐 Pública (NextAuth handler)         |
| `/api/pdf`     | 🌐 Pública ⚠️ — sin autenticación |
| `/api/seed`    | 🔒 Protegida por NODE_ENV + SEED_TOKEN |

> [!WARNING]
> `/api/pdf/route.tsx` no tiene guard de autenticación. Cualquiera puede llamar al endpoint de generación de PDFs desde internet sin autenticarse.

---

## 7. Formularios y Validación

### Patrón estándar en el proyecto

```typescript
// 1. Import del schema Zod del backend (reutilizado)
import { EnrollmentSchema } from "@/lib/validations/enrollment.schema";

// 2. react-hook-form + zodResolver
const form = useForm<z.infer<typeof EnrollmentSchema>>({
  resolver: zodResolver(EnrollmentSchema),
  defaultValues: { ... },
});

// 3. Submit via startTransition
const onSubmit = (values: z.infer<typeof EnrollmentSchema>) => {
  startTransition(async () => {
    const result = await createEnrollment(values);
    if (result.success) toast.success("...");
    else toast.error(result.error);
  });
};
```

### Dónde se valida qué

| Capa                        | Validación                                    | Herramienta           |
| --------------------------- | ---------------------------------------------- | --------------------- |
| Frontend (antes del submit) | Formato de campos, campos requeridos           | Zod + react-hook-form |
| Backend (Server Action)     | Mismas reglas + reglas de negocio adicionales  | Zod `.safeParse()`  |
| Base de datos               | Constraints únicos (DNI, email), FK integrity | Prisma + PostgreSQL   |

**No hay validación duplicada** — los schemas Zod viven en `src/lib/validations/` y son importados tanto por los Client Components como por las Server Actions. La validación del frontend es una capa de UX (feedback inmediato), la del backend es la fuente de verdad.

**Excepción:** `login/page.tsx` define su propio `LoginSchema` inline en lugar de usar un archivo de validaciones compartido — inconsistente con el resto del proyecto.

---

## 8. Patrones de UX

### Estados de carga

| Patrón                          | Dónde se usa                                                                                           |
| -------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `LoadingSpinner` global        | `DashboardProvider.MainContentWrapper` — while navigating between routes                             |
| `loading.tsx` (React Suspense) | `(dashboard)/loading.tsx` — mientras el Server Component hace el fetch                               |
| `isPending` en buttons         | Todos los formularios con `useTransition` — deshabilita el botón y muestra `Loader2 animate-spin` |
| Skeleton components              | No implementado sistemáticamente — oportunidad de mejora                                              |

### Errores y feedback

| Patrón                                  | Dónde                                                         |
| ---------------------------------------- | -------------------------------------------------------------- |
| **Toast de Sonner**                | Todos los formularios — éxito/error de Server Actions        |
| **FormMessage** de react-hook-form | Bajo cada campo — errores de validación Zod inline           |
| **Div de error rojo**              | `login/page.tsx` — error de credenciales bajo el formulario |
| **ConfirmDialog**                  | Acciones destructivas (eliminar, retirar alumno)               |
| **`not-found.tsx`**              | 404 personalizado del dashboard                                |

### Optimistic updates

**No hay optimistic updates implementados** en ningún componente. Todos los cambios requieren que el Server Action complete y que `revalidatePath` invalide el cache antes de que la UI actualice. Esto es correcto dado el contexto (datos académicos críticos), pero genera una UX de 300-2000ms sin feedback visual durante el guardado.

---

## 9. Deuda Técnica del Frontend

### 🔴 Crítico

| Problema                                                       | Ubicación                                 | Impacto                                           |
| -------------------------------------------------------------- | ------------------------------------------ | ------------------------------------------------- |
| `/api/pdf` sin autenticación                                | `src/app/api/pdf/route.tsx`              | Cualquiera puede generar PDFs con datos sensibles |
| Ruta `test-backend/` con errores TS activos                  | `dashboard/test-backend/`                | Errores en compilación, no debería existir      |
| Carpeta `dashboard/reports/` duplica `dashboard/reportes/` | `src/app/(dashboard)/dashboard/reports/` | Confusión — verificar cuál está activa        |

### 🟡 Medio

| Problema                                                         | Ubicación                           | Detalle                                                                                      |
| ---------------------------------------------------------------- | ------------------------------------ | -------------------------------------------------------------------------------------------- |
| **Componente gigante** `StudentProfileClient.tsx` (32KB) | `components/modules/students/`     | Maneja 6+ tabs con lógica muy diferente — candidato a dividirse en sub-componentes por tab |
| **`RegisterPaymentClient.tsx`** (22KB)                   | `components/modules/payments/`     | Contiene lógica de búsqueda, selección y registro en un solo componente                   |
| **`AttendanceClient.tsx`** (25KB)                        | `components/modules/attendance/`   | Podría separar el selector de sección/fecha del listado de alumnos                         |
| `dashboard/page.tsx` — awaits secuenciales                    | `dashboard/page.tsx` L20-24        | 5 Server Actions en serie; seguro paralelizar con `Promise.all`                            |
| `LoginSchema` definido inline                                  | `login/page.tsx`                   | Debería exportarse desde `src/lib/validations/auth.schema.ts`                             |
| `any` sin tipar                                                | `dashboard/page.tsx` L49, L50, L60 | `mappedAlerts: any[]` y accesos con `(inc: any)`                                         |
| Enlace "Recupera tu contraseña" apunta a `/login/recover`     | `login/page.tsx` L169              | Esa ruta no existe en el proyecto                                                            |
| Datos mock hardcodeados en el dashboard                          | `dashboard/page.tsx` L74-98        | `mockRevenueData` y `mockAttendanceData` deberían venir de `getFinancialReport`       |

### ⚪ Bajo

| Problema                                       | Detalle                                                                                                                                   |
| ---------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `use-toast.ts` en `hooks/`                 | El hook de shadcn/ui que nunca se importa directamente — toda la app usa `sonner`. Verificar si está en uso                           |
| Paleta de colores hardcodeada en algunas cards | `criticality="high/medium/low"` funciona bien pero podría ser un enum compartido                                                       |
| Convención de nombres inconsistente           | Carpeta `enrollments` pero componente `EnrollmentWizard`; carpeta `students` pero `StudentsClient` — singular vs plural mezclado |
