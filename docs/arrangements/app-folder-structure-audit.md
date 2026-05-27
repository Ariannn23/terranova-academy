# Auditoria de estructura de `src/app` — TerraNova Academy

## Objetivo del analisis

Revisar la estructura actual de `src/app` en TerraNova Academy, proyecto basado en Next.js App Router, para identificar si las rutas, route groups, layouts, archivos especiales, protecciones y enlaces internos estan organizados de forma coherente antes de continuar con nuevos sprints.

Este documento es solo diagnostico. No se modificaron rutas, layouts, middleware, RBAC ni componentes del sistema.

## Nota de seguimiento Sprint 14A

En el Sprint 14A se corrigieron dos hallazgos de esta auditoria:

- `src/components/modules/dashboard/QuickAccess.tsx` dejo de enlazar a `/dashboard/matriculas/registrar` y ahora apunta a `/dashboard/matriculas/nueva`.
- `src/app/page.tsx` dejo de mostrar la plantilla inicial de Next.js y fue reemplazado por una landing institucional simple de TerraNova Academy con acceso visible a `/login`.

Tambien se ajusto el comportamiento de `src/app/(dashboard)/dashboard/[...catchAll]/page.tsx` para usar `notFound()` y un mensaje mas claro de ruta no encontrada o modulo no habilitado.

## Resumen ejecutivo

La estructura general de `src/app` es valida para Next.js App Router. El uso de route groups como `(auth)` y `(dashboard)` es normal y no genera URLs adicionales. La carpeta real `dashboard` dentro del grupo `(dashboard)` produce correctamente rutas bajo `/dashboard`.

Sin embargo, se identificaron puntos que conviene revisar en un sprint futuro:

- `src/app/page.tsx` todavia contiene la pantalla inicial de plantilla de Next.js.
- `src/components/modules/dashboard/QuickAccess.tsx` enlaza a `/dashboard/matriculas/registrar`, pero la ruta real identificada es `/dashboard/matriculas/nueva`.
- `src/app/(dashboard)/dashboard/[...catchAll]/page.tsx` puede ocultar rutas rotas mostrando "Modulo en Construccion" en lugar de evidenciar un enlace incorrecto.
- Hay `loading.tsx` en distintos niveles; esto es valido, pero puede ser redundante si no se documenta su responsabilidad.
- La navegacion lateral muestra todos los modulos a todos los usuarios autenticados, aunque middleware y layout aplican RBAC. No es un fallo directo de seguridad, pero puede generar mala experiencia por redirecciones.
- Varias rutas protegidas generan logs `DYNAMIC_SERVER_USAGE` durante build por uso de autenticacion y `headers()`. El build pasa, pero conviene declarar dinamismo de forma explicita en un sprint dedicado.

## Estructura actual encontrada

```text
src/app
  layout.tsx
  page.tsx
  globals.css
  icon.png
  fonts/
  api/
    auth/[...nextauth]/route.ts
    pdf/route.tsx
    seed/route.ts
  (auth)/
    login/page.tsx
  (dashboard)/
    layout.tsx
    loading.tsx
    _components/
      Header.tsx
      InitialLoader.tsx
      Sidebar.tsx
    dashboard/
      page.tsx
      loading.tsx
      not-found.tsx
      [...catchAll]/page.tsx
      asistencia/
      calendar/
      comunicados/
      configuracion/
      cursos/
      docentes/
      estudiantes/
      horarios/
      incidencias/
      inhabilitaciones/
      matriculas/
      notas/
      pagos/
      reportes/
```

## Explicacion de carpetas principales

