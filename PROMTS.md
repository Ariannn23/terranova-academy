# PROMPTS.md — TerraNova Academy · Guía de Trabajo con IA

> Este archivo contiene todos los prompts listos para usar con cualquier IA (Claude, Cursor, Copilot, etc.).
> Están diseñados para que la IA lea el MASTER.md, entienda el contexto completo y trabaje sprint por sprint sin saltar pasos.

---

## CÓMO USAR ESTE ARCHIVO

1. Abre una sesión nueva con tu IA preferida
2. Copia y pega el **Prompt de Inicio de Sesión** (siempre primero)
3. Luego usa el prompt del sprint específico en el que estás trabajando
4. Al terminar un sprint, valida que todo funcione antes de pasar al siguiente
5. Si cambias de sesión, vuelve a usar el Prompt de Inicio de Sesión

---

## PROMPT DE INICIO DE SESIÓN

> **Usar SIEMPRE al comenzar una nueva conversación con la IA.**

```
Lee el archivo MASTER.md ubicado en la raíz de este proyecto de forma completa y detallada antes de hacer cualquier cosa.

Este documento es la fuente de verdad del proyecto TerraNova Academy. Contiene:
- La descripción completa del sistema de gestión escolar
- El stack tecnológico exacto que debemos usar
- Las reglas de desarrollo que no son negociables
- La estructura de carpetas del proyecto
- El esquema completo de la base de datos en Prisma
- Toda la lógica de negocio crítica
- Los 15 módulos con sus rutas detalladas
- El plan de sprints dividido en Fase 1 (Backend) y Fase 2 (Frontend)

Una vez que hayas leído el documento completo, respóndeme con:
1. Un resumen de 5 puntos clave que entendiste del proyecto
2. El stack tecnológico que vamos a usar
3. En qué sprint estamos trabajando hoy (te lo diré a continuación)
4. Confirma que entiendes la regla: primero terminar backend completo, luego frontend

No escribas ningún código todavía. Solo confirma que leíste y comprendiste el documento.
```

---

## FASE 1 — BACKEND

---

### SPRINT B-01 · Setup y Base del Proyecto

```
Vamos a trabajar en el SPRINT B-01 según el MASTER.md.

El objetivo de este sprint es dejar el proyecto inicializado, la base de datos conectada, la autenticación funcionando y las rutas protegidas. Es la base sobre la que construiremos todo lo demás.

Tareas de este sprint (hazlas en este orden exacto, una por una):
1. Inicializar el proyecto Next.js 14 con TypeScript, App Router y alias de rutas (@/)
2. Instalar y configurar Tailwind CSS con la configuración base
3. Instalar shadcn/ui y agregar los componentes: button, input, card, badge, dialog, form, label, select, table, tabs, toast
4. Instalar Prisma y configurarlo con la URL de Supabase desde .env.local
5. Crear el schema.prisma completo con TODOS los modelos del MASTER.md (enums + modelos)
6. Ejecutar prisma db push
7. Instalar y configurar NextAuth v5 con Credentials provider tal como está en el MASTER.md
8. Crear el middleware.ts para proteger todas las rutas /dashboard/*
9. Crear lib/prisma.ts (singleton), lib/auth.ts, lib/supabase.ts, lib/constants.ts
10. Crear seed.ts con: usuario admin, año lectivo 2025 activo, los 3 niveles, los 14 grados
11. Ejecutar el seed y verificar datos en Supabase

Reglas para este sprint:
- Sigue exactamente la estructura de carpetas del MASTER.md
- Usa las versiones de dependencias del MASTER.md
- Nombra los archivos según las convenciones del MASTER.md
- No crees páginas de UI todavía, solo la infraestructura base

Al terminar cada tarea, dime qué hiciste y espera mi confirmación antes de continuar con la siguiente.
```

---

### SPRINT B-02 · Estudiantes y Apoderados

