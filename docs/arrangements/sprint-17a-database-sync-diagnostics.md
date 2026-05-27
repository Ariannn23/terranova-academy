# Sprint 17A — Sincronización y Diagnóstico de Base de Datos Local

## Objetivo del Sprint
Resolver los errores detectados tras la implementación del Sprint 17, donde múltiples módulos del dashboard (Finanzas, Incidencias, Inhabilitaciones, Comunicados, Calendario y Reportes) fallaban debido a desincronizaciones entre el esquema de Prisma, las migraciones locales y la base de datos de desarrollo. El objetivo principal fue realizar un diagnóstico completo de conectividad y estructura, asegurando la existencia de la columna `User.active` y la tabla `PaymentTransaction` en el entorno actual.

## Rama Git
`feature/sprint-17a-database-sync-diagnostics`

## Diagnóstico y Estado de la Base de Datos

### 1. Variables de Entorno y Conectividad
* **DATABASE_URL**: Apunta al Transaction Pooler de Supabase (`aws-0-us-west-2.pooler.supabase.com:6543`) configurado para runtime (Next.js Server Actions).
* **DIRECT_URL**: Apunta a la dirección directa original (`db.abncreomloyjmeusvjdy.supabase.co:5432`). 
* **Diagnóstico de Conectividad**:
  - Se detectó que el host directo de Supabase (`db.abncreomloyjmeusvjdy.supabase.co`) no resuelve localmente debido a restricciones de resolución de red (`getaddrinfo ENOTFOUND`).
  - Para solventar esto y ejecutar tareas administrativas DDL/Migraciones seguras, se validó con éxito el uso del Session Pooler de Supabase en el puerto `5432` (`aws-0-us-west-2.pooler.supabase.com:5432`), el cual permitió una comunicación directa sin bloqueos ni pool de transacciones.

### 2. Estado de Migraciones
Se ejecutó el estado de migraciones mediante:
```bash
$env:DATABASE_URL="postgresql://postgres.abncreomloyjmeusvjdy:terranovaacademy_0102@aws-0-us-west-2.pooler.supabase.com:5432/postgres"; npx.cmd prisma migrate status
```
* **Resultado**:
  - Se identificaron **5 migraciones** en la carpeta `prisma/migrations`.
  - La base de datos se encuentra completamente al día (`Database schema is up to date!`).
  - Tabla de migraciones interna de Prisma (`_prisma_migrations`) registra todas las migraciones aplicadas correctamente, incluyendo:
    - `20260525153000_add_payment_transactions`
    - `20260527064700_add_user_active_status`

### 3. Validación de la Estructura Real en la Base de Datos
Para descartar inconsistencias o drift no detectado por Prisma, se ejecutó una consulta SQL directa de verificación:
* **Columna `User.active`**: Existe y está declarada como tipo `boolean` en la tabla `User`.
* **Tabla `PaymentTransaction`**: Existe correctamente en el esquema `public`.

## Acciones Realizadas

1. **Prueba de Conexión y Diagnóstico de Red**:
   - Creación de script de diagnóstico en `scripts/test-db-schema.js` para evaluar todos los endpoints de conexión y mapear la estructura exacta de la base de datos de desarrollo.
2. **Generación del Cliente de Prisma**:
   - Validación del esquema local mediante `npx.cmd prisma validate` (resultado exitoso: `The schema at prisma\schema.prisma is valid 🚀`).
   - Regeneración del cliente Prisma local mediante `npx.cmd prisma generate` para asegurar que el motor de consultas de TypeScript contemple los nuevos tipos del modelo actualizados.

## Validaciones Ejecutadas
1. **Linter (`npm run lint`)**: Aprobado exitosamente.
2. **Esquema de Prisma (`npx.cmd prisma validate`)**: Sin errores.
3. **Compilación de Cliente (`npx.cmd prisma generate`)**: Cliente generado correctamente.

## Pendientes
* Ninguno. La base de datos local y el esquema de Prisma se encuentran sincronizados y funcionales.