| Carpeta/archivo | Funcion | Diagnostico |
| --- | --- | --- |
| `src/app/layout.tsx` | Layout raiz, fuentes locales, estilos globales y `Toaster`. | Correcto como layout global. |
| `src/app/page.tsx` | Ruta publica `/`. | Requiere revision: contiene contenido de plantilla de Next.js, no una pantalla de TerraNova ni redireccion. |
| `src/app/(auth)/login/page.tsx` | Ruta `/login`. | Correcta para separar autenticacion sin afectar URL. |
| `src/app/(dashboard)/layout.tsx` | Layout protegido para las rutas del dashboard; renderiza Sidebar, Header y valida sesion/RBAC. | Correcto conceptualmente, aunque su uso de `headers()` explica logs dinamicos. |
| `src/app/(dashboard)/_components` | Componentes internos del layout de dashboard. | Correcto. El prefijo `_components` comunica que no es ruta. |
| `src/app/(dashboard)/dashboard` | Segmento real que genera `/dashboard` y subrutas. | Valido. Puede parecer redundante por estar dentro del grupo `(dashboard)`, pero no duplica URL. |
| `src/app/api/auth/[...nextauth]/route.ts` | Endpoint de NextAuth. | Correcto. |
| `src/app/api/pdf/route.tsx` | Endpoint de generacion PDF con auth, permisos y auditoria. | Correcto, aunque concentra muchas variantes de PDF. |
| `src/app/api/seed/route.ts` | Endpoint temporal de seed protegido por `NODE_ENV` y `SEED_TOKEN`. | Riesgo bajo/medio: esta protegido, pero conviene retirarlo o moverlo a script operativo cuando el sistema madure. |

## Rutas detectadas

### Rutas publicas y API

| Ruta URL | Archivo | Estado |
| --- | --- | --- |
| `/` | `src/app/page.tsx` | Requiere revision por plantilla Next.js. |
| `/login` | `src/app/(auth)/login/page.tsx` | Correcta. |
| `/api/auth/[...nextauth]` | `src/app/api/auth/[...nextauth]/route.ts` | Correcta. |
| `/api/pdf` | `src/app/api/pdf/route.tsx` | Correcta y protegida internamente. |
| `/api/seed` | `src/app/api/seed/route.ts` | Temporal/protegida; revisar antes de produccion. |

### Rutas principales del dashboard

