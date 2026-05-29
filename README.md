# TerraNova Academy

Sistema administrativo escolar construido con Next.js App Router, Prisma ORM y PostgreSQL, con enfoque en seguridad operativa, control de acceso por roles, auditoria y pruebas automatizadas.

---

## Estado actual

El proyecto se encuentra estable despues de la integracion de seguridad de login, recuperacion de contrasena y endurecimiento de pruebas autenticadas.

Validaciones recientes:

| Validacion | Resultado |
|---|---|
| `npx.cmd prisma validate` | OK |
| `npm.cmd run lint` | OK, sin warnings |
| `npx.cmd tsc --noEmit` | OK |
| `npm.cmd run test:run` | OK, 209 tests |
| `npm.cmd run test:integration` | OK, 45 tests |
| `npm.cmd run build` | OK |

Notas:

- Los E2E autenticados requieren `E2E_DATABASE_URL` aislada.
- No ejecutar E2E autenticados contra produccion.
- El warning de Prisma sobre `driverAdapters` no bloquea el proyecto y queda como limpieza tecnica futura.

---

## Stack tecnico

- Next.js 14 App Router
- React 18
- TypeScript
- Prisma ORM 7
- PostgreSQL
- NextAuth v5 con Credentials Provider
- bcryptjs
- Zod
- React Hook Form
- Vitest
- Playwright
- Tailwind CSS
- Supabase Storage para uploads
- SMTP con Nodemailer para recuperacion de contrasena

---

## Funcionalidades principales

- Login con NextAuth y credenciales.
- Control de acceso por roles.
- Dashboard protegido.
- Gestion de estudiantes, docentes, cursos, matriculas, asistencia, notas, pagos, reportes, comunicados, incidencias e inhabilitaciones.
- Pagos parciales con transacciones y saldo.
- Auditoria de acciones criticas.
- Seguridad de reportes y uploads.
- Usuarios administrativos con activacion/desactivacion.
- Pruebas unitarias, integracion y E2E.

---

## Seguridad de login

El flujo de autenticacion incluye:

- Contrasena minima de 10 caracteres.
- Boton para ver u ocultar contrasena.
- Mensaje generico para credenciales invalidas.
- Bloqueo temporal por 15 minutos despues de 5 intentos fallidos.
- Contador de intentos restantes.
- Bloqueo aplicado por cuenta, no por dispositivo completo.
- Opcion para ingresar con otra cuenta si una cuenta queda bloqueada.
- Registro de intentos de login en auditoria.
- Proteccion para usuarios inactivos.
- Opcion "Recordar este equipo" con cookie httpOnly y token persistente hasheado.
- Historial de las ultimas 3 contrasenas para impedir reutilizacion.

---

## Recuperacion de contrasena

El flujo profesional de recuperacion esta implementado:

- Pagina publica `/forgot-password`.
- Pagina publica `/reset-password`.
- Token temporal de recuperacion.
- Token almacenado solo como hash.
- Expiracion del enlace en 30 minutos.
- Enlace enviado por correo mediante SMTP.
- No se muestra enlace de desarrollo en UI.
- No se imprime token en logs.
- El correo HTML usa branding de TerraNova Academy.
- Al actualizar la contrasena se muestra confirmacion con redireccion automatica al login.
- La nueva contrasena no puede coincidir con las ultimas 3 contrasenas usadas.

Para que funcione con correo real, se deben configurar las variables SMTP del entorno.

---

## Requisitos previos

- Node.js 20+
- npm 10+
- PostgreSQL accesible
- Base aislada opcional para E2E autenticado
- Proveedor SMTP real para recuperacion de contrasena

---

## Estructura principal

```txt
terranova-academy/
  src/
    app/                 Rutas App Router
    components/          UI compartida y modulos
    lib/                 Auth, acciones, RBAC, auditoria, validaciones
    services/            Servicios puros reutilizables
    types/               Tipos compartidos
  prisma/
    schema.prisma        Modelo de datos
    migrations/          Migraciones versionadas
    seed.ts              Seed base del sistema
  scripts/
    bootstrap-admin.ts   Bootstrap seguro del primer ADMIN
    seed-e2e.ts          Seed aislado para E2E
    run-e2e.mjs          Runner Playwright
  e2e/                   Pruebas Playwright
  docs/arrangements/     Bitacora tecnica por sprint
```

---

## Variables de entorno

Copiar `.env.example` a `.env.local` y completar segun el entorno.

Variables principales:

