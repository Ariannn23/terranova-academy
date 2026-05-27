# TerraNova Academy

Sistema administrativo escolar construido con Next.js App Router, Prisma ORM y PostgreSQL (Supabase), con enfoque en seguridad operativa, control de acceso por roles y trazabilidad completa de acciones.

---

## Estado actual del proyecto

El estado funcional integrado hasta Sprint 17F es estable. Las validaciones recientes confirman:

| Validación | Resultado |
|---|---|
| `prisma validate` | ✅ OK |
| `prisma generate` | ✅ OK |
| `lint` | ✅ OK |
| `tsc --noEmit` | ✅ OK |
| `test:run` | ✅ 188/188 |
| `test:integration` | ✅ 45/45 |
| `test:e2e base` | ✅ 7 passed / 11 skipped (esperado) |
| `build` | ✅ OK |

> Los **11 skipped de E2E** son esperados. Los escenarios autenticados requieren configurar `E2E_DATABASE_URL` y ejecutar `npm run seed:e2e` en una base aislada. No se deben considerar como fallo hasta completar ese sprint.

---

## Stack técnico

- **Next.js 14** (App Router) + **React 18** + **TypeScript**
- **Prisma ORM** + **PostgreSQL** (Supabase)
- **NextAuth v5** (sesión y autenticación, Credentials + Prisma Adapter)
- **Zod** + **React Hook Form**
- **Vitest** (unit/integration) + **Playwright** (E2E)
- **Supabase Storage** (subida de archivos)
- **Resend** (correos transaccionales)

---

## Requisitos previos

- Node.js 20+
- npm 10+
- Base PostgreSQL accesible (Supabase u otro proveedor)
- Opcional: base aislada exclusiva para E2E autenticado

---

## Estructura principal

```
terranova-academy/
├── src/
│   ├── app/              # Rutas App Router, layouts y páginas
│   ├── components/       # UI compartida y módulos de negocio
│   ├── lib/              # Auth, Server Actions, validaciones, utilidades
│   ├── services/         # Servicios puros de dominio/transformación
│   └── types/            # Tipos TypeScript del proyecto
├── prisma/
│   ├── schema.prisma     # Fuente de verdad del modelo de datos
│   ├── migrations/       # Migraciones versionadas
│   ├── seed.ts           # Seed base (sin usuarios reales)
│   └── seed.sql / init-schema.sql  # Archivos legacy (solo referencia)
├── scripts/
│   ├── bootstrap-admin.ts  # Creación segura del primer ADMIN
│   ├── seed-e2e.ts         # Seed aislado para E2E autenticado
│   └── run-e2e.mjs         # Runner de pruebas E2E
├── e2e/                  # Pruebas Playwright
└── docs/arrangements/    # Bitácora técnica por sprint
```

---

## Variables de entorno

Copiar `.env.example` a `.env.local` y completar los valores:

| Variable | Descripción |
|---|---|
| `DATABASE_URL` | URL de runtime (puede usar pooler `:6543` en Supabase) |
| `MIGRATION_DATABASE_URL` | URL directa para migraciones Prisma (usar `:5432` en Supabase) |
| `E2E_DATABASE_URL` | Base aislada para E2E autenticado (vacío si no aplica) |
| `DEFAULT_NEW_USER_PASSWORD` | Contraseña temporal por defecto al crear usuarios |
| `INSTITUTIONAL_EMAIL_DOMAIN` | Dominio institucional permitido (ej: `terranova.edu.pe`) |
| `BOOTSTRAP_ADMIN_EMAIL` | Email del primer ADMIN |
| `BOOTSTRAP_ADMIN_PASSWORD` | Contraseña del primer ADMIN |
| `BOOTSTRAP_ADMIN_NAME` | Nombre del primer ADMIN |
| `BOOTSTRAP_CONFIRM` | Debe ser `true` para ejecutar bootstrap |
| `AUTH_SECRET` | Secret de NextAuth (genera con `openssl rand -hex 32`) |
| `E2E_RUN_AUTHENTICATED` | `1` para habilitar tests autenticados en E2E |
| `E2E_ADMIN_EMAIL / PASSWORD` | Credenciales de ADMIN para E2E autenticado |

---

## Ejemplo de .env.local

> **No subir `.env.local` al repositorio. No pegar credenciales reales aquí. Si fueron expuestas, rotarlas de inmediato.**