| Ruta URL | Archivo | Componente/modulo usado | Clasificacion |
| --- | --- | --- | --- |
| `/dashboard` | `dashboard/page.tsx` | `components/modules/dashboard/*` | Aceptable; tiene composicion y llamadas a acciones. |
| `/dashboard/matriculas` | `matriculas/page.tsx` | `components/modules/enrollments/EnrollmentsClient` | Correcta. |
| `/dashboard/matriculas/nueva` | `matriculas/nueva/page.tsx` | `components/modules/enrollments/EnrollmentWizard` | Correcta. |
| `/dashboard/matriculas/[id]` | `matriculas/[id]/page.tsx` | `EnrollmentDetailsClient` | Correcta. |
| `/dashboard/estudiantes` | `estudiantes/page.tsx` | `StudentsClient` | Correcta. |
| `/dashboard/estudiantes/nuevo` | `estudiantes/nuevo/page.tsx` | `StudentForm` | Correcta. |
| `/dashboard/estudiantes/[id]` | `estudiantes/[id]/page.tsx` | `StudentProfileClient` | Correcta; ya declara `force-dynamic`. |
| `/dashboard/estudiantes/[id]/editar` | `estudiantes/[id]/editar/page.tsx` | `StudentForm` | Correcta. |
| `/dashboard/docentes` | `docentes/page.tsx` | `TeachersClient` | Correcta. |
| `/dashboard/cursos` | `cursos/page.tsx` | `CoursesClient` | Aceptable; consulta Prisma directa para grados. |
| `/dashboard/horarios` | `horarios/page.tsx` | `SchedulesListClient` | Correcta. |
| `/dashboard/horarios/[seccionId]/editar` | `horarios/[seccionId]/editar/page.tsx` | `ScheduleGrid` | Correcta. |
| `/dashboard/notas` | `notas/page.tsx` | `GradeGridClient` | Correcta. |
| `/dashboard/notas/[matriculaId]` | `notas/[matriculaId]/page.tsx` | `StudentReportCard` | Correcta. |
| `/dashboard/asistencia` | `asistencia/page.tsx` | `AttendanceClient` | Correcta. |
| `/dashboard/asistencia/[matriculaId]` | `asistencia/[matriculaId]/page.tsx` | `StudentAttendanceCalendar` | Correcta. |
| `/dashboard/pagos` | `pagos/page.tsx` | `PaymentsDashboardClient` | Correcta. |
| `/dashboard/pagos/registrar` | `pagos/registrar/page.tsx` | `RegisterPaymentClient` | Correcta. |
| `/dashboard/pagos/vencidos` | `pagos/vencidos/page.tsx` | `OverduePaymentsClient` | Posiblemente no enlazada directamente. |
| `/dashboard/pagos/[matriculaId]` | `pagos/[matriculaId]/page.tsx` | `StudentPaymentHistory` | Posiblemente no enlazada directamente. |
| `/dashboard/calendar` | `calendar/page.tsx` | `CalendarClient` | Aceptable; mezcla accion y Prisma directo. |
| `/dashboard/comunicados` | `comunicados/page.tsx` | `AnnouncementsClient` | Correcta. |
| `/dashboard/incidencias` | `incidencias/page.tsx` | `IncidentsClient` | Correcta. |
| `/dashboard/incidencias/nuevo` | `incidencias/nuevo/page.tsx` | `RegisterIncidentClient` | Correcta. |
| `/dashboard/incidencias/[id]` | `incidencias/[id]/page.tsx` | `IncidentDetailClient` | Correcta. |
| `/dashboard/inhabilitaciones` | `inhabilitaciones/page.tsx` | `DisabilitiesClient` | Correcta. |
| `/dashboard/inhabilitaciones/nueva` | `inhabilitaciones/nueva/page.tsx` | `RegisterDisabilityClient` | Correcta. |
| `/dashboard/inhabilitaciones/[id]` | `inhabilitaciones/[id]/page.tsx` | `DisabilityDetailClient` | Aceptable; consulta Prisma directa. |
| `/dashboard/reportes` | `reportes/page.tsx` | `ReportesClient` | Correcta; ya declara `force-dynamic`. |
| `/dashboard/*` no coincidente | `[...catchAll]/page.tsx` | `not-found.tsx` local | Requiere revision: puede ocultar links rotos. |

## Rutas enlazadas desde Sidebar

Archivo revisado: `src/app/(dashboard)/_components/Sidebar.tsx`.

| Modulo | URL |
| --- | --- |
| Inicio | `/dashboard` |
| Matriculas | `/dashboard/matriculas` |
| Estudiantes | `/dashboard/estudiantes` |
| Docentes | `/dashboard/docentes` |
| Cursos | `/dashboard/cursos` |
| Horarios | `/dashboard/horarios` |
| Calificaciones | `/dashboard/notas` |
| Asistencia | `/dashboard/asistencia` |
| Finanzas | `/dashboard/pagos` |
| Calendario | `/dashboard/calendar` |
| Comunicados | `/dashboard/comunicados` |
| Inhabilitaciones | `/dashboard/inhabilitaciones` |
| Incidencias | `/dashboard/incidencias` |
| Reportes | `/dashboard/reportes` |
| Configuracion | `/dashboard/configuracion` |

Todas estas rutas existen en `src/app/(dashboard)/dashboard`, salvo que `calendar` mantiene nombre en ingles mientras el resto esta mayoritariamente en espanol.

## Rutas no enlazadas directamente desde Sidebar

Estas rutas son normales como rutas de detalle, creacion o edicion, pero no aparecen en la navegacion principal:

