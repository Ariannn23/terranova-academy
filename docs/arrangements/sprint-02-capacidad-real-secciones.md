# Sprint 02 - Capacidad real de secciones

**Rama:** `feature/sprint-02-section-capacity`  
**Objetivo:** Agregar capacidad real a las secciones y bloquear matriculas cuando no existan vacantes disponibles.  
**Commit sugerido:** `feat: agregar capacity a Section y validar vacantes en wizard (Sprint 02)`

## Resumen ejecutivo

En este sprint se agrego el campo persistente `capacity` al modelo `Section` y se actualizo el flujo de matricula para calcular vacantes reales con base en:

- Capacidad configurada de la seccion.
- Numero actual de matriculas activas en esa seccion.

El wizard de matricula ahora muestra vacantes disponibles y bloquea la seleccion de secciones llenas. El backend tambien valida la capacidad antes de crear la matricula para evitar que se omita la regla desde el cliente.

## Rama Git

Comando solicitado por el sprint:

```bash
git checkout develop
git pull origin develop
git checkout -b feature/sprint-02-section-capacity
```

Situacion real encontrada:

- No existia una rama local `develop`.
- Existian cambios sin commit del Sprint 01 en `feature/sprint-01-rbac-security`.
- Para mantener compatibilidad con RBAC y no perder trabajo, se creo la rama desde el estado actual del Sprint 01.

Comando ejecutado:

```bash
git switch -c feature/sprint-02-section-capacity
```

## Cambios en Prisma

Archivo modificado:

- `prisma/schema.prisma`

Cambio aplicado en el modelo `Section`:

```prisma
capacity Int @default(30)
```

Esto mantiene compatibilidad con secciones existentes, ya que la base de datos asignara `30` por defecto.

## Migracion

Se intento ejecutar:

```bash
npx.cmd prisma migrate dev --name add_capacity_to_section
```

Resultado:

- Fallo con `Schema engine error` contra la base configurada en Supabase pooler.
- Se reintento con permisos elevados y fallo con el mismo error.

Como alternativa, se dejo la migracion SQL versionada manualmente:

- `prisma/migrations/20260525142000_add_capacity_to_section/migration.sql`
- `prisma/migrations/migration_lock.toml`

SQL generado:

```sql
ALTER TABLE "Section"
ADD COLUMN "capacity" INTEGER NOT NULL DEFAULT 30;
```

Tambien se ejecuto:

```bash
npx.cmd prisma generate
```

Resultado:

- Prisma Client fue regenerado correctamente.

## Validacion de esquema

Se ejecuto:

```bash
npx.cmd prisma validate
```

Resultado:

- El schema Prisma es valido.

Advertencia observada:

- Prisma indica que `previewFeatures = ["driverAdapters"]` esta deprecado porque la funcionalidad ya puede usarse sin declararla como preview feature.

## Cambios en validaciones

Archivo modificado:

- `src/lib/validations/academic.schema.ts`

Se agrego `capacity` al `SectionSchema`:

```ts
capacity: z.coerce
  .number()
  .int("La capacidad debe ser un numero entero")
  .min(1, "La capacidad debe ser mayor a 0")
  .default(30)
```

Esto permite que futuras altas o ediciones de secciones puedan transportar capacidad real.

## Cambios en Server Actions

Archivo modificado:

- `src/lib/actions/enrollment.actions.ts`

### `getWizardData()`

Antes:

- El wizard devolvia `capacity: 30` hardcodeado.

Ahora:

- Devuelve `capacity` desde la base de datos.
- Calcula `occupied` con el conteo de matriculas activas.
- Calcula `available` como `capacity - occupied`.

Campos devueltos por seccion:

```ts
{
  capacity: s.capacity,
  occupied: s._count.enrollments,
  available: Math.max(s.capacity - s._count.enrollments, 0)
}
```

### `createEnrollment()`

Se agrego validacion de capacidad antes de crear la matricula:

- Consulta la seccion seleccionada.
- Cuenta matriculas activas.
- Si `occupied >= capacity`, retorna error.

Tambien se repite la validacion dentro de la transaccion para reducir riesgo de carreras entre usuarios.

Errores controlados agregados:

- `SECTION_NOT_FOUND`
- `SECTION_FULL`

Mensaje de negocio:

```text
La seccion seleccionada no tiene vacantes disponibles.
```

## Compatibilidad con RBAC

Se mantuvo la proteccion del Sprint 01:

```ts
await requireRole(ROLE_GROUPS.ADMISSIONS);
```

La accion `createEnrollment()` sigue restringida al grupo `ADMISSIONS`, compuesto por:

- `ADMIN`
- `DIRECTOR`
- `RECEPCION`

## Cambios en el wizard de matricula

Archivos modificados:

- `src/components/modules/enrollments/EnrollmentWizard.tsx`
- `src/components/modules/enrollments/hooks/useEnrollmentWizard.ts`
- `src/components/modules/enrollments/_components/WizardSectionStep.tsx`

