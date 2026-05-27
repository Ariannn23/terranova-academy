# Sprint 07C - Refactor de listados repetidos

## Datos generales

- Sistema: TerraNova Academy
- Rama: `feature/sprint-07c-directory-hooks-refactor`
- Base usada: `feature/sprint-07b-payment-hooks-refactor`
- Observacion de rama: no existe rama `develop` en el repositorio local; se continuo desde la ultima rama limpia disponible.
- Objetivo: separar filtros, busqueda, navegacion y preparacion de datos de listados/directorios en hooks reutilizables, sin cambiar reglas de negocio ni diseno visual.

## Diagnostico inicial

Se revisaron los listados solicitados:

- `src/components/modules/students/StudentsClient.tsx`
- `src/components/modules/teachers/TeachersClient.tsx`
- `src/components/modules/courses/CoursesClient.tsx`
- `src/components/modules/incidents/IncidentsClient.tsx`
- `src/components/modules/disabilities/DisabilitiesClient.tsx`
- `src/components/modules/announcements/AnnouncementsClient.tsx`
- `src/services/directory-filter.service.ts`
- `src/services/table.service.ts`
- `src/services/formatting.service.ts`

Hallazgos:

- `StudentsClient.tsx` tenia busqueda por nombre/DNI, filtro por estado y filtro por nivel dentro del componente.
- `TeachersClient.tsx` tenia busqueda por nombre, DNI y especialidad dentro del componente, junto con estado simple del modal.
- `CoursesClient.tsx` tenia busqueda por curso/grado/nivel, estado de modal y confirmacion de activacion/desactivacion dentro del componente.
- `IncidentsClient.tsx` tenia busqueda por estudiante/DNI y filtro por severidad dentro del componente.
- `DisabilitiesClient.tsx` tenia busqueda por estudiante, filtro por estado y filtro por motivo dentro del componente.
- `AnnouncementsClient.tsx` tenia busqueda por titulo/contenido, filtro por nivel, modal simple y eliminacion dentro del componente.
- `directory-filter.service.ts` necesitaba soportar `ALL`, filtros por severidad, motivo y opciones genericas.

## Riesgos identificados

- Mover formularios o modales completos podia alterar flujos visuales; quedaron fuera del sprint.
- Tipar por completo las tablas y `DataTable` implicaria limpiar muchos `any`; se deja para un sprint de mantenibilidad.
- La eliminacion de comunicados y el toggle de cursos llaman Server Actions; se movieron solo como handlers existentes, sin cambiar la accion ni sus respuestas.
- `npm run build` y `npm run lint` siguen bloqueados por deuda de ESLint general del proyecto.

## Servicios reutilizados o ampliados

### `src/services/directory-filter.service.ts`

Se ampliaron funciones puras:

- `normalizeText(value)`
- `matchesSearchTerm(item, searchTerm, keys)`
- `filterByOption(items, selected, getter)`
- `filterDirectory(items, options)`

Mejoras:

- Soporte para filtros `ALL` y `TODOS`.
- Filtro por texto usando multiples campos.
- Filtro por estado.
- Filtro por nivel.
- Filtro por severidad.
- Filtro por motivo.
- Filtros combinados sin mutar el arreglo original.

### `src/services/table.service.ts`

Se reutilizo `filterBySearchKeys()` y `getNestedValue()` para mantener busquedas por rutas anidadas como:

- `enrollment.student.firstName`
- `enrollment.student.lastName`
- `enrollment.student.dni`
- `gradeLevel.name`
- `gradeLevel.level`

## Hooks creados

### `src/components/modules/students/hooks/useStudentsDirectory.ts`

Responsabilidad:

- Estado de busqueda.
- Filtro por nivel.
- Filtro por estado.
- `filteredStudents`.
- Navegacion a perfil de estudiante.
- Navegacion a registro de nuevo estudiante.

### `src/components/modules/teachers/hooks/useTeachersDirectory.ts`

Responsabilidad:

- Estado de busqueda.
- `filteredTeachers`.
- Apertura de formulario de creacion.
- Apertura de formulario de edicion.
- Seleccion de docente.

### `src/components/modules/courses/hooks/useCoursesDirectory.ts`

Responsabilidad:

- Estado de busqueda.
- `filteredCourses`.
- Apertura de formulario de creacion/edicion.
- Seleccion de curso.
- Confirmacion de activacion/desactivacion usando la Server Action existente `updateCourse()`.

### `src/components/modules/incidents/hooks/useIncidentsDirectory.ts`

Responsabilidad:

- Estado de busqueda.
- Filtro por severidad.
- `filteredIncidents`.
- Limpieza de toasts al montar.
- Navegacion al detalle de incidencia.