| Ruta | Evidencia de enlace interno | Observacion |
| --- | --- | --- |
| `/dashboard/matriculas/nueva` | `EnrollmentsClient.tsx` | Correcta como flujo interno de creacion. |
| `/dashboard/matriculas/[id]` | `EnrollmentsClient.tsx` | Correcta como detalle. |
| `/dashboard/estudiantes/nuevo` | `useStudentsDirectory.ts` | Correcta como flujo interno. |
| `/dashboard/estudiantes/[id]` | `useStudentsDirectory.ts` | Correcta como perfil. |
| `/dashboard/estudiantes/[id]/editar` | `StudentProfileClient.tsx` | Correcta como edicion. |
| `/dashboard/horarios/[seccionId]/editar` | `SchedulesListClient.tsx` | Correcta como edicion. |
| `/dashboard/incidencias/nuevo` | `IncidentsClient.tsx` y `QuickAccess.tsx` | Correcta. |
| `/dashboard/incidencias/[id]` | `useIncidentsDirectory.ts` | Correcta. |
| `/dashboard/inhabilitaciones/nueva` | `DisabilitiesClient.tsx` | Correcta. |
| `/dashboard/inhabilitaciones/[id]` | `useDisabilitiesDirectory.ts` | Correcta. |
| `/dashboard/notas/[matriculaId]` | `EnrollmentDetailsClient.tsx` | Correcta. |
| `/dashboard/asistencia/[matriculaId]` | `EnrollmentDetailsClient.tsx` | Correcta. |
| `/dashboard/pagos/registrar` | `PaymentsDashboardClient.tsx`, `OverduePaymentsClient.tsx`, `StudentPaymentHistory.tsx` | Correcta. |
| `/dashboard/pagos/vencidos` | No se identifico enlace directo en los archivos revisados. | Revisar si debe aparecer desde Finanzas o permanecer como ruta auxiliar. |
| `/dashboard/pagos/[matriculaId]` | No se identifico enlace directo en los archivos revisados. | Revisar si aun se usa o si fue reemplazada por historial dentro del perfil/detalle. |

## Rutas posiblemente duplicadas o confusas

| Elemento | Diagnostico |
| --- | --- |
| `(dashboard)/dashboard` | No es duplicado tecnico. `(dashboard)` es route group y no afecta URL; `dashboard` es el segmento real. Puede parecer redundante visualmente para nuevos desarrolladores. |
| `(dashboard)/loading.tsx` y `(dashboard)/dashboard/loading.tsx` | Ambos son validos. El primero es fallback general del grupo; el segundo es fallback especifico del segmento `/dashboard`. Puede ser redundante si no se documenta. |
| `dashboard/not-found.tsx` y `dashboard/[...catchAll]/page.tsx` | El catch-all fuerza una pantalla local para rutas desconocidas bajo `/dashboard`. Es util para modulos futuros, pero puede ocultar errores de navegacion. |
| `/dashboard/matriculas/registrar` | No existe como page, pero `QuickAccess.tsx` lo enlaza. La ruta real de nueva matricula es `/dashboard/matriculas/nueva`. |

## Proteccion de rutas

### Middleware

Archivo: `src/middleware.ts`.

El middleware protege `matcher: ["/dashboard/:path*"]`.

Comportamiento observado:

- Usuario sin sesion en `/dashboard/*` se redirige a `/login`.
- Para rutas dashboard, consulta `getAllowedRolesForPath()`.
- Si el rol no esta permitido, redirige a `getDefaultDashboardPath(userRole)`.

### Layout protegido

Archivo: `src/app/(dashboard)/layout.tsx`.

Comportamiento observado:

- Ejecuta `auth()`.
- Si no hay usuario, redirige a `/login`.
- Obtiene `x-next-url` mediante `headers()`.
- Revalida roles con `getAllowedRolesForPath()` y `hasAllowedRole()`.

Esto funciona como segunda capa de proteccion. Sin embargo, el uso de `headers()` es una de las causas de rutas dinamicas durante build.

### Reglas RBAC detectadas

Archivo: `src/lib/rbac.ts`.