Cambios aplicados:

1. Se bloquea el boton `Continuar` si la seccion seleccionada tiene `available <= 0`.
2. Se muestra mensaje de error cuando la seccion no tiene vacantes.
3. Se evita enviar la matricula si la seccion seleccionada ya no tiene disponibilidad.
4. La tarjeta de seccion muestra el numero de vacantes disponibles.
5. Las secciones llenas se muestran como `Lleno` y no son seleccionables.

## Archivos modificados por el Sprint 02

- `prisma/schema.prisma`
- `prisma/migrations/20260525142000_add_capacity_to_section/migration.sql`
- `prisma/migrations/migration_lock.toml`
- `src/lib/actions/enrollment.actions.ts`
- `src/lib/validations/academic.schema.ts`
- `src/components/modules/enrollments/EnrollmentWizard.tsx`
- `src/components/modules/enrollments/hooks/useEnrollmentWizard.ts`
- `src/components/modules/enrollments/_components/WizardSectionStep.tsx`
- `docs/arrangements/sprint-02-capacidad-real-secciones.md`

## Validaciones realizadas

Se ejecuto:

```bash
npx.cmd tsc --noEmit
```

Resultado:

- TypeScript paso correctamente.

Se ejecuto:

```bash
npx.cmd prisma validate
```

Resultado:

- Prisma schema valido.

Se ejecuto:

```bash
npx.cmd prisma generate
```

Resultado:

- Prisma Client regenerado correctamente.

## Reintento de migracion con base encendida

Despues del primer cierre del sprint se reintento aplicar la migracion porque la base de datos habia estado apagada.

Comandos reintentados:

```bash
npx.cmd prisma migrate dev --name add_capacity_to_section
npx.cmd prisma migrate status
npx.cmd prisma db execute --file prisma\migrations\20260525142000_add_capacity_to_section\migration.sql
```

Resultado:

- Los comandos quedaron en timeout.
- Se probo conectividad TCP al host/puerto configurado en `DATABASE_URL`.
- El resultado fue `TcpTestSucceeded=False` contra el pooler de Supabase en el puerto `6543`.

Diagnostico:

- La migracion aun no pudo aplicarse desde este entorno porque no hay conectividad efectiva hacia el pooler configurado.
- El SQL de migracion queda versionado y listo para aplicar cuando la conexion a la base este disponible.

Accion pendiente recomendada:

```sql
ALTER TABLE "Section"
ADD COLUMN "capacity" INTEGER NOT NULL DEFAULT 30;
```

Tambien puede aplicarse con Prisma cuando el entorno pueda conectarse correctamente:

```bash
npx.cmd prisma db execute --file prisma\migrations\20260525142000_add_capacity_to_section\migration.sql
```

## Confirmacion de aplicacion manual

El cambio fue aplicado manualmente desde Supabase SQL Editor y validado con:

```sql
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns
WHERE table_name = 'Section'
  AND column_name = 'capacity';
```

Resultado confirmado:

| column_name | data_type | column_default | is_nullable |
|---|---|---|---|
| `capacity` | `integer` | `30` | `NO` |

Con esto, la base de datos real ya contiene el campo requerido por el Sprint 02.

## Pruebas manuales sugeridas

| Caso | Resultado esperado |
|---|---|
| Matricular estudiante en seccion con vacantes | La matricula se crea y se generan pagos. |
| Matricular estudiante en seccion llena | El wizard bloquea la seleccion o la accion retorna error. |
| Forzar `createEnrollment()` con seccion llena | El backend responde que no hay vacantes disponibles. |
| Usuario sin rol `ADMISSIONS` intenta crear matricula | Accion denegada por RBAC. |
| Usuario `ADMIN`, `DIRECTOR` o `RECEPCION` crea matricula | Accion permitida si hay vacantes. |
| Cambiar capacidad de una seccion a 1 y tener 1 matricula activa | La seccion aparece como llena. |
| Cambiar capacidad de una seccion a 30 y tener menos de 30 matriculas activas | La seccion muestra vacantes disponibles. |

## Pendientes

1. Crear o actualizar UI administrativa para editar `capacity` de secciones si aun no existe.
2. Agregar pruebas automatizadas para:
   - Seccion con vacantes.
   - Seccion llena.
   - Carrera entre dos matriculas simultaneas.
   - Denegacion por rol no autorizado.
3. Revisar si se requiere restriccion adicional a nivel de base de datos o bloqueo transaccional mas fuerte para concurrencia alta.

## Estado del sprint

Sprint completado a nivel de codigo, esquema, migracion versionada, Prisma Client, validacion TypeScript y aplicacion manual en la base real.

La migracion automatica con `prisma migrate dev` no pudo ejecutarse desde este entorno contra la base configurada, pero el SQL fue aplicado manualmente y verificado en Supabase.