```
Vamos a trabajar en el SPRINT B-02 del MASTER.md: Estudiantes y Apoderados.

El sprint anterior (B-01) está completado: proyecto iniciado, Prisma conectado, NextAuth funcionando.

En este sprint construimos toda la lógica de backend para estudiantes. No tocamos UI todavía.

Tareas en orden:
1. Crear lib/validations/student.schema.ts con los schemas Zod para Student y Guardian (basándote en los modelos Prisma del MASTER.md)
2. Crear lib/utils/student-status.ts con la función calculateStudentStatus() exactamente como está en el MASTER.md
3. Crear lib/actions/student.actions.ts con estas Server Actions:
   - getStudents(filters) → lista paginada con filtros por nivel/grado/status/búsqueda
   - getStudentById(id) → datos completos con guardians y enrollments
   - createStudent(data) → validar con Zod, crear student + guardians, retornar { success, data/error }
   - updateStudent(id, data) → actualizar datos personales
   - changeStudentStatus(id, status, reason) → cambiar estado con motivo obligatorio
   - searchStudents(query) → búsqueda por nombre o DNI
4. Crear lib/actions/upload.actions.ts con:
   - uploadStudentPhoto(file, studentId) → sube a Supabase Storage, retorna URL pública
   - deleteStudentPhoto(url) → elimina foto anterior

Cada Server Action debe:
- Validar entrada con Zod
- Usar try/catch
- Retornar { success: true, data } o { success: false, error }
- Usar revalidatePath donde corresponda

Al terminar cada acción, muéstrame el código y espera aprobación antes de continuar.
```

---

### SPRINT B-03 · Docentes y Estructura Académica

```
Vamos a trabajar en el SPRINT B-03: Docentes y Estructura Académica.

Sprints anteriores completados: B-01 (setup), B-02 (estudiantes).

Tareas en orden:
1. Crear lib/validations/teacher.schema.ts → schemas Zod para Teacher
2. Crear lib/validations/academic.schema.ts → schemas para Course, Section, Schedule
3. Crear lib/actions/teacher.actions.ts:
   - getTeachers(filters)
   - getTeacherById(id) → con secciones y horario
   - createTeacher(data)
   - updateTeacher(id, data)
   - deactivateTeacher(id)
4. Crear lib/actions/academic.actions.ts:
   - getAcademicStructure() → árbol: año → niveles → grados → secciones
   - createCourse(data), updateCourse(id, data)
   - createSection(data), updateSection(id, data)
   - assignTeacherToSection(sectionId, teacherId)
   - saveSchedule(sectionId, scheduleData[])
   - validateScheduleConflicts(teacherId, schedules[]) → retorna conflictos encontrados
   - getScheduleBySection(sectionId)
   - getScheduleByTeacher(teacherId)

Cada Server Action debe seguir el mismo patrón de retorno { success, data/error } del MASTER.md.
```

---

### SPRINT B-04 · Matrículas

```
Vamos a trabajar en el SPRINT B-04: Matrículas.

Sprints anteriores completados: B-01, B-02, B-03.

Tareas en orden:
1. Crear lib/validations/enrollment.schema.ts → schema Zod completo para Enrollment
2. Crear lib/actions/enrollment.actions.ts:
   - getEnrollments(filters) → filtros: año, nivel, grado, status, búsqueda
   - getEnrollmentById(id) → con student, section, gradeRecords, payments, attendances, incidents
   - getEnrollmentsBySection(sectionId)
   - createEnrollment(data) → incluye validación: un alumno no puede tener 2 matrículas en el mismo año
   - updateEnrollment(id, data)
   - transferSection(enrollmentId, newSectionId, reason) → registra el traslado con motivo
   - importEnrollments(data[]) → carga masiva, retorna { created, failed, errors[] }
3. Asegurarse de que createEnrollment también genera automáticamente los Payment records para el año (usando los PaymentConcepts de tipo MENSUALIDAD activos)

Presta especial atención a la validación de unicidad: @@unique([studentId, academicYearId]) en el modelo Enrollment.
```

---

### SPRINT B-05 · Notas y Rendimiento

