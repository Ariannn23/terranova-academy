# Informe Tecnico de Pruebas y Calidad de Software

**Sistema:** TerraNova Academy  
**Tipo de revision:** Analisis tecnico de codigo fuente, arquitectura, base de datos y calidad de software  
**Alcance:** Revision documental del proyecto sin modificacion del codigo fuente funcional.

## 1. Descripcion general del sistema

TerraNova Academy es un sistema de gestion escolar orientado a centralizar procesos academicos, administrativos y financieros de una institucion educativa.

Segun la documentacion del proyecto, el sistema busca modernizar la gestion escolar mediante trazabilidad academica y financiera, integrando matriculas, notas, pagos, asistencia, incidencias y reportes.

El sistema corresponde a una aplicacion web cliente-servidor construida con Next.js. Su arquitectura es principalmente monolitica full-stack, porque frontend, backend, rutas, acciones de servidor y conexion a base de datos se encuentran dentro del mismo proyecto.

Usuarios o roles identificados:

| Rol / usuario                          | Evidencia                                                           | Observacion                                                                              |
| -------------------------------------- | ------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| Administrador                          | `User.role` con valor por defecto `ADMIN` en `prisma/schema.prisma` | Es el rol mas claro en codigo.                                                           |
| Docente                                | Modelo `Teacher` en `prisma/schema.prisma`                          | Existe como entidad academica.                                                           |
| Estudiante                             | Modelo `Student` en `prisma/schema.prisma`                          | Entidad central del sistema.                                                             |
| Apoderado                              | Modelo `Guardian` en `prisma/schema.prisma`                         | Asociado al estudiante.                                                                  |
| Personal administrativo / coordinacion | Mencionado en documentacion funcional                               | No se identifico control granular de permisos por estos roles en los archivos revisados. |

## 2. Tecnologias utilizadas

| Tecnologia                  | Para que sirve                         | Donde se usa                                                     | Importancia                                         |
| --------------------------- | -------------------------------------- | ---------------------------------------------------------------- | --------------------------------------------------- |
| TypeScript                  | Lenguaje principal con tipado estatico | Archivos `.ts` y `.tsx`, `tsconfig.json`                         | Mejora mantenibilidad y reduce errores de tipo.     |
| Next.js 14.2.35             | Framework web full-stack               | `src/app`, `package.json`                                        | Maneja rutas, layouts, API routes y Server Actions. |
| React 18                    | Construccion de interfaz               | Componentes en `src/components`                                  | Base del frontend.                                  |
| Prisma ORM 7                | Modelado y acceso a base de datos      | `prisma/schema.prisma`, `src/lib/prisma.ts`                      | Capa principal de persistencia.                     |
| PostgreSQL                  | Motor de base de datos relacional      | `prisma/schema.prisma`                                           | Almacena la informacion academica y administrativa. |
| `pg` y `@prisma/adapter-pg` | Conexion a PostgreSQL                  | `src/lib/prisma.ts`                                              | Permiten usar pool de conexiones con Prisma.        |
| NextAuth v5 beta            | Autenticacion                          | `src/lib/auth.ts`, `src/lib/auth.config.ts`, `src/middleware.ts` | Gestiona login, JWT y sesiones.                     |
| bcryptjs                    | Hash y validacion de contrasenas       | `src/lib/auth.ts`, `prisma/seed.ts`                              | Protege credenciales.                               |
| Zod                         | Validacion de datos                    | `src/lib/validations`                                            | Valida formularios y Server Actions.                |
| React Hook Form             | Manejo de formularios                  | Formularios de login y modulos                                   | Mejora UX y validacion en frontend.                 |
| Tailwind CSS                | Estilos utility-first                  | `tailwind.config.ts`, componentes                                | Sistema principal de diseno.                        |
| shadcn/ui y Radix UI        | Componentes reutilizables accesibles   | `src/components/ui`, `components.json`                           | Base de interfaz.                                   |
| Lucide React                | Iconos SVG                             | Sidebar, formularios y botones                                   | Mejora navegacion y claridad visual.                |
| Recharts                    | Graficos                               | `src/components/modules/dashboard`                               | Visualizacion de indicadores.                       |
| @react-pdf/renderer         | Generacion de PDFs                     | `src/app/api/pdf/route.tsx`, `src/components/pdf`                | Reportes y documentos descargables.                 |
| xlsx                        | Exportacion Excel                      | `src/lib/actions/report.actions.ts`                              | Reportes academicos/financieros.                    |
| Supabase Storage            | Almacenamiento de fotos                | `src/lib/supabase.ts`, `upload.actions.ts`                       | Fotos de estudiantes y docentes.                    |
| ESLint                      | Analisis estatico                      | `.eslintrc.json`                                                 | Calidad basica del codigo.                          |
| npm                         | Gestor de paquetes                     | `package.json`, `package-lock.json`                              | Instalacion y control de dependencias.              |