```env
# ─── Base de Datos ────────────────────────────────────────────────────────────
DATABASE_URL="postgresql://USER:PASSWORD@HOST:6543/postgres?pgbouncer=true"
MIGRATION_DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/postgres"
E2E_DATABASE_URL=""

# ─── Usuarios ─────────────────────────────────────────────────────────────────
DEFAULT_NEW_USER_PASSWORD="Terranova2026!"
INSTITUTIONAL_EMAIL_DOMAIN=terranova.edu.pe

# ─── Bootstrap Admin ──────────────────────────────────────────────────────────
BOOTSTRAP_ADMIN_EMAIL="admin@terranova.edu.pe"
BOOTSTRAP_ADMIN_PASSWORD="CambiarPasswordSeguro2026!"
BOOTSTRAP_ADMIN_NAME="Administrador TerraNova"
BOOTSTRAP_CONFIRM=true

# ─── NextAuth ─────────────────────────────────────────────────────────────────
AUTH_SECRET="<genera con openssl rand -hex 32>"
NEXTAUTH_URL="http://localhost:3000"

# ─── E2E ──────────────────────────────────────────────────────────────────────
E2E_RUN_AUTHENTICATED=0
E2E_ADMIN_EMAIL=
E2E_ADMIN_PASSWORD=
```

---

## Checklist de primera instalación

- [ ] Clonar el repositorio
- [ ] Instalar Node.js 20+ y npm 10+
- [ ] Ejecutar `npm install`
- [ ] Copiar `.env.example` a `.env.local`
- [ ] Configurar `DATABASE_URL` (pooler Supabase `:6543`)
- [ ] Configurar `MIGRATION_DATABASE_URL` (conexión directa Supabase `:5432`)
- [ ] Configurar `DEFAULT_NEW_USER_PASSWORD`
- [ ] Configurar `INSTITUTIONAL_EMAIL_DOMAIN`
- [ ] Ejecutar `npx.cmd prisma validate`
- [ ] Ejecutar `npx.cmd prisma generate`
- [ ] Verificar estado de migraciones (ver sección siguiente)
- [ ] Ejecutar `npm run seed`
- [ ] Configurar variables `BOOTSTRAP_*` y ejecutar `npm run bootstrap:admin`
- [ ] Ejecutar `npm run dev`
- [ ] Iniciar sesión en `/login` con las credenciales del ADMIN
- [ ] Crear usuarios institucionales desde `/dashboard/usuarios`

---

## Flujo para base Supabase existente

Para proyectos que ya tienen una base de datos en Supabase con el esquema inicializado:

1. Usar `MIGRATION_DATABASE_URL` con puerto `5432` (Session Pooler o conexión directa).
2. Verificar el estado de migraciones:
   ```bash
   npx.cmd prisma migrate status --schema prisma/schema.prisma
   ```
3. Si el resultado es `Database schema is up to date!`, no se necesita aplicar nada.
4. Si hay migraciones pendientes, aplicarlas con:
   ```bash
   npx.cmd prisma migrate deploy --schema prisma/schema.prisma
   ```
5. **No usar `prisma migrate dev`** contra Supabase remoto.
6. **No usar `prisma migrate reset`** contra Supabase remoto.
7. Si aparece el error `P3005: The database schema is not empty`, detenerse y revisar la estrategia baseline documentada en `docs/arrangements/`.

---

## Advertencia sobre base nueva desde cero

> ⚠️ **El flujo actual está validado exclusivamente para la base Supabase existente del proyecto.**

El baseline `20260524000000_baseline_existing_database` fue creado para regularizar una base pre-existente, **no** como una migración inicial limpia. Puede existir riesgo de duplicidad con migraciones incrementales (especialmente `Section.capacity`) si se intenta aplicar sobre una base completamente vacía.

La instalación desde cero en una base nueva requiere un sprint futuro dedicado a generar una **migración inicial limpia**. No asumir onboarding 100% determinista en base vacía hasta resolver esa fase.

---

## Comandos Prisma por terminal

### Git Bash

```bash
# Cargar variables de entorno
set -a && source .env.local && set +a

# Sustituir DATABASE_URL por la URL de migración directa
export DATABASE_URL="$MIGRATION_DATABASE_URL"

# Comandos Prisma
npx.cmd prisma migrate status --schema prisma/schema.prisma
npx.cmd prisma migrate deploy --schema prisma/schema.prisma
npx.cmd prisma generate
```

### PowerShell

```powershell
# Sustituir DATABASE_URL por la URL de migración directa
$env:DATABASE_URL = $env:MIGRATION_DATABASE_URL

# Comandos Prisma
npx.cmd prisma migrate status --schema prisma/schema.prisma
npx.cmd prisma migrate deploy --schema prisma/schema.prisma
npx.cmd prisma generate
```

> **Importante**: Después de ejecutar migraciones, abrir una terminal nueva o restaurar `DATABASE_URL` al valor original del pooler para que el runtime de la app funcione correctamente.

