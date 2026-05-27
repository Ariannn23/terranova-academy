# Guía de instalación del proyecto Terranova Academy

## Descripción breve

**Terranova Academy** es una aplicación web para la gestión académica y administrativa de una institución educativa. Está construida con **Next.js 14**, **Prisma** y **PostgreSQL** (habitualmente hospedado en **Supabase**). Incluye autenticación con **NextAuth**, validaciones con **Zod** y pruebas end-to-end con **Playwright**.

Esta guía describe cómo clonar el repositorio, configurar el entorno local y ejecutar el proyecto en desarrollo.

---

## Requisitos previos

Antes de instalar, asegúrate de contar con:

| Requisito | Notas |
|-----------|--------|
| **Node.js** | Versión **20 LTS** o superior (recomendado **22.x**, compatible con el stack actual del proyecto). |
| **npm** | Incluido con Node.js. En Windows PowerShell, si `npm.ps1` está bloqueado, usa `npm.cmd`. |
| **Git** | Para clonar y trabajar con ramas. |
| **Acceso al repositorio** | Permisos de lectura (y escritura si vas a contribuir). |
| **PostgreSQL / Supabase** | Una base de datos accesible por URL de conexión. |
| **Variables de entorno** | Archivo `.env.local` (no se versiona en Git). |
| **Playwright (opcional)** | Solo si ejecutarás E2E locales; los navegadores se instalan con `npx playwright install` si hace falta. |

---

## Clonar el repositorio

```bash
git clone <URL_DEL_REPOSITORIO>
cd terranova-academy
```

Sustituye `<URL_DEL_REPOSITORIO>` por la URL HTTPS o SSH de tu remoto (por ejemplo, en GitHub).

---

## Instalar dependencias

Desde la raíz del proyecto:

```bash
npm install
```

Los scripts del proyecto están definidos en `package.json` (`dev`, `build`, `test:run`, `test:e2e`, etc.).

---

## Configurar variables de entorno

Crea un archivo **`.env.local`** en la raíz del proyecto (puedes copiar la plantilla desde `.env.example` y completar los valores).

**No subas `.env.local` a Git.** No compartas secretos en issues, chats ni documentación.

### Ejemplo (valores ficticios)

```env
DATABASE_URL="postgresql://USUARIO:PASSWORD@HOST:PUERTO/DB"
MIGRATION_DATABASE_URL="postgresql://USUARIO:PASSWORD@HOST:PUERTO/DB"
E2E_DATABASE_URL="postgresql://USUARIO:PASSWORD@HOST:PUERTO/DB_E2E"

NEXTAUTH_SECRET="CAMBIAR_EN_LOCAL"
NEXTAUTH_URL="http://localhost:3000"

NEXT_PUBLIC_SUPABASE_URL="https://PROJECT_REF.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="ANON_KEY"
SUPABASE_SERVICE_ROLE_KEY="SERVICE_ROLE_KEY"
```

### Significado de las bases de datos

| Variable | Uso |
|----------|-----|
| `DATABASE_URL` | Base principal / local de **desarrollo** en runtime. |
| `MIGRATION_DATABASE_URL` | Base usada para **aplicar migraciones** de Prisma (`migrate deploy`). |
| `E2E_DATABASE_URL` | Base **aislada** exclusiva para pruebas E2E autenticadas (Playwright). |

**Importante:** `E2E_DATABASE_URL` debe ser **distinta** de `DATABASE_URL` y de `MIGRATION_DATABASE_URL`. Los scripts `seed:e2e` y `test:e2e:auth` abortan si detectan que apuntan a la misma base, para evitar borrar o contaminar datos de desarrollo.

Consulta también `.env.example` para variables de bootstrap de administrador y credenciales E2E por rol.

---

## Validar Prisma

Comprueba que el esquema es válido y genera el cliente:

**Windows (CMD / PowerShell):**

```bash
npx.cmd prisma validate
npx.cmd prisma generate
```

**Git Bash / Linux / macOS:**

```bash
npx prisma validate
npx prisma generate
```

---

## Migraciones

Para aplicar el historial de migraciones en una base configurada (por ejemplo, usando `MIGRATION_DATABASE_URL` o temporalmente `DATABASE_URL` según tu flujo):

```bash
npx.cmd prisma migrate deploy --schema prisma/schema.prisma
```

En Git Bash:

```bash
npx prisma migrate deploy --schema prisma/schema.prisma
```

### Advertencias

- **No ejecutar migraciones destructivas en bases de producción** sin respaldo y plan de rollback.
- **No usar `prisma migrate reset`** en bases compartidas o de producción: borra datos.
- `migrate reset` solo es aceptable en bases **temporales** locales cuando entiendes que se perderá todo el contenido.
- Si una migración falla por una columna que ya existe, revisa que las migraciones idempotentes del repositorio estén aplicadas (por ejemplo, columnas añadidas con `IF NOT EXISTS` cuando la baseline ya las incluye).

---

## Ejecutar en desarrollo

**Windows:**

```bash
npm.cmd run dev
```

**Git Bash / Linux / macOS:**

```bash
npm run dev
```

La aplicación suele quedar disponible en [http://localhost:3000](http://localhost:3000).

---

## Build de producción

Verifica que el proyecto compila correctamente:

```bash
npm.cmd run build
```

o:

```bash
npm run build
```

Para servir el build localmente:

```bash
npm run start
```

---

## Problemas comunes

### PowerShell bloquea `npm.ps1`

Ejecuta los comandos con el ejecutable de npm para Windows:

```bash
npm.cmd install
npm.cmd run dev
```

### Falta `E2E_DATABASE_URL`

Los tests autenticados y `seed:e2e` requieren esta variable. Créala en `.env.local` y carga el archivo en tu terminal antes de ejecutar los scripts (ver `docs/guia-testeos.md`).

### `E2E_DATABASE_URL` igual a `DATABASE_URL` o `MIGRATION_DATABASE_URL`

Corrige las URLs para que cada variable apunte a una base distinta. Los scripts de protección rechazan la ejecución si coinciden.

### Error de migración por columna existente

Suele ocurrir cuando la baseline ya define una columna y una migración posterior intenta crearla de nuevo. Revisa el historial en `prisma/migrations/` y confirma que las migraciones recientes son idempotentes (`ADD COLUMN IF NOT EXISTS`, etc.).

### Prisma no encuentra el esquema

Ejecuta los comandos desde la raíz del proyecto y usa `--schema prisma/schema.prisma` cuando aplique.

---

## Siguiente paso

Para ejecutar pruebas unitarias, de integración y E2E, consulta **[Guía de testeos y validaciones](./guia-testeos.md)**.