| Ruta/prefijo | Roles permitidos |
| --- | --- |
| `/dashboard/configuracion` | `ADMIN`, `DIRECTOR` |
| `/dashboard/docentes` | `ADMIN`, `DIRECTOR` |
| `/dashboard/cursos` | `ADMIN`, `DIRECTOR`, `COORDINADOR`, `DOCENTE` |
| `/dashboard/horarios` | `ADMIN`, `DIRECTOR`, `COORDINADOR`, `DOCENTE` |
| `/dashboard/notas` | `ADMIN`, `DIRECTOR`, `COORDINADOR`, `DOCENTE` |
| `/dashboard/asistencia` | `ADMIN`, `DIRECTOR`, `COORDINADOR`, `DOCENTE` |
| `/dashboard/matriculas` | `ADMIN`, `DIRECTOR`, `RECEPCION` |
| `/dashboard/estudiantes` | `ADMIN`, `DIRECTOR`, `RECEPCION` |
| `/dashboard/pagos` | `ADMIN`, `DIRECTOR`, `CAJA` |
| `/dashboard/incidencias` | `ADMIN`, `DIRECTOR`, `COORDINADOR` |
| `/dashboard/inhabilitaciones` | `ADMIN`, `DIRECTOR`, `COORDINADOR` |
| `/dashboard/reportes` | `ADMIN`, `DIRECTOR`, `COORDINADOR`, `CAJA` |
| `/dashboard/comunicados` | `ADMIN`, `DIRECTOR` |
| `/dashboard/calendar` | `ADMIN`, `DIRECTOR`, `COORDINADOR`, `DOCENTE` |

### Observacion de seguridad

La proteccion centralizada existe y es coherente. El punto a mejorar no es el bloqueo, sino la experiencia: `Sidebar.tsx` no filtra modulos por rol, por lo que usuarios pueden ver enlaces que luego el middleware/layout les negara.

## Archivos especiales de Next.js

| Archivo | Uso actual | Evaluacion |
| --- | --- | --- |
| `src/app/layout.tsx` | Layout raiz, metadata, fonts, toaster. | Correcto. |
| `src/app/page.tsx` | Home publica con plantilla Next.js. | Requiere reemplazo o redireccion futura. |
| `src/app/(dashboard)/layout.tsx` | Layout protegido del dashboard. | Correcto, con oportunidad de declarar dinamismo. |
| `src/app/(dashboard)/loading.tsx` | Loader general del grupo dashboard. | Valido. |
| `src/app/(dashboard)/dashboard/loading.tsx` | Skeleton especifico del dashboard principal. | Valido, potencialmente redundante con el loader superior. |
| `src/app/(dashboard)/dashboard/not-found.tsx` | Pantalla local de modulo en construccion. | Valida, pero puede ocultar errores reales si se combina con catch-all. |
| `src/app/(dashboard)/dashboard/[...catchAll]/page.tsx` | Cualquier ruta desconocida bajo `/dashboard/*` renderiza `not-found`. | Util, pero requiere cuidado. |
| `src/app/api/pdf/route.tsx` | Route handler para PDFs. | Correcto y protegido. |
| `src/app/api/seed/route.ts` | Route handler temporal de seed. | Revisar antes de produccion. |

## Coherencia de nombres

| Elemento | Observacion | Recomendacion |
| --- | --- | --- |
| `calendar` | Nombre en ingles dentro de rutas mayormente en espanol. | Mantener por ahora para no romper enlaces; evaluar alias o normalizacion futura. |
| `configuracion` | Sin tilde, adecuado para URL. | Correcto. |
| `matriculas`, `pagos`, `reportes`, `notas` | Plurales consistentes. | Correcto. |
| `dashboard` dentro de `(dashboard)` | Correcto tecnicamente, visualmente redundante. | Mantener salvo que haya sprint de reestructuracion mayor. |
| `comunicados` vs `announcements` en componentes | URL en espanol y modulo interno en ingles. | Aceptable, pero documentar convencion. |
| `inhabilitaciones` vs `disabilities` en componentes | URL en espanol y modulo interno en ingles. | Aceptable, pero puede confundir a nuevos colaboradores. |

