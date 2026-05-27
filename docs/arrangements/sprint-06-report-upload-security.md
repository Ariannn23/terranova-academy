# Sprint 06 - Seguridad de reportes, uploads y datos sensibles

## Datos generales

- Sistema: TerraNova Academy
- Rama: `feature/sprint-06-report-upload-security`
- Objetivo: reforzar permisos de reportes, PDFs, uploads y sanitizacion de datos sensibles sin modificar reglas de negocio fuera del alcance.

## Diagnostico inicial

### PDFs existentes

El endpoint principal de PDFs es:

- `src/app/api/pdf/route.tsx`

Componentes PDF identificados:

- `AttendanceSheetPDF.tsx`
- `CommunicationPDF.tsx`
- `EnrollmentCertificatePDF.tsx`
- `GradeReportPDF.tsx`
- `IncidentReportPDF.tsx`
- `PaymentReceiptPDF.tsx`
- `ScheduleReportPDF.tsx`
- `StudentAttendancePDF.tsx`
- `StudentDisabilitiesPDF.tsx`
- `StudentIncidentsPDF.tsx`
- `StudentInfoPDF.tsx`

Tipos de PDF revisados:

- `receipt`
- `grades`
- `attendance`
- `student-attendance`
- `incident`
- `student-incidents`
- `student-disabilities`
- `student-schedule`
- `enrollment`
- `student`
- `communication`

### Exportaciones Excel existentes

Archivo:

- `src/lib/actions/report.actions.ts`

Funciones revisadas:

- `exportGradesToExcel()`
- `exportAttendanceReport()`
- `exportFinancialReport()`

Tambien se reviso reporte financiero no Excel en:

- `src/lib/actions/payment.actions.ts`
- `getFinancialReport()`

### Uploads existentes

Archivo:

- `src/lib/actions/upload.actions.ts`

Funciones revisadas:

- `uploadStudentPhoto()`
- `uploadTeacherPhoto()`
- `deletePhoto()`

Antes del sprint, los uploads validaban tamano maximo, pero no validaban de forma completa:

- MIME permitido.
- Extension permitida.
- Coincidencia entre MIME y extension.
- Dobles extensiones sospechosas.
- Nombre seguro generado por servidor.

### Riesgos detectados antes de implementar

- `ROLE_GROUPS.REPORTS` era demasiado amplio para reportes financieros, notas y asistencia.
- `CAJA` podia quedar con acceso a reportes academicos si una accion usaba `REPORTS` de forma generica.
- `COORDINADOR` podia acceder a reporte financiero no Excel por `getFinancialReport()`.
- Los uploads usaban extension tomada del nombre original.
- No habia helper unit-testable para validar archivos antes de subirlos.
- No habia sanitizador reutilizable para evitar filtrado accidental de `passwordHash`, tokens, cookies o secrets en reportes.

## Matriz de permisos creada

Archivo creado:

- `src/lib/report-permissions.ts`

Permisos definidos:

| Reporte | Roles permitidos |
|---|---|
| `financial` | `ADMIN`, `DIRECTOR`, `CAJA` |
| `grades` | `ADMIN`, `DIRECTOR`, `DOCENTE`, `COORDINADOR` |
| `attendance` | `ADMIN`, `DIRECTOR`, `DOCENTE`, `COORDINADOR` |
| `incidents` | `ADMIN`, `DIRECTOR`, `COORDINADOR` |
| `disabilities` | `ADMIN`, `DIRECTOR`, `COORDINADOR` |
| `enrollment` | `ADMIN`, `DIRECTOR`, `RECEPCION` |
| `studentProfile` | `ADMIN`, `DIRECTOR`, `RECEPCION`, `COORDINADOR` |
| `receipt` | `ADMIN`, `DIRECTOR`, `CAJA` |
| `communication` | `ADMIN`, `DIRECTOR` |

Reglas aplicadas:

- `CAJA` puede acceder a recibos y reportes financieros.
- `CAJA` no accede a notas ni incidencias.
- `DOCENTE` accede a notas/asistencia, no a finanzas.
- `RECEPCION` accede a estudiantes/matriculas, no a finanzas.
- `COORDINADOR` accede a notas, asistencia e incidencias, no a caja.
- `ADMIN` y `DIRECTOR` tienen acceso amplio.

## Reportes protegidos

Archivo modificado:

- `src/lib/actions/report.actions.ts`

Cambios:

- `exportGradesToExcel()` ahora usa `REPORT_PERMISSIONS.grades`.
- `exportAttendanceReport()` ahora usa `REPORT_PERMISSIONS.attendance`.
- `exportFinancialReport()` ahora usa `REPORT_PERMISSIONS.financial`.
- Se mantiene auditoria de exportaciones exitosas con `createAuditLog()`.
- No se guarda el archivo Excel completo en auditoria.

Archivo modificado:

- `src/lib/actions/payment.actions.ts`

Cambio:

- `getFinancialReport()` ahora usa `REPORT_PERMISSIONS.financial` en lugar de `ROLE_GROUPS.REPORTS`.

## PDFs protegidos

Archivo modificado:

- `src/app/api/pdf/route.tsx`

Cambios:

- Se reemplazo la seleccion generica de grupos por `getReportPermissions(type)`.
- Si el tipo de PDF no existe, responde `400`.
- Si no hay sesion, mantiene respuesta `401`.
- Si el rol no tiene permiso, responde `403`.
- Se mantiene auditoria de generacion exitosa.
- No se guarda contenido del PDF en auditoria.

## Uploads protegidos