```
Vamos a trabajar en el SPRINT B-05: Notas y Rendimiento Académico.

Sprints anteriores completados: B-01 al B-04.

Tareas en orden:
1. Crear lib/validations/grade.schema.ts → schemas para GradeRecord, batch save
2. Crear lib/actions/grade.actions.ts:
   - getGradesBySection(sectionId, courseId, period) → para la grilla de ingreso de notas
   - getStudentGrades(enrollmentId) → boleta completa: todos los cursos + todos los periodos
   - saveGrades(grades[]) → guardado en lote con upsert (crear o actualizar)
   - calculateFinalGrade(enrollmentId, courseId) → promedio de P1+P2+P3+P4 / 4
   - calculateAllFinalGrades(enrollmentId) → recalcula todas las notas finales del alumno
   - getStudentsAtRisk(sectionId) → alumnos jalando 2+ cursos
   - getSectionGradeReport(sectionId, period) → estadísticas: promedio, aprobados, desaprobados, ranking
3. Después de saveGrades, llamar automáticamente a calculateStudentStatus y actualizar Student.status
4. Crear lib/utils/grade-calculator.ts con helpers puros para cálculos de notas (sin llamadas a DB, fácil de testear)

La nota mínima de aprobación debe leerse desde configuración del sistema (no hardcodear 11).
```

---

### SPRINT B-06 · Asistencia

```
Vamos a trabajar en el SPRINT B-06: Asistencia.

Sprints anteriores completados: B-01 al B-05.

Tareas en orden:
1. Crear lib/validations/attendance.schema.ts → schema para registro individual y batch
2. Crear lib/actions/attendance.actions.ts:
   - getAttendanceBySection(sectionId, date) → lista de todos los alumnos con su estado ese día
   - getAttendanceByStudent(enrollmentId, month?, year?) → historial del alumno
   - saveAttendance(records[]) → guardado en lote con upsert por enrollmentId+date
   - justifyAbsence(attendanceId, justification, justifiedBy) → actualizar a FALTA_JUSTIFICADA
   - getAttendanceStats(enrollmentId) → { totalDays, present, late, justified, unjustified, percentage }
   - getCriticalAttendance(sectionId?) → alumnos con >20% faltas injustificadas
   - getSectionAttendanceReport(sectionId, month, year) → planilla completa del mes
3. Después de saveAttendance, llamar calculateStudentStatus y actualizar Student.status si corresponde
4. Los días en CalendarEvent con tipo FERIADO no deben contar como día de clases al calcular el porcentaje
```

---

### SPRINT B-07 · Cobros y Pagos

```
Vamos a trabajar en el SPRINT B-07: Cobros y Pagos.

Sprints anteriores completados: B-01 al B-06.

Tareas en orden:
1. Crear lib/validations/payment.schema.ts → schemas para Payment y PaymentConcept
2. Crear lib/actions/payment.actions.ts:
   - getPaymentConcepts(type?) → listar conceptos activos
   - createPaymentConcept(data), updatePaymentConcept(id, data), deactivatePaymentConcept(id)
   - getPaymentsByEnrollment(enrollmentId) → historial completo con concepto
   - registerPayment(enrollmentId, conceptId, data) → marcar como PAGADO con fecha y método
   - generateMonthlyPayments(academicYearId) → crear registros Payment para todos los alumnos activos usando conceptos MENSUALIDAD
   - updateOverduePayments() → cambiar PENDIENTE a VENCIDO si dueDate < hoy (para cron o llamada manual)
   - getOverduePayments(filters?) → pagos vencidos, ordenados por días de retraso
   - getUpcomingPayments(days = 7) → pagos que vencen en los próximos N días
   - getFinancialSummary(month, year) → { totalBilled, totalPaid, totalPending, totalOverdue }
   - getFinancialReport(year) → desglose mensual del año
3. Un pago no puede registrarse si el enrollment no está activo
4. Al registrar pago, generar automáticamente el número de recibo (año-mes-correlativo)
```