Herramientas de pruebas: no se identificaron Jest, Vitest, Testing Library, Playwright ni Cypress en `package.json`.

## 3. Base de datos

El motor de base de datos utilizado es PostgreSQL, definido en `prisma/schema.prisma`.

La conexion se realiza mediante `DATABASE_URL`, `pg.Pool`, `PrismaPg` y `PrismaClient` en `src/lib/prisma.ts`. Tambien existe `prisma.config.ts` para configurar Prisma con la URL de base de datos.

Entidades principales:

| Entidad                      | Informacion que maneja                                 | Relaciones                                                       |
| ---------------------------- | ------------------------------------------------------ | ---------------------------------------------------------------- |
| `User`                       | Usuarios autenticados, email, hash de contrasena y rol | Autenticacion.                                                   |
| `AcademicYear`               | Ano academico, fechas y estado activo                  | Secciones, matriculas y eventos.                                 |
| `GradeLevel`                 | Grados y niveles academicos                            | Cursos y secciones.                                              |
| `Section`                    | Secciones por grado y ano                              | Matriculas y horarios.                                           |
| `Student`                    | Datos personales, DNI, estado y foto                   | Apoderados y matriculas.                                         |
| `Guardian`                   | Apoderados del estudiante                              | Pertenece a estudiante.                                          |
| `Teacher`                    | Datos de docentes                                      | Secciones y horarios.                                            |
| `Course`                     | Cursos por grado                                       | Horarios y notas.                                                |
| `Schedule`                   | Horarios por seccion, curso y docente                  | Seccion, curso y docente.                                        |
| `Enrollment`                 | Matricula del estudiante en ano/seccion                | Eje de notas, pagos, asistencia, incidencias e inhabilitaciones. |
| `GradeRecord`                | Notas por curso y periodo                              | Matricula y curso.                                               |
| `Attendance`                 | Asistencia diaria                                      | Matricula.                                                       |
| `PaymentConcept` / `Payment` | Conceptos, cuotas y estados de pago                    | Matricula.                                                       |
| `Incident`                   | Incidencias disciplinarias                             | Matricula.                                                       |
| `DisabilityRecord`           | Inhabilitaciones                                       | Matricula.                                                       |
| `Announcement`               | Comunicados                                            | Nivel academico opcional.                                        |
| `CalendarEvent`              | Eventos del calendario academico                       | Ano academico.                                                   |

Archivos de base de datos identificados:

| Archivo                  | Funcion                                                                     |
| ------------------------ | --------------------------------------------------------------------------- |
| `prisma/schema.prisma`   | Modelo principal de datos.                                                  |
| `prisma/init-schema.sql` | Script SQL inicial.                                                         |
| `prisma/seed.sql`        | Datos semilla SQL.                                                          |
| `prisma/seed.ts`         | Seed TypeScript con usuario administrador, ano lectivo, grados y secciones. |
| `prisma.config.ts`       | Configuracion de Prisma.                                                    |

No se identifico una carpeta `prisma/migrations`. Por ello, aunque el modelo esta bastante completo para el dominio escolar, la gestion historica de cambios de base de datos esta incompleta.

## 4. Estructura del proyecto

```text
/
  package.json
  package-lock.json
  prisma/
    schema.prisma
    seed.ts
    seed.sql
    init-schema.sql
  docs/
    PRD_TerraNova_Academy.md
    BACKEND.md
    FRONTEND.md
    SECURITY-PROMT .md
  public/
    terranova-icono.png
  src/
    app/
      (auth)/
        login/page.tsx
      (dashboard)/
        layout.tsx
        dashboard/
          page.tsx
          estudiantes/
          docentes/
          cursos/
          horarios/
          matriculas/
          notas/
          asistencia/
          pagos/
          incidencias/
          inhabilitaciones/
          reportes/
          calendar/
          comunicados/
          configuracion/
      api/
        auth/[...nextauth]/route.ts
        pdf/route.tsx
        seed/route.ts
    components/
      ui/
      shared/
      modules/
      pdf/
    lib/
      actions/
      validations/
      utils/
      auth.ts
      auth.config.ts
      prisma.ts
      supabase.ts
    hooks/
```