## Relacion entre `src/app` y `src/components/modules`

La mayoria de paginas de `src/app/(dashboard)/dashboard/*/page.tsx` actuan como composicion de datos y delegan UI en `src/components/modules/*`, lo cual es una practica adecuada para App Router.

| Ruta | Relacion con modules | Evaluacion |
| --- | --- | --- |
| `/dashboard` | Usa `components/modules/dashboard` y `services/dashboard.service`. | Aceptable. |
| `/dashboard/estudiantes` | Usa `components/modules/students`. | Correcta. |
| `/dashboard/pagos` | Usa `components/modules/payments`. | Correcta. |
| `/dashboard/notas` | Usa `components/modules/grades`. | Correcta. |
| `/dashboard/asistencia` | Usa `components/modules/attendance`. | Correcta. |
| `/dashboard/reportes` | Usa `components/modules/reports`. | Correcta. |
| `/dashboard/cursos` | Usa `CoursesClient`, pero consulta `prisma.gradeLevel` directo en page. | Aceptable; podria moverse a Server Action/helper para consistencia. |
| `/dashboard/calendar` | Usa `CalendarClient`, pero consulta `prisma.academicYear` directo en page. | Aceptable; podria moverse a action/helper. |
| `/dashboard/inhabilitaciones/[id]` | Usa `DisabilityDetailClient`, pero consulta Prisma directo en page. | Aceptable; podria centralizarse. |

## Impacto de `DYNAMIC_SERVER_USAGE`

Durante build se han observado logs `DYNAMIC_SERVER_USAGE` en rutas protegidas como:

- `/dashboard`
- `/dashboard/asistencia`
- `/dashboard/matriculas/nueva`
- `/dashboard/notas`
- `/dashboard/calendar`
- `/dashboard/cursos`
- `/dashboard/pagos`
- `/dashboard/pagos/vencidos`
- `/dashboard/inhabilitaciones`

El comportamiento es esperable cuando una ruta protegida usa autenticacion, `headers()` o acciones que dependen de sesion. Actualmente el build finaliza correctamente, por lo que no es un bloqueo inmediato.

Recomendacion futura:

- Evaluar `export const dynamic = "force-dynamic"` en `src/app/(dashboard)/layout.tsx` o en las paginas que dependen de sesion y datos dinamicos.
- Evitar hacerlo de forma masiva sin revisar impacto en cache y rendimiento.
- Tratarlo en un sprint especifico, no mezclado con refactor de rutas.

## Hallazgos clasificados