---

### SPRINT B-08 · Incidencias, Inhabilitaciones y Comunicados

```
Vamos a trabajar en el SPRINT B-08: Incidencias, Inhabilitaciones, Comunicados y Calendario.

Sprints anteriores completados: B-01 al B-07.

Tareas en orden:
1. Crear lib/validations/incident.schema.ts y lib/actions/incident.actions.ts:
   - getIncidents(filters) → filtros: sección, alumno, severidad, fecha
   - getIncidentsByEnrollment(enrollmentId)
   - createIncident(data), updateIncident(id, data), deleteIncident(id)

2. Crear lib/actions/disability.actions.ts:
   - getActiveDisabilities(sectionId?)
   - getDisabilitiesByEnrollment(enrollmentId)
   - createDisability(enrollmentId, reason, description) → también actualiza Student.status a INHABILITADO
   - resolveDisability(id, resolvedNote) → marca como resuelta, recalcula Student.status

3. Crear lib/actions/announcement.actions.ts:
   - getAnnouncements(filters?) → filtrar por nivel o fecha
   - createAnnouncement(data), updateAnnouncement(id, data), deleteAnnouncement(id)

4. Crear lib/actions/calendar.actions.ts:
   - getEventsByMonth(month, year, academicYearId)
   - createCalendarEvent(data), updateCalendarEvent(id, data), deleteCalendarEvent(id)
   - getHolidayDates(academicYearId) → solo feriados, para excluirlos del cálculo de asistencia
```

---

### SPRINT B-09 · PDFs y Reportes

```
Vamos a trabajar en el SPRINT B-09: Generación de PDFs y Reportes.

Sprints anteriores completados: B-01 al B-08. Todo el backend de datos está listo.

Tareas en orden:
1. Instalar @react-pdf/renderer y xlsx
2. Crear src/components/pdf/ con los templates:
   - GradeReportPDF.tsx → libreta de notas (logo TerraNova Academy, nombre del alumno, grado, año, tabla de notas por curso y periodo, promedio final, estado)
   - EnrollmentCertificatePDF.tsx → constancia de matrícula (datos del colegio, del alumno, año lectivo, sección, firma del director)
   - AttendanceSheetPDF.tsx → planilla mensual (sección, mes, tabla con días del mes como columnas y alumnos como filas)
   - PaymentReceiptPDF.tsx → recibo de pago (número de recibo, alumno, concepto, monto, fecha, método)

3. Crear app/api/pdf/route.ts → API Route que recibe { type, id } y retorna el PDF como stream (Content-Type: application/pdf)

4. Crear lib/actions/report.actions.ts:
   - exportGradesToExcel(sectionId, period) → genera buffer xlsx con notas de la sección
   - exportFinancialReport(year) → Excel con reporte financiero anual
   - exportAttendanceReport(sectionId, month, year) → Excel con planilla de asistencia

5. Los PDFs deben incluir en el footer: nombre del colegio, fecha de generación, "Documento generado por TerraNova Academy"

Nota: Los templates PDF son componentes React pero se renderizan en servidor. No usar hooks de cliente.
```

---

## FASE 2 — FRONTEND

---

### SPRINT F-01 · Layout Base y Autenticación