| Variable | Uso |
|---|---|
| `DATABASE_URL` | Conexion runtime de la app |
| `MIGRATION_DATABASE_URL` | Conexion directa para migraciones |
| `NEXTAUTH_SECRET` o `AUTH_SECRET` | Secreto fuerte de NextAuth |
| `NEXTAUTH_URL` | URL publica de la app |
| `NEXT_PUBLIC_APP_URL` | URL publica usada para enlaces |
| `DEFAULT_NEW_USER_PASSWORD` | Contrasena temporal segura para nuevos usuarios |
| `INSTITUTIONAL_EMAIL_DOMAIN` | Dominio institucional permitido |
| `BOOTSTRAP_ADMIN_EMAIL` | Email del primer ADMIN real |
| `BOOTSTRAP_ADMIN_PASSWORD` | Contrasena del primer ADMIN |
| `BOOTSTRAP_ADMIN_NAME` | Nombre del primer ADMIN |
| `BOOTSTRAP_CONFIRM` | Debe ser `true` para bootstrap |
| `SMTP_HOST` | Host SMTP |
| `SMTP_PORT` | Puerto SMTP |
| `SMTP_USER` | Usuario SMTP |
| `SMTP_PASS` | Password o app password SMTP |
| `PASSWORD_RESET_FROM_EMAIL` | Remitente de recuperacion |
| `E2E_DATABASE_URL` | Base aislada para E2E autenticado |

Ejemplo:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:6543/postgres?pgbouncer=true"
MIGRATION_DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/postgres"

NEXTAUTH_SECRET="genera-un-secreto-fuerte"
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

DEFAULT_NEW_USER_PASSWORD="Terranova2026!"
INSTITUTIONAL_EMAIL_DOMAIN="terranova.edu.pe"

SMTP_HOST=""
SMTP_PORT="587"
SMTP_USER=""
SMTP_PASS=""
PASSWORD_RESET_FROM_EMAIL="TerraNova Academy <no-reply@terranova.edu.pe>"

BOOTSTRAP_ADMIN_EMAIL="admin@terranova.edu.pe"
BOOTSTRAP_ADMIN_PASSWORD="CambiarPasswordSeguro2026!"
BOOTSTRAP_ADMIN_NAME="Administrador TerraNova"
BOOTSTRAP_CONFIRM="true"