| Hallazgo | Nivel | Archivo/carpeta | Riesgo | Recomendacion |
| --- | --- | --- | --- | --- |
| Link inexistente a `/dashboard/matriculas/registrar` | Alto | `src/components/modules/dashboard/QuickAccess.tsx` | El usuario llega a catch-all en vez de nueva matricula. | Corregir en sprint futuro a `/dashboard/matriculas/nueva` o crear ruta real si el negocio lo requiere. |
| Home publica mantiene plantilla Next.js | Medio | `src/app/page.tsx` | Imagen poco profesional y ruta raiz no alineada al sistema. | Reemplazar por redireccion a `/login` o landing institucional. |
| Catch-all puede ocultar rutas rotas | Medio | `src/app/(dashboard)/dashboard/[...catchAll]/page.tsx` | Links incorrectos parecen modulos en construccion. | Mantener solo si se documenta; revisar rutas rotas antes de usarlo como fallback general. |
| Sidebar no filtra por rol | Medio | `src/app/(dashboard)/_components/Sidebar.tsx` | Usuarios ven modulos a los que no pueden acceder. | Filtrar navegacion segun rol en sprint futuro; mantener middleware como fuente de seguridad. |
| Logs `DYNAMIC_SERVER_USAGE` en build | Medio | `src/app/(dashboard)/layout.tsx` y paginas protegidas | Ruido en build y menor claridad sobre render dinamico. | Declarar dinamismo explicitamente en sprint 14C. |
| Consultas Prisma directas en algunas pages | Bajo/Medio | `cursos/page.tsx`, `calendar/page.tsx`, `inhabilitaciones/[id]/page.tsx` | Inconsistencia con patron Server Actions. | Mover a actions/helpers en sprint futuro si se busca uniformidad. |
| Doble loading dashboard | Bajo | `(dashboard)/loading.tsx`, `dashboard/loading.tsx` | Puede confundir responsabilidades. | Documentar o consolidar si no se diferencian visualmente. |
| Mezcla espanol/ingles en rutas y modulos | Bajo | `calendar`, `announcements`, `disabilities` | Curva de aprendizaje para mantenimiento. | No renombrar ahora; definir convencion futura. |
| Ruta `/dashboard/pagos/vencidos` sin enlace claro | Bajo | `pagos/vencidos/page.tsx` | Ruta util pero dificil de descubrir. | Confirmar si debe aparecer en Finanzas o menu secundario. |
| Ruta `/dashboard/pagos/[matriculaId]` sin enlace claro | Bajo | `pagos/[matriculaId]/page.tsx` | Posible ruta heredada o subutilizada. | Confirmar uso antes de eliminar o conservar. |
| Endpoint temporal de seed | Bajo/Medio | `src/app/api/seed/route.ts` | Aunque tiene guardas, es codigo operativo sensible. | Mantener fuera de produccion o mover a script interno cuando corresponda. |

## Plan de accion sugerido

### Sprint 14A — Auditoria y limpieza de rutas `app`

- Corregir links rotos confirmados.
- Revisar rutas sin enlace directo.
- Decidir si `[...catchAll]` debe mantenerse o reemplazarse por `notFound()`.
- No renombrar rutas todavia.

### Sprint 14B — Normalizacion de navegacion y RBAC visual

- Filtrar `Sidebar` por rol.
- Alinear `QuickAccess` con permisos de usuario.
- Revisar menus secundarios para pagos vencidos, registrar pago y nueva matricula.

### Sprint 14C — Declaracion explicita de rutas dinamicas

- Revisar rutas con auth, `headers()` y datos sensibles.
- Agregar `export const dynamic = "force-dynamic"` donde corresponda.
- Confirmar que el build quede mas silencioso sin alterar seguridad.

### Sprint 14D — Limpieza de rutas y carpetas no usadas

- Confirmar uso real de `/dashboard/pagos/[matriculaId]`.
- Confirmar uso real de `/dashboard/pagos/vencidos`.
- Revisar permanencia de `api/seed`.
- Eliminar o mover solo despues de validar enlaces y flujos.

## Conclusion

La estructura actual de `src/app` es normal y funcional para Next.js App Router. No se observan rutas duplicadas tecnicamente por el uso de `(dashboard)/dashboard`; la primera carpeta es un route group y la segunda es el segmento real de URL.

Las carpetas necesarias son:

- `src/app/(auth)` para login.
- `src/app/(dashboard)` para layout protegido y componentes internos.
- `src/app/(dashboard)/dashboard` para las rutas reales del panel.
- `src/app/api/auth` y `src/app/api/pdf` para autenticacion y reportes PDF.

Las carpetas o archivos que requieren revision son:

- `src/app/page.tsx`
- `src/app/(dashboard)/dashboard/[...catchAll]/page.tsx`
- `src/app/(dashboard)/dashboard/loading.tsx` junto con `src/app/(dashboard)/loading.tsx`
- `src/app/api/seed/route.ts`
- rutas de pagos no enlazadas claramente.

Es seguro continuar con un sprint de E2E despues de esta revision, pero es recomendable corregir primero el enlace roto de nueva matricula y decidir si la raiz `/` debe redirigir a `/login` o mostrar una pagina institucional. Para E2E, el catch-all actual puede ocultar errores de navegacion; por eso conviene que los tests verifiquen URLs esperadas y no solo presencia de una pantalla renderizada.