### `src/components/modules/disabilities/hooks/useDisabilitiesDirectory.ts`

Responsabilidad:

- Estado de busqueda.
- Filtro por estado.
- Filtro por motivo.
- `filteredDisabilities`.
- Limpieza de toasts al montar.
- Navegacion al detalle de inhabilitacion.

### `src/components/modules/announcements/hooks/useAnnouncementsDirectory.ts`

Responsabilidad:

- Estado de busqueda.
- Filtro por nivel.
- `filteredAnnouncements`.
- Apertura/cierre del modal de comunicado.
- Eliminacion de comunicado usando la Server Action existente `deleteAnnouncement()`.
- Refresh posterior a eliminacion exitosa.

## Componentes modificados

- `src/components/modules/students/StudentsClient.tsx`
- `src/components/modules/teachers/TeachersClient.tsx`
- `src/components/modules/courses/CoursesClient.tsx`
- `src/components/modules/incidents/IncidentsClient.tsx`
- `src/components/modules/disabilities/DisabilitiesClient.tsx`
- `src/components/modules/announcements/AnnouncementsClient.tsx`

Cambios aplicados:

- Se removieron filtros inline repetidos.
- Se movio estado de busqueda/filtros a hooks.
- Se movieron handlers simples de navegacion, modal y acciones existentes a hooks.
- Se mantuvo JSX, estructura visual, rutas, textos y modales.
- No se tocaron formularios complejos.

## Pruebas creadas o ampliadas

Archivo ampliado:

- `src/services/__tests__/directory-filter.service.test.ts`

Casos cubiertos:

- Normalizacion de texto.
- Busqueda por multiples campos.
- Filtro por estado.
- Filtro por nivel.
- Filtro por opcion generica.
- Filtro por severidad.
- Filtro por motivo.
- Filtros combinados.
- Confirmacion de no mutacion del arreglo original.
- Filtros vacios retornan todos los registros.

No se agregaron pruebas unitarias de hooks porque varios hooks dependen de `next/navigation`, `sonner`, `confirm()` o Server Actions. Se deja para un sprint de testing UI/hook con mocks controlados.

## Validaciones ejecutadas

| Comando | Resultado | Observacion |
| --- | --- | --- |
| `npm.cmd run test:run` | Correcto | 15 archivos de prueba, 88 tests aprobados. |
| `npm.cmd run test:coverage` | Correcto | Statements 82.67%, Branches 73.79%, Functions 91.46%, Lines 89.68%. |
| `npx.cmd tsc --noEmit` | Correcto | TypeScript pasa sin errores. |
| `npm.cmd run build` | Fallo en lint/check | Next compila, pero falla por errores de ESLint existentes. |
| `npm.cmd run lint` | Fallo | Persisten `any`, imports sin uso y `react/no-unescaped-entities` en multiples modulos. |

## Deuda tecnica observada

- Persisten `any` en `StudentsClient`, `CoursesClient`, `IncidentsClient`, `DisabilitiesClient`, `AnnouncementsClient` y otros modulos.
- Persisten errores de `react/no-unescaped-entities` en varios listados y PDFs.
- Persisten imports sin uso en componentes ajenos a este sprint.
- Los hooks con router/toast requieren una estrategia de mocks para pruebas unitarias.
- `DisabilitiesClient` originalmente buscaba por nombre de estudiante, no por DNI; se mantuvo ese comportamiento para no cambiar funcionalidad visible.

## Pendientes para Sprint 07D y 07E

- Sprint 07D: separar logica de formularios y modales (`StudentForm`, `TeacherForm`, `CourseForm`, `AnnouncementModal`, modales de calendario/horarios).
- Sprint 07E: refactor de dashboard y `DataTable`.
- Sprint posterior de calidad: tipado estricto de filas de tabla y eliminacion controlada de `any`.
- Sprint de testing UI: pruebas de hooks con `next/navigation`, `sonner`, confirmaciones y Server Actions mockeadas.

## Resultado del sprint

El Sprint 07C queda funcionalmente completado:

- Se crearon hooks de directorio para listados reales.
- Se redujeron filtros inline en componentes.
- Se reutilizo y amplio `directory-filter.service.ts`.
- No se modifico Prisma.
- No se modifico RBAC.
- No se modifico auditoria.
- No se modificaron reglas de negocio.
- No se refactorizaron formularios ni modales complejos.
- No se cambio el diseno visual.
- Tests y TypeScript pasan.

## Mensaje de commit sugerido

```bash
git add .
git commit -m "refactor: separar filtros de directorios en hooks reutilizables (Sprint 07C)"
git push origin feature/sprint-07c-directory-hooks-refactor
```
