# Guía de testeos y validaciones

## Objetivo

Esta guía reúne los comandos para validar la calidad del proyecto **Terranova Academy**: esquema Prisma, lint, tipos TypeScript, pruebas unitarias, pruebas de integración de server actions, E2E públicos (sin sesión) y E2E autenticados (con base aislada y seed dedicado).

---

## Validaciones básicas

Ejecuta en la raíz del proyecto:

```bash
npx.cmd prisma validate
npx.cmd prisma generate
npm.cmd run lint
npx.cmd tsc --noEmit
```

En Git Bash puedes omitir `.cmd`:

```bash
npx prisma validate
npx prisma generate
npm run lint
npx tsc --noEmit
```

| Comando | Qué valida |
|---------|------------|
| `prisma validate` | Sintaxis y coherencia del esquema en `prisma/schema.prisma`. |
| `prisma generate` | Generación del cliente Prisma usado por la aplicación. |
| `npm run lint` | Reglas ESLint de Next.js sobre el código fuente. |
| `tsc --noEmit` | Tipos TypeScript sin emitir archivos JavaScript. |

---

## Pruebas unitarias

```bash
npm.cmd run test:run
```

Ejecuta la suite **Vitest** del proyecto (componentes, utilidades, RBAC, etc.).

**Referencia Sprint 18:** en una validación reciente del sprint se obtuvo **188 passed**. Este número puede variar si se añaden o modifican tests; úsalo solo como referencia histórica.

---

## Pruebas de integración

```bash
npm.cmd run test:integration
```

Ejecuta tests de integración bajo `src/lib/actions/__tests__` (server actions con mocks de Prisma/auth).

**Referencia Sprint 18:** **45 passed** en la misma validación.

---

## E2E públicos (sin autenticación)

```bash
npm.cmd run test:e2e -- --reporter=list
```

Levanta el servidor de desarrollo (vía `scripts/run-e2e.mjs`) y ejecuta Playwright contra rutas públicas y flujos que no requieren seed E2E.

**Resultado esperado reciente (Sprint 18):**

```txt
7 passed, 11 skipped
```

Los **11 skipped** corresponden a pruebas **autenticadas** que solo corren cuando se invoca la suite con `--auth` (`test:e2e:auth`).

---

## E2E autenticados

Requieren:

- `E2E_DATABASE_URL` configurada y apuntando a una base **aislada**.
- Seed previo con `npm run seed:e2e`.
- Invocación con el script que activa el modo autenticado:

```bash
npm.cmd run test:e2e:auth -- --reporter=list
```

El script `scripts/run-e2e.mjs` establece `E2E_RUN_AUTHENTICATED=1` y, si existe, sustituye temporalmente `DATABASE_URL` por `E2E_DATABASE_URL` para el servidor de prueba.

### Advertencia importante

```txt
E2E_DATABASE_URL debe apuntar a una base aislada y debe ser distinta de DATABASE_URL y MIGRATION_DATABASE_URL.
```

No desactives las protecciones en `scripts/seed-e2e.ts` ni en `scripts/run-e2e.mjs`.

### Ejecutar un archivo concreto

```bash
npm.cmd run test:e2e:auth -- e2e/auth.spec.ts --reporter=list
npm.cmd run test:e2e:auth -- e2e/payments-routes.spec.ts --reporter=list
```

---

## Seed E2E

Crea usuarios y datos mínimos para probar roles en la base E2E:

```bash
npm.cmd run seed:e2e
```

**Roles cubiertos:**

```txt
ADMIN
DIRECTOR
RECEPCION
CAJA
DOCENTE
COORDINADOR
```

**Correos por defecto** (si no defines `E2E_*_EMAIL` en el entorno):

```txt
admin.e2e@terranova.test
director.e2e@terranova.test
recepcion.e2e@terranova.test
caja.e2e@terranova.test
docente.e2e@terranova.test
coordinador.e2e@terranova.test
```

**Contraseña:** la variable `E2E_DEFAULT_PASSWORD` del entorno, o el fallback documentado en el script: `E2ePassword123!` (cámbiala en tu `.env.local`; no uses la de producción).

