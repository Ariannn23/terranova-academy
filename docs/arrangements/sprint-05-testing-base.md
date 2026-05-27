# Sprint 05 - Pruebas automatizadas base

## Datos generales

- Sistema: TerraNova Academy
- Rama: `feature/sprint-05-testing-base`
- Objetivo: instalar y configurar una base de pruebas automatizadas sin modificar el comportamiento funcional existente.

## Diagnostico previo

- No existia framework de testing configurado en `package.json`.
- No existian scripts `test`, `test:run`, `test:watch` ni `test:coverage`.
- No existia carpeta `src/test`.
- El proyecto ya contaba con logica segura para pruebas unitarias sin base real:
  - `src/lib/audit.ts`
  - `src/lib/rbac.ts`
  - `src/lib/validations/payment.schema.ts`
  - `src/lib/validations/academic.schema.ts`
- Las Server Actions criticas dependen de Prisma, sesion y base de datos, por lo que quedan fuera de pruebas unitarias completas en este sprint.

## Dependencias instaladas

Se instalaron dependencias de desarrollo:

```bash
npm.cmd install -D vitest @vitest/coverage-v8 jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event vite-tsconfig-paths
```

Resultado:

- 115 paquetes agregados.
- 4 paquetes modificados.
- `npm audit` reporta 25 vulnerabilidades: 7 moderadas y 18 altas. No se ejecuta `npm audit fix` en este sprint para evitar cambios fuera de alcance.

## Configuracion creada

Archivos creados:

- `vitest.config.ts`
- `src/test/setup.ts`

Configuracion principal:

- Ambiente `jsdom`.
- Globals de Vitest habilitados.
- Setup global con `@testing-library/jest-dom/vitest`.
- Coverage con provider `v8`.
- Reportes de cobertura en `coverage`.
- Inclusion de archivos `*.test.ts`, `*.test.tsx`, `*.spec.ts` y `*.spec.tsx`.

## Scripts agregados

En `package.json` se agregaron:

```json
{
  "test": "vitest",
  "test:run": "vitest run",
  "test:watch": "vitest",
  "test:coverage": "vitest run --coverage"
}
```

No se modificaron los scripts existentes de `dev`, `build`, `start`, `lint`, Prisma ni seed.

## Estructura de pruebas

Se crearon las carpetas:

- `src/test/`
- `src/lib/__tests__/`
- `src/lib/validations/__tests__/`
- `src/lib/actions/__tests__/`

La carpeta `src/lib/actions/__tests__/` queda preparada para pruebas posteriores con mocks de Prisma y autenticacion.

## Pruebas creadas

### Auditoria

Archivo:

- `src/lib/__tests__/audit.test.ts`

Cobertura:

- `safeSerializeAuditValue()` redacta campos sensibles:
  - `password`
  - `passwordHash`
  - `token`
  - `accessToken`
  - `refreshToken`
  - `authorization`
  - `cookie`
  - `secret`
- `safeSerializeAuditValue()` mantiene metadata normal de negocio.
- `createAuditLog()` crea auditoria usando el usuario actual cuando existe.
- `createAuditLog()` no lanza excepcion si Prisma falla.

Correccion menor aplicada:

- En `src/lib/audit.ts` se normalizaron las claves sensibles a minusculas dentro de `SENSITIVE_KEYS` para que la comparacion con `key.toLowerCase()` redacte correctamente claves camelCase como `passwordHash`, `accessToken` y `refreshToken`.

### RBAC

Archivo:

- `src/lib/__tests__/rbac.test.ts`

Cobertura:

- `ROLE_GROUPS.ADMISSIONS` incluye `ADMIN`, `DIRECTOR`, `RECEPCION`.
- `ROLE_GROUPS.FINANCE` incluye `ADMIN`, `DIRECTOR`, `CAJA`.
- `ROLE_GROUPS.ACADEMIC` incluye `ADMIN`, `DIRECTOR`, `COORDINADOR`, `DOCENTE`.
- `ROLE_GROUPS.DISCIPLINE` incluye `ADMIN`, `DIRECTOR`, `COORDINADOR`.
- `ROLE_GROUPS.REPORTS` queda restringido y no incluye `RECEPCION` ni `DOCENTE`.
- `hasAllowedRole()` valida roles normalizados.
- `getAllowedRolesForPath()` resuelve roles por ruta protegida.