---

## Prisma y migraciones

- Migraciones versionadas en `prisma/migrations/`
- Flujo recomendado para entornos remotos: `migrate status` → `migrate deploy`
- **No usar `prisma migrate dev` contra Supabase remoto**
- **No usar `prisma migrate reset` contra Supabase remoto**

### Baseline actual

Existe un baseline (`20260524000000_baseline_existing_database`) creado para compatibilizar con la base Supabase existente. No representa una migración inicial limpia para base nueva. Ver sección de advertencia anterior.

---

## Seed base y primer ADMIN

### `npm run seed`

- Crea datos base académicos (año lectivo, niveles, grados, secciones, cursos, conceptos de pago).
- **No crea usuarios reales**.
- **No imprime ni registra contraseñas**.
- Puede ejecutarse varias veces si los datos son idempotentes.

### `npm run bootstrap:admin`

- Crea o actualiza el primer usuario ADMIN del sistema.
- Requiere `BOOTSTRAP_CONFIRM=true` en `.env.local`.
- Usa `BOOTSTRAP_ADMIN_PASSWORD` como contraseña principal.
- Si no se especifica `BOOTSTRAP_ADMIN_PASSWORD`, usa el fallback `DEFAULT_NEW_USER_PASSWORD`.
- **No imprime la contraseña** en ningún output.
- **No usar con contraseñas débiles en entornos de producción.**

---

## Gestión de usuarios

- Solo usuarios con rol `ADMIN` pueden gestionar cuentas desde `/dashboard/usuarios`.
- Los correos deben ser institucionales con el dominio configurado en `INSTITUTIONAL_EMAIL_DOMAIN` (por defecto: `@terranova.edu.pe`).
- El campo **Nombre** no acepta dígitos numéricos.
- La contraseña temporal por defecto al crear un usuario es `DEFAULT_NEW_USER_PASSWORD`.
- Los usuarios pueden ser **activados o desactivados** sin eliminación física.
- `User.active` se valida en:
  - El flujo de login (usuarios inactivos no pueden autenticarse).
  - El layout protegido `/dashboard/*` (usuarios inactivos son redirigidos a `/login` inmediatamente).
- El último ADMIN activo no puede ser desactivado para evitar bloqueo total del sistema.

---

## Tests y calidad

| Comando | Descripción |
|---|---|
| `npm run lint` | ESLint sobre el proyecto |
| `npx.cmd tsc --noEmit` | Verificación de tipos TypeScript |
| `npm run test:run` | Tests unitarios e integración (Vitest) |
| `npm run test:integration` | Solo tests de Server Actions |
| `npm run test:e2e -- --reporter=list` | E2E base (sin autenticación) |
| `npm run test:e2e:auth -- --reporter=list` | E2E autenticado (requiere `E2E_DATABASE_URL` + seed E2E) |
| `npm run build` | Build de producción |

> Algunos tests validan escenarios negativos controlados (errores esperados, rechazos de autorización). Si el output contiene `stderr` pero el resultado final es `passed`, **no es un fallo**.

---

## Guía de validación post-instalación

Después de completar el checklist de instalación, verificar que:

1. `npx.cmd prisma validate` → `The schema is valid 🚀`
2. `npx.cmd prisma migrate status` → `Database schema is up to date!`
3. `npm run dev` levanta sin errores en `http://localhost:3000`
4. `/login` carga correctamente
5. Las credenciales del ADMIN permiten acceder a `/dashboard`
6. `/dashboard/usuarios` muestra la lista de usuarios
7. Los módulos principales responden: `/dashboard/pagos`, `/dashboard/notas`, `/dashboard/asistencia`

---

## Guía para pruebas E2E autenticadas

Los tests E2E autenticados requieren una base de datos aislada:

1. Configurar `E2E_DATABASE_URL` con una base Postgres diferente a la de desarrollo.
2. Aplicar el schema en esa base:
   ```bash
   npx.cmd prisma migrate deploy --schema prisma/schema.prisma
   ```
3. Ejecutar el seed de E2E:
   ```bash
   npm run seed:e2e
   ```
4. Configurar las variables `E2E_ADMIN_EMAIL`, `E2E_ADMIN_PASSWORD`, etc.
5. Habilitar modo autenticado:
   ```env
   E2E_RUN_AUTHENTICATED=1
   ```
6. Ejecutar:
   ```bash
   npm run test:e2e:auth -- --reporter=list
   ```

> Hasta completar ese sprint, los 11 tests autenticados aparecen como `skipped`, lo cual es comportamiento esperado y no un error.

---

## Troubleshooting

### Error: `Cannot find module './xxxx.js'` en `.next`