La estructura general es ordenada y sigue buenas practicas de Next.js App Router. Existe separacion clara entre rutas, componentes visuales, Server Actions, validaciones, utilidades y configuracion de acceso a datos.

Como mejora, algunos componentes contienen mucha logica y varios archivos usan `any`, lo que reduce claridad y mantenibilidad.

## 5. Funcionalidades identificadas

| Modulo           | Que hace                                   | Archivos principales                                             | Estado                              |
| ---------------- | ------------------------------------------ | ---------------------------------------------------------------- | ----------------------------------- |
| Login            | Inicio de sesion con email y contrasena    | `src/app/(auth)/login/page.tsx`, `src/lib/auth.ts`               | Funcional parcial.                  |
| Dashboard        | KPIs, alertas, ingresos y asistencia       | `src/app/(dashboard)/dashboard/page.tsx`, `dashboard.actions.ts` | Funcional.                          |
| Estudiantes      | CRUD, perfil, apoderados e historial       | `student.actions.ts`, `components/modules/students`              | Avanzado.                           |
| Docentes         | CRUD y estado activo                       | `teacher.actions.ts`, `components/modules/teachers`              | Avanzado.                           |
| Cursos           | Gestion de cursos por grado                | `course.actions.ts`, `academic.actions.ts`                       | Funcional.                          |
| Matriculas       | Crear matricula, generar pagos, transferir | `enrollment.actions.ts`, `EnrollmentWizard.tsx`                  | Avanzado.                           |
| Notas            | Registro de notas y boleta                 | `grade.actions.ts`, `components/modules/grades`                  | Avanzado.                           |
| Asistencia       | Registro, justificacion y reportes         | `attendance.actions.ts`, `components/modules/attendance`         | Avanzado.                           |
| Pagos            | Conceptos, registro, morosidad y recibos   | `payment.actions.ts`, `components/modules/payments`              | Funcional.                          |
| Incidencias      | Registro y gestion disciplinaria           | `incident.actions.ts`, `components/modules/incidents`            | Funcional.                          |
| Inhabilitaciones | Registro y resolucion de restricciones     | `disability.actions.ts`, `components/modules/disabilities`       | Funcional.                          |
| Horarios         | Horario por seccion y docente              | `schedule.actions.ts`, `academic.actions.ts`                     | Funcional.                          |
| Calendario       | Eventos academicos                         | `calendar.actions.ts`, `components/modules/calendar`             | Funcional.                          |
| Comunicados      | Gestion de anuncios                        | `announcement.actions.ts`, `components/modules/announcements`    | Funcional.                          |
| Reportes         | PDF y Excel                                | `report.actions.ts`, `api/pdf/route.tsx`, `components/pdf`       | Funcional con necesidad de pruebas. |
| Configuracion    | Ano academico y reglas                     | `components/modules/configuracion`, `academic.actions.ts`        | Parcial/avanzado.                   |

## 6. Estado actual del sistema

| Area           | Estado             | Observacion                                                                                                 |
| -------------- | ------------------ | ----------------------------------------------------------------------------------------------------------- |
| Frontend       | Parcial / avanzado | Muchos modulos implementados. La pagina raiz conserva contenido inicial de Next.js.                         |
| Backend        | Parcial / avanzado | Server Actions amplias y organizadas. Falta autorizacion granular por rol.                                  |
| Base de datos  | Parcial / avanzado | Buen modelo relacional, pero sin migraciones formales.                                                      |
| Autenticacion  | Parcial            | Login y proteccion de dashboard existen. Falta control fino de permisos.                                    |
| Pruebas        | Incompleto         | No se identifico framework de pruebas.                                                                      |
| Seguridad      | Parcial            | Hay bcrypt, NextAuth y middleware. Persisten riesgos como seed temporal y credenciales por defecto en seed. |
| Documentacion  | Parcial / buena    | Existen PRD, frontend, backend y seguridad.                                                                 |
| Mantenibilidad | Media              | Buena estructura, pero hay `any`, componentes grandes y logica duplicada.                                   |
| Escalabilidad  | Media              | Adecuada para proyecto academico o mediano; requiere modularizar reglas criticas.                           |