---

## Cargar variables en Git Bash

```bash
set -a
source .env.local
set +a
```

Validar aislamiento de la base E2E:

```bash
[ "$E2E_DATABASE_URL" = "$DATABASE_URL" ] && echo "ERROR: E2E igual a DATABASE_URL" || echo "OK: E2E distinta de DATABASE_URL"

[ "$E2E_DATABASE_URL" = "$MIGRATION_DATABASE_URL" ] && echo "ERROR: E2E igual a MIGRATION_DATABASE_URL" || echo "OK: E2E distinta de MIGRATION_DATABASE_URL"
```

---

## Cargar variables en PowerShell

Ejemplo para cargar `.env.local` en la sesión actual (sin imprimir valores):

```powershell
Get-Content .env.local | ForEach-Object {
  if ($_ -match '^\s*([^#][^=]+)=(.*)$') {
    $name = $matches[1].Trim()
    $value = $matches[2].Trim().Trim('"')
    [Environment]::SetEnvironmentVariable($name, $value, 'Process')
  }
}
```

Validar que las URLs no coinciden (ambas comparaciones deben ser **False**):

```powershell
$env:E2E_DATABASE_URL -eq $env:DATABASE_URL
$env:E2E_DATABASE_URL -eq $env:MIGRATION_DATABASE_URL
```

---

## Comandos recomendados de cierre

Secuencia sugerida antes de merge o release (Sprint 18):

```bash
npx.cmd prisma validate
npx.cmd prisma generate
npm.cmd run lint
npx.cmd tsc --noEmit
npm.cmd run test:run
npm.cmd run test:integration
npm.cmd run test:e2e -- --reporter=list
npm.cmd run seed:e2e
npm.cmd run test:e2e:auth -- --reporter=list
npm.cmd run build
```

Asegúrate de tener `.env.local` cargado y `E2E_DATABASE_URL` aislada antes de `seed:e2e` y `test:e2e:auth`.

---

## Resultados recientes del Sprint 18

Referencia de una validación completa del sprint (pueden variar en el futuro):

```txt
test:run: 188 passed
test:integration: 45 passed
test:e2e sin auth: 7 passed, 11 skipped
test:e2e:auth: 18 passed
build: OK
```

---

## Problemas comunes

### `E2E_DATABASE_URL es requerido`

No se cargó `.env.local` en la terminal, o la variable no está definida. Carga el archivo (secciones Git Bash / PowerShell arriba).

### `E2E_DATABASE_URL no puede ser igual a DATABASE_URL`

Asigna una base distinta para E2E (otro proyecto Supabase, otra base PostgreSQL, etc.).

### `E2E_DATABASE_URL no puede ser igual a MIGRATION_DATABASE_URL`

Usa tres URLs diferentes: runtime, migraciones y E2E.

### PowerShell bloquea `npm.ps1`

Usa `npm.cmd` en lugar de `npm` (por ejemplo `npm.cmd run test:e2e:auth`).

### Playwright no encuentra un link o botón

- Prefiere selectores accesibles: `getByRole('link', { name: /.../ })`.
- Verifica que el texto en la UI coincida con el test (mayúsculas, acentos).
- Si la acción está en un `Button asChild`, considera un `<Link>` nativo en la UI para navegación entre páginas.

### Compilación en frío de Next.js

Tras login, la primera carga de `/dashboard` puede tardar. En tests de login se usa `waitForURL` con timeout de 30 segundos en lugar de depender solo del timeout global de 10s de `expect`.

### `seed:e2e` no encuentra `E2E_DATABASE_URL`

El script usa `dotenv/config` (`.env`). Si solo tienes variables en `.env.local`, carga el archivo en la shell o usa Node 20+ con:

```bash
node --env-file=.env.local node_modules/tsx/dist/cli.mjs scripts/seed-e2e.ts
```

---

## Documentación relacionada

- [Guía de instalación del proyecto](./instalacion-proyecto.md)
- Plantilla de variables: `.env.example` en la raíz del repositorio