### Validacion de pagos

Archivo:

- `src/lib/validations/__tests__/payment.schema.test.ts`

Cobertura:

- `RegisterPaymentReceiptSchema` acepta abonos validos.
- Rechaza monto `0`.
- Rechaza monto negativo.
- Requiere metodo de pago.
- `PaymentFormSchema` valida formulario de pago parcial.

### Validacion academica / secciones

Archivo:

- `src/lib/validations/__tests__/academic.schema.test.ts`

Cobertura:

- `SectionSchema` acepta `capacity` mayor a 0.
- Rechaza `capacity = 0`.
- Rechaza capacidad negativa.
- Convierte string numerico a numero.
- Aplica default `30` cuando no se envia capacidad.

## Comandos ejecutados

### Pruebas

```bash
npm.cmd run test:run
```

Resultado:

- 4 archivos de prueba ejecutados.
- 22 pruebas pasaron.
- 0 pruebas fallidas.

### Cobertura

```bash
npm.cmd run test:coverage
```

Resultado:

- 4 archivos de prueba ejecutados.
- 22 pruebas pasaron.
- Coverage general:
  - Statements: 69.44%
  - Branches: 70.21%
  - Functions: 66.66%
  - Lines: 77.04%

Advertencia observada:

- Vitest informa que Vite ya soporta resolucion de paths de tsconfig de forma nativa y que `vite-tsconfig-paths` podria reemplazarse por `resolve.tsconfigPaths: true` en el futuro. No se cambia en este sprint porque la dependencia fue solicitada explicitamente.

### TypeScript

```bash
npx.cmd tsc --noEmit
```

Resultado:

- Correcto, sin errores TypeScript.

### Build

```bash
npm.cmd run build
```

Resultado:

- La compilacion de Next.js termina correctamente.
- Falla en la fase de lint/check por deuda tecnica existente.

Errores representativos:

- `@typescript-eslint/no-explicit-any` en componentes, Server Actions y PDFs.
- `@typescript-eslint/no-unused-vars` en componentes y acciones.
- `react/no-unescaped-entities` en textos JSX.
- `@typescript-eslint/no-require-imports` en scripts JS bajo `src/scripts`.
- Warnings de hooks y uso de `<img>`.

Estos errores no corresponden al alcance del Sprint 05 y ya existian como deuda general del proyecto.

### Lint

```bash
npm.cmd run lint
```

Resultado:

- Falla por la misma deuda tecnica descrita en build.
- No se corrige en este sprint por indicacion explicita de no mezclar testing con limpieza general de lint.

## Que se cubre

- Sanitizacion de auditoria.
- Resiliencia de `createAuditLog()` ante fallo de Prisma.
- Grupos y helpers base de RBAC.
- Validaciones Zod de pagos parciales.
- Validaciones Zod de capacidad de secciones.

## Que no se cubre todavia

- Pruebas de integracion de Server Actions con Prisma.
- Pruebas contra PostgreSQL o Supabase.
- Pruebas E2E con Playwright o Cypress.
- Pruebas de UI completas con flujos de usuario.
- Pruebas de calculos de dominio que aun estan acoplados a acciones o componentes.
- Pruebas de reportes Excel/PDF con verificacion de contenido.

## Pendientes recomendados

- Crear un sprint de limpieza de lint y deuda de tipado.
- Extraer reglas puras de dominio para poder probar:
  - saldo de pagos,
  - vacantes disponibles,
  - promedio de notas,
  - porcentaje de asistencia,
  - estados financieros.
- Agregar tests de Server Actions con mocks controlados de Prisma.
- Agregar tests de integracion con una base PostgreSQL de pruebas.
- Evaluar reemplazo futuro de `vite-tsconfig-paths` por configuracion nativa de Vite si el proyecto lo permite.
- Revisar vulnerabilidades reportadas por `npm audit` en un sprint separado.

## Mensaje de commit sugerido

```bash
git add .
git commit -m "test: configurar pruebas base con Vitest y casos criticos (Sprint 05)"
git push origin feature/sprint-05-testing-base
```