Archivo creado:

- `src/lib/upload-security.ts`

Validaciones implementadas:

- MIME permitido:
  - `image/jpeg`
  - `image/png`
  - `image/webp`
- Extensiones permitidas:
  - `.jpg`
  - `.jpeg`
  - `.png`
  - `.webp`
- Tamano maximo:
  - 10 MB
- Rechazo de archivo sin MIME.
- Rechazo de extension no permitida.
- Rechazo de mismatch entre MIME y extension.
- Rechazo de dobles extensiones sospechosas como `foto.php.jpg`.
- Rechazo de nombres con separadores de ruta.
- Generacion de path seguro con `randomUUID()`.

Archivo modificado:

- `src/lib/actions/upload.actions.ts`

Cambios:

- `uploadStudentPhoto()` valida archivo en servidor antes de subir.
- `uploadTeacherPhoto()` valida archivo en servidor antes de subir.
- Ya no se usa el nombre original del archivo para construir el path final.
- Foto de estudiante mantiene RBAC con `ROLE_GROUPS.ADMISSIONS`.
- Foto de docente mantiene RBAC con `ROLE_GROUPS.ADMINISTRATION`.
- Upload exitoso de estudiante se audita como `AuditEntity.STUDENT`.
- Upload exitoso de docente se audita como `AuditEntity.TEACHER`.
- La auditoria guarda metadata segura: bucket, path, MIME y tamano.
- No se audita contenido binario ni base64 del archivo.

## Sanitizacion de datos sensibles

Archivo creado:

- `src/lib/report-sanitizer.ts`

Funciones creadas:

- `sanitizeReportData()`
- `sanitizeStudentForReport()`
- `sanitizePaymentForReport()`
- `sanitizeIncidentForReport()`
- `sanitizeUserForReport()`

Campos sensibles filtrados:

- `password`
- `passwordHash`
- `token`
- `accessToken`
- `refreshToken`
- `secret`
- `authorization`
- `cookie`
- `session`

Uso aplicado:

- `exportGradesToExcel()` sanitiza cada fila antes de construir el Excel.

## Pruebas creadas

### Permisos de reportes

Archivo:

- `src/lib/__tests__/report-permissions.test.ts`

Cubre:

- `CAJA` accede a financiero y recibos.
- `DOCENTE` no accede a financiero.
- `RECEPCION` no accede a financiero.
- `COORDINADOR` accede a incidencias.
- `CAJA` no accede a incidencias ni notas.
- `ADMIN` y `DIRECTOR` tienen acceso a todos los reportes definidos.
- Resolucion de permisos por tipo de PDF.

### Validacion de uploads

Archivo:

- `src/lib/__tests__/upload-security.test.ts`

Cubre:

- JPEG valido.
- PNG valido.
- WEBP valido.
- PDF rechazado como foto.
- EXE rechazado.
- Archivo mayor a 10 MB rechazado.
- Doble extension sospechosa rechazada.
- Archivo sin MIME rechazado.
- Mismatch entre MIME y extension rechazado.
- Path seguro sin reutilizar nombre original.

### Sanitizacion de reportes

Archivo:

- `src/lib/__tests__/report-sanitizer.test.ts`

Cubre:

- Eliminacion de `passwordHash`, tokens, cookies y secrets.
- Conservacion de datos permitidos de estudiante.
- Conservacion de datos permitidos de pago.
- Sanitizacion de usuarios para reportes administrativos.

## Validaciones ejecutadas

```bash
npm.cmd run test:run
```

Resultado:

- 7 archivos de prueba ejecutados.
- 40 pruebas pasaron.
- 0 pruebas fallidas.

```bash
npm.cmd run test:coverage
```

Resultado:

- 7 archivos de prueba ejecutados.
- 40 pruebas pasaron.
- Coverage general:
  - Statements: 76.86%
  - Branches: 75.29%
  - Functions: 76.92%
  - Lines: 84.07%

```bash
npx.cmd tsc --noEmit
```

Resultado:

- Correcto, sin errores TypeScript.

```bash
npm.cmd run build
npm.cmd run lint
```

Resultado:

- `next build` compila correctamente la aplicacion, pero falla en fase de lint/check.
- `npm run lint` falla por deuda tecnica preexistente.

Errores representativos:

- `@typescript-eslint/no-explicit-any` en componentes, PDFs y Server Actions antiguas.
- `@typescript-eslint/no-unused-vars` en componentes y acciones.
- `react/no-unescaped-entities` en textos JSX.
- `@typescript-eslint/no-require-imports` en scripts JS bajo `src/scripts`.
- Warnings de hooks y uso de `<img>`.

No se corrige esta deuda en Sprint 06 por indicacion explicita de no mezclar seguridad de reportes/uploads con limpieza general de lint.

## Pendientes futuros

- Crear sprint dedicado a lint, tipado y mantenibilidad.
- Separar `deletePhoto()` por contexto de estudiante/docente para aplicar permisos diferenciados con mayor precision.
- Aplicar sanitizacion de reportes de forma mas amplia cuando se refactoricen los builders de PDF/Excel.
- Crear pruebas de integracion de reportes con mocks de Prisma.
- Revisar vulnerabilidades de `npm audit` en un sprint separado de dependencias y hardening operativo.
- Agregar rate limiting o trazabilidad adicional para descargas masivas si el sistema crece.

## Mensaje de commit sugerido

```bash
git add .
git commit -m "security: reforzar reportes uploads y datos sensibles (Sprint 06)"
git push origin feature/sprint-06-report-upload-security
```