## 7. Analisis de calidad de software

| Criterio       | Nivel actual | Evidencia                                   | Recomendacion                                                  |
| -------------- | ------------ | ------------------------------------------- | -------------------------------------------------------------- |
| Funcionalidad  | Alto         | Multiples modulos escolares implementados   | Completar recuperacion de contrasena, roles y pagos parciales. |
| Usabilidad     | Medio-Alto   | Dashboard, sidebar, formularios y toasts    | Homogeneizar estados de carga y errores.                       |
| Rendimiento    | Medio        | Uso de `Promise.all` e indices en pagos     | Optimizar acciones masivas de asistencia y reportes.           |
| Seguridad      | Medio        | NextAuth, bcrypt y middleware               | Agregar autorizacion por rol en Server Actions.                |
| Mantenibilidad | Medio        | Carpetas por dominio y validaciones Zod     | Reducir `any` y dividir componentes grandes.                   |
| Escalabilidad  | Medio        | Monolito modular Next.js                    | Centralizar reglas de negocio y permisos.                      |
| Confiabilidad  | Medio        | Uso de transacciones en procesos criticos   | Agregar pruebas automatizadas.                                 |
| Compatibilidad | Medio        | Aplicacion web moderna                      | Probar responsive, navegadores y generacion PDF.               |
| Reutilizacion  | Medio-Alto   | Componentes `ui`, `shared`, hooks y schemas | Tipar mejor contratos compartidos.                             |
| Claridad       | Medio-Alto   | Nombres de carpetas claros                  | Corregir textos con problemas de codificacion.                 |

## 8. Analisis para pruebas de software

Se recomienda implementar:

- Pruebas unitarias para utilidades de notas, estado del estudiante y validaciones Zod.
- Pruebas de integracion para Server Actions y Prisma.
- Pruebas funcionales de matriculas, pagos, asistencia y notas.
- Pruebas de interfaz para formularios, modales, navegacion y responsive.
- Pruebas de seguridad para login, rutas protegidas, PDF, seed y permisos.
- Pruebas de base de datos para constraints, relaciones y generacion automatica de pagos.
- Pruebas de rendimiento basicas para dashboard, asistencia masiva y reportes.
- Pruebas de validacion para DNI, email, fechas, montos y campos obligatorios.

Casos de prueba sugeridos:

| ID    | Modulo         | Caso de prueba             | Datos de entrada             | Resultado esperado                      | Prioridad |
| ----- | -------------- | -------------------------- | ---------------------------- | --------------------------------------- | --------- |
| CP-01 | Login          | Credenciales validas       | Email y contrasena correctos | Redirige a `/dashboard`                 | Alta      |
| CP-02 | Login          | Credenciales invalidas     | Password incorrecto          | Muestra error y no inicia sesion        | Alta      |
| CP-03 | Seguridad      | Acceso sin sesion          | URL `/dashboard`             | Redirige a `/login`                     | Alta      |
| CP-04 | Estudiantes    | Crear estudiante           | DNI unico y datos validos    | Estudiante registrado                   | Alta      |
| CP-05 | Estudiantes    | DNI duplicado              | DNI existente                | Rechaza registro                        | Alta      |
| CP-06 | Matriculas     | Crear matricula            | Estudiante, seccion y ano    | Crea matricula y pagos                  | Alta      |
| CP-07 | Matriculas     | Matricula duplicada        | Mismo alumno y ano           | Rechaza por restriccion unica           | Alta      |
| CP-08 | Notas          | Guardar nota valida        | Nota entre 0 y 20            | Registra o actualiza nota               | Alta      |
| CP-09 | Notas          | Calcular nota final        | P1, P2, P3, P4               | Promedio final correcto                 | Alta      |
| CP-10 | Asistencia     | Guardar asistencia diaria  | Lista de alumnos             | Registros creados/actualizados          | Alta      |
| CP-11 | Asistencia     | Justificar falta           | Falta injustificada          | Cambia a falta justificada              | Media     |
| CP-12 | Pagos          | Registrar pago             | Pago pendiente               | Estado `PAGADO`, recibo generado        | Alta      |
| CP-13 | Pagos          | Pago ya pagado             | Mismo `paymentId`            | Rechaza operacion                       | Alta      |
| CP-14 | Incidencias    | Registrar incidencia grave | Matricula y descripcion      | Incidencia visible en perfil            | Media     |
| CP-15 | Inhabilitacion | Inhabilitar estudiante     | Motivo valido                | Matricula inactiva y estado actualizado | Alta      |
| CP-16 | Reportes       | Generar PDF autenticado    | Sesion e id valido           | Devuelve PDF                            | Alta      |
| CP-17 | Reportes       | Generar PDF sin sesion     | Sin cookie                   | Devuelve 401                            | Alta      |
| CP-18 | Horarios       | Conflicto docente          | Mismo docente, dia y hora    | Detecta conflicto                       | Media     |
| CP-19 | Calendario     | Crear evento               | Fecha y tipo validos         | Evento creado                           | Media     |
| CP-20 | UI             | Sidebar responsive         | Pantalla movil               | Menu abre y cierra correctamente        | Media     |