```
Comenzamos la FASE 2 del MASTER.md: Frontend. Todo el backend está completo y funcional.

SPRINT F-01: Layout Base y Autenticación.

Regla de esta fase: los componentes de UI consumen las Server Actions ya construidas en la Fase 1. No crear nueva lógica de negocio en el frontend.

Tareas en orden:
1. Crear app/(auth)/login/page.tsx:
   - Formulario con React Hook Form + Zod (email y contraseña)
   - Manejo de errores de autenticación
   - Diseño limpio con el logo de TerraNova Academy
   - Loading state durante el submit

2. Crear app/(dashboard)/layout.tsx:
   - Sidebar de navegación con todos los módulos del MASTER.md
   - Indicador del módulo activo (highlight)
   - Header superior: nombre del director + botón de cerrar sesión
   - Responsive: sidebar colapsable con hamburger en móvil
   - El layout verifica sesión, si no hay redirige a /login

3. Crear src/components/shared/:
   - PageHeader.tsx → título de página + breadcrumb + botón de acción opcional
   - StatusBadge.tsx → badge de colores para StudentStatus (semáforo)
   - DataTable.tsx → tabla reutilizable con paginación, búsqueda y filtros
   - ConfirmDialog.tsx → modal de confirmación para acciones destructivas
   - StudentAvatar.tsx → foto del alumno con fallback a iniciales
   - LoadingSpinner.tsx → indicador de carga
   - EmptyState.tsx → estado vacío con ícono y mensaje

Al terminar cada componente muéstrame el resultado y espera aprobación.
```

---

### SPRINT F-02 · Dashboard Principal

```
SPRINT F-02: Dashboard Principal.

Sprint anterior completado: F-01 (layout y auth funcionando).

Tareas en orden:
1. Crear app/(dashboard)/dashboard/page.tsx como Server Component que:
   - Llama en paralelo a: getFinancialSummary, getStudentsAtRisk, getCriticalAttendance, getActiveDisabilities, getUpcomingPayments
   - Pasa los datos a componentes cliente para interactividad

2. Crear src/components/modules/dashboard/:
   - KPICard.tsx → card con número grande, ícono, label y color según criticidad
   - AlertList.tsx → lista de alertas prioritarias (pagos vencidos hoy, alumnos inhabilitados recientes)
   - RevenueChart.tsx → gráfica de barras con Recharts: ingresos vs pendientes por mes
   - AttendanceChart.tsx → gráfica de línea: % de asistencia promedio por semana
   - QuickAccess.tsx → accesos directos a las 6 acciones más frecuentes

3. El dashboard debe mostrar:
   - 4 KPI Cards: pagos vencidos del mes / alumnos en riesgo / asistencia crítica / cobros por vencer esta semana
   - Gráfica de ingresos del año actual
   - Lista de las 5 alertas más urgentes
   - Accesos rápidos: Tomar Asistencia / Registrar Pago / Nueva Matrícula / Ver Vencidos

Prioriza claridad visual. El director debe ver el estado del colegio en menos de 10 segundos.
```

---

### SPRINT F-03 · Estudiantes y Matrículas

```
SPRINT F-03: Módulos de Estudiantes y Matrículas.

Sprints anteriores de frontend completados: F-01, F-02.

Tareas en orden:
1. Página /dashboard/estudiantes:
   - Tabla con DataTable.tsx, columnas: foto, nombre, DNI, grado, nivel, estado (StatusBadge)
   - Filtros: nivel, grado, estado del semáforo
   - Búsqueda en tiempo real por nombre o DNI
   - Botón "Nuevo Estudiante"

2. Página /dashboard/estudiantes/[id] (perfil 360):
   - Header con foto, nombre, DNI, grado y StatusBadge grande
   - Tabs: Datos Personales | Apoderado | Notas | Asistencia | Pagos | Incidencias
   - Cada tab carga su contenido de forma lazy

3. Formulario /dashboard/estudiantes/nuevo y /editar:
   - React Hook Form + Zod
   - Upload de foto con preview
   - Sección de apoderado dentro del mismo formulario
   - Validación en tiempo real

4. Wizard /dashboard/matriculas/nueva (3 pasos):
   - Paso 1: Buscar o crear estudiante
   - Paso 2: Seleccionar año lectivo y sección disponible
   - Paso 3: Confirmar y revisar datos antes de guardar
   - Indicador de progreso entre pasos

5. Página /dashboard/matriculas con tabla filtrable por año/nivel/grado
```

---

### SPRINT F-04 · Docentes, Cursos y Horarios