E2E_DATABASE_URL=""
E2E_RUN_AUTHENTICATED="0"
```

No subir `.env.local` al repositorio.

---

## Instalacion local

```bash
npm install
npx.cmd prisma validate
npx.cmd prisma generate
npx.cmd prisma migrate status --schema prisma/schema.prisma
npm.cmd run seed
npm.cmd run bootstrap:admin
npm.cmd run dev
```

Luego abrir:

```txt
http://localhost:3000
http://localhost:3000/login
```

---

## Prisma y migraciones

Flujo recomendado:

```bash
npx.cmd prisma migrate status --schema prisma/schema.prisma
npx.cmd prisma migrate deploy --schema prisma/schema.prisma
npx.cmd prisma generate
```

Reglas:

- No usar `prisma migrate reset` contra bases remotas.
- No usar `prisma migrate dev` contra Supabase o bases compartidas.
- Usar `MIGRATION_DATABASE_URL` para migraciones.
- Usar `DATABASE_URL` para runtime de la app.

Migraciones relevantes recientes:

- Campos de lockout en `User`.
- `recoveryEmail` en `User`.
- Modelo `PasswordResetToken`.
- Modelo `PasswordHistory`.
- Modelo `TrustedDeviceToken`.

---

## Seed y bootstrap

### Seed base

```bash
npm.cmd run seed
```

Crea datos academicos base. No debe crear usuarios reales de produccion.

### Bootstrap del primer ADMIN

```bash
npm.cmd run bootstrap:admin
```

Requiere:

```env
BOOTSTRAP_CONFIRM=true
BOOTSTRAP_ADMIN_EMAIL=
BOOTSTRAP_ADMIN_PASSWORD=
BOOTSTRAP_ADMIN_NAME=
```

No imprime contrasenas.

---

## Usuarios y roles

- La administracion de usuarios esta en `/dashboard/usuarios`.
- Solo usuarios con rol autorizado pueden gestionar cuentas.
- El email es unico.
- Los correos administrativos deben respetar el dominio institucional configurado.
- `User.active` permite bloquear usuarios sin borrarlos.
- El ultimo ADMIN activo no debe desactivarse.
- La contrasena temporal por defecto se normaliza para cumplir minimo de seguridad.

Roles principales:

- `ADMIN`
- `DIRECTOR`
- `RECEPCION`
- `CAJA`
- `DOCENTE`
- `COORDINADOR`

---

## Pruebas y calidad

| Comando | Descripcion |
|---|---|
| `npm.cmd run lint` | ESLint |
| `npx.cmd tsc --noEmit` | TypeScript |
| `npm.cmd run test:run` | Tests unitarios |
| `npm.cmd run test:integration` | Tests de Server Actions |
| `npm.cmd run test:coverage` | Cobertura |
| `npm.cmd run test:e2e` | E2E publicos/base |
| `npm.cmd run test:e2e:auth` | E2E autenticados |
| `npm.cmd run build` | Build de produccion |

Los E2E autenticados requieren:

1. `E2E_DATABASE_URL` configurada.
2. Base distinta de `DATABASE_URL`.
3. Base distinta de `MIGRATION_DATABASE_URL`.
4. `npm.cmd run seed:e2e`.
5. Puerto 3000 libre si el runner levanta servidor propio.

---

## Checklist antes de produccion

1. Confirmar `git status --short` limpio.
2. Ejecutar validaciones:

   ```bash
   npm.cmd run lint
   npx.cmd tsc --noEmit
   npm.cmd run test:run
   npm.cmd run test:integration
   npm.cmd run build
   ```

3. Configurar variables de entorno reales.
4. Configurar SMTP real.
5. Aplicar migraciones:

   ```bash
   npx.cmd prisma migrate deploy --schema prisma/schema.prisma
   npx.cmd prisma generate
   ```

6. Ejecutar `npm.cmd run bootstrap:admin`.
7. Verificar que `/api/seed` siga deshabilitado.
8. Probar recuperacion de contrasena con correo real.
9. Probar login por rol.
10. Probar usuarios activos e inactivos.
11. Probar bloqueo por intentos fallidos.
12. Probar dashboard, pagos y reportes con roles autorizados.

---

## Seguridad operativa

- Nunca subir `.env.local`.
- Nunca versionar credenciales reales.
- Nunca imprimir tokens de recuperacion.
- Nunca guardar contrasenas en texto plano.
- Nunca enviar contrasenas por correo.
- Nunca reactivar `/api/seed` en entornos expuestos.
- No correr seeds E2E en produccion.
- No correr Playwright autenticado contra produccion.
- Rotar credenciales si fueron expuestas.

---

## Troubleshooting

### Error de columna faltante en login

Si aparece un error de Prisma como columna inexistente durante login, la base no tiene aplicadas las migraciones recientes.

Ejecutar:

```bash
npx.cmd prisma migrate status --schema prisma/schema.prisma
npx.cmd prisma migrate deploy --schema prisma/schema.prisma
npx.cmd prisma generate
```

### El enlace de recuperacion no llega

Revisar:

- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
- `PASSWORD_RESET_FROM_EMAIL`
- carpeta spam/promociones
- restricciones del proveedor SMTP

### E2E autenticado falla por login

Revisar:

- `E2E_DATABASE_URL` existe.
- `E2E_DATABASE_URL` no es igual a `DATABASE_URL`.
- `E2E_DATABASE_URL` no es igual a `MIGRATION_DATABASE_URL`.
- `npm.cmd run seed:e2e` fue ejecutado.
- Puerto 3000 esta libre.

### Puerto 3000 ocupado

PowerShell:

```powershell
Stop-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess -Force
```

---

## Documentacion interna

- `README.md`: guia principal del proyecto.
- `docs/arrangements/`: bitacora tecnica por sprint.
- Crear o actualizar un documento en `docs/arrangements/` al cerrar cada sprint o bloque de trabajo relevante.
- Si `docs/` esta ignorado por Git, versionar documentos con `git add -f`.

---

## Pendientes recomendados

- Configurar proveedor SMTP real antes de produccion.
- Ejecutar E2E autenticados con base aislada.
- Revisar y limpiar warning de Prisma `driverAdapters`.
- Agregar rate limiting adicional por IP/email.
- Configurar CAPTCHA adaptativo con llaves reales si hay abuso.
- Configurar backups automaticos de PostgreSQL.
- Configurar monitoreo de errores y logs operativos.
- Definir politica operativa de alta, baja y recuperacion de usuarios.

---

## Flujo de ramas

```txt
main                         rama estable
feature/<descripcion>         trabajo activo
```

Antes de integrar a `main`:

```bash
npm.cmd run lint
npx.cmd tsc --noEmit
npm.cmd run test:run
npm.cmd run test:integration
npm.cmd run build
```

Si el cambio toca E2E o autenticacion:

```bash
npm.cmd run test:e2e
npm.cmd run test:e2e:auth
```
