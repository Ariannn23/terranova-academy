# Sprint 16B - Bootstrap seguro de administrador inicial y usuarios base

## Objetivo

Separar la estrategia de inicializacion de TerraNova Academy para que el seed base, el bootstrap del primer administrador real y el seed E2E tengan responsabilidades distintas y seguras.

## Rama usada

`feature/sprint-16b-production-bootstrap`

## Problema detectado

El seed original `prisma/seed.ts` creaba:

- Un usuario `ADMIN` con email `director@terranova.edu.pe`.
- Una contrasena hardcodeada: `Credenciales por defecto en seed`.
- Anio academico 2025.
- Niveles, grados y secciones.

Ese enfoque es riesgoso antes de produccion porque una credencial hardcodeada puede quedar activa si el seed se ejecuta sobre una base real.

## Diagnostico tecnico

| Punto                         | Estado                                                              |
| ----------------------------- | ------------------------------------------------------------------- |
| `User.role`                   | Campo `String` con default `ADMIN`.                                 |
| Enum de roles en Prisma       | No existe. Los roles viven en `src/lib/rbac.ts`.                    |
| Roles validos                 | `ADMIN`, `DIRECTOR`, `DOCENTE`, `RECEPCION`, `CAJA`, `COORDINADOR`. |
| `/api/seed`                   | Permanece deshabilitado con respuesta 410 Gone.                     |
| Modulo UI para crear usuarios | No identificado en los archivos revisados.                          |

## Cambios realizados

### `prisma/seed.ts`

Se dejo como seed base del sistema.

Ahora crea o asegura:

- Anio academico 2025.
- Niveles, grados y secciones.
- Capacidad explicita `capacity: 30` en secciones.
- Conceptos base de pago: Matricula, Mensualidad y Examen.

Ya no crea usuario administrador ni imprime credenciales.

### `scripts/bootstrap-admin.ts`

Nuevo script para crear o actualizar el primer administrador real.

Requiere:

- `DATABASE_URL`
- `BOOTSTRAP_ADMIN_EMAIL`
- `BOOTSTRAP_ADMIN_PASSWORD`
- `BOOTSTRAP_ADMIN_NAME`
- `BOOTSTRAP_CONFIRM=true`

Caracteristicas:

- Usa bcryptjs.
- Usa `upsert`.
- Asigna rol `ADMIN`.
- No imprime la contrasena.
- Bloquea ejecucion si falta confirmacion o variables requeridas.

### `package.json`

Script agregado:

```bash
npm run bootstrap:admin
```

### `.env.example`

Variables agregadas:

```env
BOOTSTRAP_ADMIN_EMAIL=
BOOTSTRAP_ADMIN_PASSWORD=
BOOTSTRAP_ADMIN_NAME=
BOOTSTRAP_CONFIRM=false
```

## Diferencia entre scripts

| Script                    | Proposito                 | Usuarios creados              | Uso recomendado                                                   |
| ------------------------- | ------------------------- | ----------------------------- | ----------------------------------------------------------------- |
| `npm run seed`            | Datos base del sistema    | Ninguno                       | Desarrollo, staging o produccion controlada para estructura base. |
| `npm run bootstrap:admin` | Primer administrador real | Un `ADMIN` real por variables | Produccion/staging, ejecutado manualmente y con confirmacion.     |
| `npm run seed:e2e`        | Datos para Playwright     | Usuarios `.test` por rol      | Solo base E2E aislada.                                            |

## Comando de bootstrap

PowerShell:

```powershell
$env:BOOTSTRAP_ADMIN_EMAIL="admin@colegio.edu"
$env:BOOTSTRAP_ADMIN_PASSWORD="una-contrasena-segura"
$env:BOOTSTRAP_ADMIN_NAME="Administrador Principal"
$env:BOOTSTRAP_CONFIRM="true"
npm run bootstrap:admin
```

## Politica para otros roles

No se crean automaticamente usuarios reales para:

- `DIRECTOR`
- `RECEPCION`
- `CAJA`
- `DOCENTE`
- `COORDINADOR`

Flujo recomendado:

1. Ejecutar `bootstrap:admin`.
2. Iniciar sesion con el primer ADMIN real.
3. Crear usuarios reales desde el sistema.
4. Asignar roles reales segun operacion escolar.

Como no se identifico un modulo UI de gestion de usuarios, queda como pendiente critico antes de produccion.

## `/api/seed`

Se confirmo que el endpoint sigue deshabilitado:

- Responde 410 Gone.
- No se usa para produccion.
- No se usa para E2E.
- No se reactivo en este sprint.

## Validaciones ejecutadas

- `npx.cmd tsc --noEmit`: aprobado.
- `npm.cmd run lint`: aprobado.
- `npm.cmd run test:run`: 22 archivos, 131 pruebas aprobadas.
- `npm.cmd run test:integration`: 6 archivos, 23 pruebas aprobadas.
- `npm.cmd run test:e2e -- --reporter=list`: 7 pruebas aprobadas, 11 omitidas por falta de base E2E autenticada.
- `npm.cmd run build`: aprobado.

No se ejecuto `npm run bootstrap:admin` porque requiere variables reales, `BOOTSTRAP_CONFIRM=true` y una base controlada.

## Pendientes

- Crear modulo administrativo para gestion de usuarios reales.
- Definir politica de rotacion de credenciales iniciales.
- Ejecutar `bootstrap:admin` solo en ambiente real controlado.
- Documentar procedimiento operativo de alta de usuarios reales.