## 9. Riesgos y problemas detectados

| Riesgo                                 | Nivel      | Descripcion                                                              | Recomendacion                                       |
| -------------------------------------- | ---------- | ------------------------------------------------------------------------ | --------------------------------------------------- |
| Falta de pruebas automatizadas         | Alto       | No se identifico framework de pruebas                                    | Agregar Vitest/Jest, Testing Library y pruebas E2E. |
| Autorizacion granular insuficiente     | Alto       | El rol existe, pero no se evidencian permisos por accion                 | Crear helpers como `requireRole`.                   |
| Seed temporal expuesto                 | Medio-Alto | Existe `/api/seed` marcado como temporal                                 | Eliminarlo o restringirlo solo a local.             |
| Credenciales por defecto en seed       | Medio-Alto | `Credenciales por defecto en seed` aparece en seed                       | Usar variables de entorno y cambio obligatorio.     |
| Sin migraciones Prisma                 | Medio      | No se encontro `prisma/migrations`                                       | Adoptar `prisma migrate`.                           |
| Uso extendido de `any`                 | Medio      | Varios componentes y reportes usan `any`                                 | Crear tipos y DTOs.                                 |
| Logica duplicada de estado estudiantil | Medio      | Estado depende de notas/asistencia en varios lugares                     | Centralizar regla de negocio.                       |
| Pagina raiz generica                   | Bajo-Medio | `src/app/page.tsx` conserva plantilla de Next.js                         | Redirigir a login/dashboard o crear home real.      |
| Aforo de secciones no evidente         | Medio      | PRD menciona capacidad, pero no se observa campo `capacity` en `Section` | Agregar si el requisito sigue vigente.              |
| Manejo de errores heterogeneo          | Medio      | Algunas acciones devuelven objetos y otras lanzan errores                | Estandarizar respuesta de Server Actions.           |

## 10. Recomendaciones de mejora

1. Implementar pruebas automatizadas por capas: unitarias, integracion y E2E.
2. Agregar autorizacion granular por rol para pagos, inhabilitaciones, configuracion, reportes y acciones administrativas.
3. Eliminar o aislar `/api/seed` fuera del despliegue.
4. Reemplazar credenciales hardcodeadas por variables de entorno.
5. Crear migraciones Prisma formales.
6. Centralizar el calculo de estado del estudiante.
7. Reducir el uso de `any` y crear tipos por modulo.
8. Dividir componentes grandes en subcomponentes especializados.
9. Completar funciones pendientes como recuperacion de contrasena y permisos por rol.
10. Mejorar documentacion de instalacion, variables de entorno, despliegue y plan de pruebas.

## 11. Conclusion general

TerraNova Academy se encuentra en una etapa avanzada de desarrollo funcional. Utiliza un stack moderno basado en Next.js, TypeScript, Prisma, PostgreSQL, NextAuth, Tailwind CSS, Zod y Server Actions.

La estructura general del proyecto es clara y modular, con separacion por rutas, componentes, acciones de servidor, validaciones y modelos de base de datos. El sistema cubre los principales procesos de gestion escolar: estudiantes, docentes, matriculas, pagos, notas, asistencia, incidencias, inhabilitaciones, reportes y configuracion.

Antes de considerarlo terminado, el sistema necesita principalmente pruebas automatizadas, autorizacion por roles, migraciones formales, endurecimiento de seguridad y reduccion de deuda tecnica. Como base para un trabajo academico de Pruebas y Calidad de Software, el proyecto es adecuado porque contiene reglas de negocio reales, modulos variados y riesgos claros para evaluar.