La caché de compilación está corrompida.

**Git Bash:**
```bash
rm -rf .next && npm run dev
```
**PowerShell:**
```powershell
Remove-Item -Recurse -Force .next
npm run dev
```

---

### `prisma migrate status` se queda colgado indefinidamente

**Causa probable:** `DATABASE_URL` apunta al Transaction Pooler (puerto `6543`) que no admite conexiones DDL.

**Solución:** Usar `MIGRATION_DATABASE_URL` con puerto `5432`. Ver sección *Comandos Prisma por terminal*.

---

### Error `P3005: The database schema is not empty`

No ejecutar `migrate reset`. Revisar la estrategia baseline y la documentación en `docs/arrangements/`.

---

### `PaymentTransaction does not exist` / `User.active column missing`

La base de datos está desactualizada respecto a las migraciones locales.

```bash
npx.cmd prisma migrate status --schema prisma/schema.prisma
npx.cmd prisma migrate deploy --schema prisma/schema.prisma
```

---

### `EADDRINUSE: address already in use :::3000` en E2E

Un servidor local sigue ejecutándose. Cerrar el proceso en el puerto 3000:

**PowerShell:**
```powershell
Stop-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess -Force
```

---

### Tests con `stderr` en output

Algunos tests validan rechazos de autorización o errores controlados. Si el resultado final es `passed`, el `stderr` es esperado y no representa un problema.

---

## Archivos legacy (solo referencia)

- `prisma/seed.sql`: histórico manual, **no usar como flujo operativo**.
- `prisma/init-schema.sql`: snapshot histórico del schema original, **no usar como flujo principal**.

El flujo oficial de onboarding es: **migraciones Prisma** + `npm run seed` + `npm run bootstrap:admin`.

---

## Reglas de seguridad

- **Nunca subir `.env.local`** al repositorio.
- **Nunca incluir contraseñas reales** en README, documentación o comentarios de código.
- **Rotar credenciales** inmediatamente si fueron expuestas en un commit o log.
- **No reactivar `/api/seed`** en ningún entorno expuesto.
- **No ejecutar seeds manuales** que contengan credenciales hardcodeadas.
- **No usar `migrate reset`** contra Supabase remoto.
- **No usar `migrate dev`** contra Supabase remoto.
- `User.active` debe validarse en login **y** en cada request protegido.

---

## Flujo de trabajo con ramas

```
main                        ← rama estable, solo código validado
feature/sprint-XX-desc      ← trabajo activo por sprint
```

**Antes de hacer merge a `main`, validar:**

```bash
npm run lint
npx.cmd tsc --noEmit
npm run test:run
npm run test:integration
npm run test:e2e -- --reporter=list
npm run build
```

**Reglas:**
- No mezclar refactor masivo, migraciones y nuevas features en un mismo sprint.
- No subir `.env.local` bajo ninguna circunstancia.
- Crear un documento en `docs/arrangements/` por cada sprint con bitácora técnica.

---

## Documentación interna

- `README.md` — guía pública principal del proyecto.
- `docs/arrangements/` — bitácora técnica por sprint (ignorada por git, agregar con `git add -f`).
- No crear archivos `.md` sueltos en `docs/` sin justificación técnica documentada.
- Documentos históricos o privados deben permanecer dentro de `docs/arrangements/`.

---

## Que NO hacer

- No reactivar `/api/seed`
- No usar `migrate reset` contra Supabase remoto
- No usar `migrate dev` contra Supabase remoto
- No ejecutar `seed.sql` / `init-schema.sql` como instalación oficial
- No asumir que el baseline reemplaza una migración inicial limpia
- No exponer contraseñas o tokens en código, logs o documentación

---

## Roadmap técnico inmediato

1. **Sprint 18** — E2E autenticado con base aislada (`E2E_DATABASE_URL` + `seed:e2e`).
2. **Migración inicial limpia** — Para soporte de instalación en base nueva desde cero.
3. **Revisión de archivos legacy** — Mover o eliminar `seed.sql` / `init-schema.sql` en sprint dedicado.
4. **Rotación de credenciales** — Credenciales sensibles usadas en diagnósticos históricos.
5. **Hardening previo a despliegue** — Auditoría de seguridad, headers, rate limiting.
6. **CI/CD** — Pipeline automatizado de validación antes de merge a `main`.

---

## Pendientes técnicos

- Definir y ejecutar plan de migración inicial limpia para bases nuevas
- Completar E2E autenticado con infraestructura de base aislada estable
- Rotar credenciales sensibles usadas en diagnósticos históricos
- Mover `seed.sql` / `init-schema.sql` a carpeta `legacy/` en sprint dedicado