```
SPRINT F-04: Docentes, Cursos y Horarios.

Tareas en orden:
1. Directorio de docentes (/dashboard/docentes):
   - Grid de cards con foto, nombre, especialidad, cantidad de secciones
   - Formulario de creación/edición

2. Vista de horario (/dashboard/horarios/[seccionId]/editar):
   - Grilla semanal: columnas = días (L-V), filas = bloques horarios
   - Cada celda muestra: nombre del curso + docente asignado
   - Selector para asignar curso+docente a cada bloque
   - Indicador visual de conflicto de horario del docente (rojo si ya está asignado a otra sección en ese bloque)

3. Lista de cursos por nivel con formulario simple de creación/edición
```

---

### SPRINT F-05 · Notas y Asistencia

```
SPRINT F-05: Módulos de Notas y Asistencia.

Tareas en orden:
1. Grilla de notas (/dashboard/notas):
   - Selectores en cascada: Año → Nivel → Grado → Curso → Periodo
   - Tabla con filas = alumnos, columna = nota (input numérico editable inline)
   - Botón "Guardar todo" que llama saveGrades en lote
   - Indicador visual: rojo si nota < nota mínima de aprobación

2. Boleta del alumno (/dashboard/notas/[matriculaId]):
   - Tabla con filas = cursos, columnas = P1, P2, P3, P4, Final
   - Color verde si aprobado, rojo si desaprobado
   - Promedio general del alumno al final

3. Página de asistencia (/dashboard/asistencia):
   - Selector de sección + fecha (default: hoy)
   - Lista de alumnos con 3 botones por fila: ✅ Presente | ⏰ Tardanza | ❌ Falta
   - Estado visual inmediato al hacer click
   - Botón "Guardar asistencia del día" con confirmación

4. Calendario de asistencia (/dashboard/asistencia/[matriculaId]):
   - Vista de calendario mensual
   - Cada día coloreado: verde=presente, amarillo=tardanza, rojo=falta injustificada, gris=justificada
   - Resumen estadístico al lado del calendario
```

---

### SPRINT F-06 · Pagos

```
SPRINT F-06: Módulo de Cobros y Pagos.

Tareas en orden:
1. Panel de pagos (/dashboard/pagos):
   - 4 KPI Cards: Total cobrado este mes / Pendiente / Vencido / Por vencer esta semana
   - Filtro por mes y nivel

2. Registrar pago (/dashboard/pagos/registrar):
   - Buscador de alumno (por nombre o DNI) con autocompletado
   - Al seleccionar alumno: mostrar sus pagos pendientes
   - Seleccionar concepto → ingresar monto y método de pago
   - Al guardar: mostrar modal de recibo con opción de imprimir/PDF

3. Lista de pagos vencidos (/dashboard/pagos/vencidos):
   - Tabla ordenada por días de retraso (los más urgentes arriba)
   - Columnas: alumno, grado, concepto, monto, días vencido, botón "Registrar pago"
   - Exportar lista a Excel

4. Historial de pagos del alumno (/dashboard/pagos/[matriculaId]):
   - Timeline visual de todos los pagos del año
   - Badges de color por estado: verde=pagado, amarillo=pendiente, rojo=vencido
```

---

### SPRINT F-07 · Inhabilitaciones, Incidencias, Comunicados y Calendario

```
SPRINT F-07: Módulos restantes de gestión.

Tareas en orden:
1. Inhabilitaciones:
   - Lista con filtros, StatusBadge de razón (faltas/notas/disciplina)
   - Formulario de nueva inhabilitación con búsqueda de alumno
   - Página de resolución con campo de nota obligatorio

2. Incidencias (libro de incidencias):
   - Tabla con filtros por alumno/sección/severidad/fecha
   - Formulario con selector de severidad (leve/moderado/grave) con colores
   - Vista de historial por alumno dentro del perfil 360

3. Comunicados:
   - Lista con filtros por nivel y fecha
   - Editor de texto para el cuerpo del comunicado (textarea con formato básico)
   - Vista de impresión con header del colegio

4. Calendario académico (/dashboard/calendario):
   - Vista de calendario mensual (librería: react-big-calendar o similar)
   - Eventos coloreados por tipo: examen=azul, feriado=rojo, evento=verde, reunión=naranja
   - Click en día para agregar nuevo evento
   - Indicador en la vista de tomar asistencia si ese día es feriado
```

---

### SPRINT F-08 · Reportes, PDFs y Configuración

```
SPRINT F-08: Reportes, generación de PDFs y configuración. ÚLTIMO SPRINT.

Tareas en orden:
1. Centro de reportes (/dashboard/reportes):
   - Grid de cards con todos los reportes disponibles
   - Cada card: ícono, nombre, descripción y botón de generar

2. Integrar botones de PDF en los módulos:
   - En perfil del estudiante: botón "Descargar libreta" y "Descargar constancia"
   - En cada sección de asistencia: "Descargar planilla del mes"
   - En cada pago registrado: "Descargar recibo"
   - Los botones abren una nueva pestaña con /api/pdf?type=X&id=Y

3. Exportación Excel:
   - En reporte de notas: botón "Exportar a Excel"
   - En reporte financiero: botón "Exportar a Excel"

4. Configuración del sistema (/dashboard/configuracion):
   - Formulario de datos del colegio (nombre, logo, dirección, correo)
   - Upload del logo (Supabase Storage)
   - Gestión de año lectivo activo
   - Configuración de reglas: nota mínima, % máximo de faltas, periodos

5. Revisión final:
   - Verificar que todos los módulos están conectados al backend
   - Verificar responsividad en móvil
   - Verificar que los estados del semáforo se actualizan correctamente
   - Verificar que los PDFs generan con el logo correcto
```

---

## PROMPTS DE EMERGENCIA

### Cuando la IA se confunde o desvía del plan

```
Para. Vuelve al MASTER.md y lee la sección [NOMBRE DE SECCIÓN].
Estamos en el SPRINT [NÚMERO]. No avances al siguiente sprint.
Lo que debes hacer ahora es únicamente: [TAREA ESPECÍFICA].
No modifiques nada fuera de los archivos que corresponden a este sprint.
```

### Cuando necesitas que revise código existente

```
Lee los archivos en [RUTA] y dime:
1. ¿Sigue las convenciones del MASTER.md?
2. ¿Hay algo que no esté alineado con el schema de Prisma del MASTER.md?
3. ¿El manejo de errores sigue el patrón { success, data/error }?
No modifiques nada todavía, solo analiza y reporta.
```

### Cuando quieres agregar una feature nueva

```
Quiero agregar la siguiente funcionalidad: [DESCRIPCIÓN].
Antes de implementar:
1. ¿Requiere cambios en el schema.prisma?
2. ¿En qué sprint debería ir según el plan del MASTER.md?
3. ¿Afecta alguna Server Action existente?
Dime el impacto y luego esperamos aprobación para proceder.
```

### Cuando hay un bug

```
Hay un bug en [MÓDULO/ARCHIVO]: [DESCRIPCIÓN DEL PROBLEMA].
Para arreglarlo:
1. No cambies nada fuera del archivo afectado
2. No refactorices otros archivos aprovechando el fix
3. Muéstrame exactamente qué líneas cambias y por qué
4. Verifica que el fix es consistente con el schema de Prisma del MASTER.md
```

### Para hacer Code Review de un sprint terminado

```
El SPRINT [NÚMERO] está terminado. Haz un code review completo de los archivos creados en este sprint.
Verifica:
1. TypeScript sin errores ni any implícitos
2. Todos los schemas Zod están completos y correctos
3. Todas las Server Actions retornan { success: true/false, data/error }
4. No hay lógica de negocio en componentes de UI (solo llamadas a actions)
5. Los nombres de archivos y funciones siguen las convenciones del MASTER.md
6. No se hardcodearon valores que deberían venir de configuración
Reporta lo que encontraste antes de continuar con el siguiente sprint.
```

---

*PROMPTS.md — TerraNova Academy*
*Mantener sincronizado con MASTER.md ante cualquier cambio de arquitectura*
