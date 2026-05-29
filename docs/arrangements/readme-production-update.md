# Actualizacion final del README para preparacion de produccion

## Objetivo

Actualizar `README.md` con el estado mas reciente del proyecto TerraNova Academy despues de las mejoras de seguridad de login, recuperacion de contrasena y preparacion operativa para produccion.

## Cambios realizados

- Se reemplazo el README anterior porque tenia contenido desactualizado y caracteres con mojibake.
- Se actualizo el estado de validaciones:
  - `lint`
  - `tsc --noEmit`
  - `test:run`
  - `test:integration`
  - `build`
  - `prisma validate`
- Se documento el flujo actual de seguridad de login.
- Se documento recuperacion de contrasena por token temporal y correo SMTP.
- Se documento historial de ultimas 3 contrasenas.
- Se documento bloqueo temporal por intentos fallidos.
- Se documento "Recordar este equipo" con cookie httpOnly y token hasheado.
- Se agrego checklist antes de produccion.
- Se agrego troubleshooting actualizado para:
  - columnas faltantes por migraciones pendientes;
  - problemas de SMTP;
  - problemas de E2E autenticado;
  - puerto 3000 ocupado.
- Se dejo explicita la regla de documentar cada cierre en `docs/arrangements`.

## Archivos modificados

- `README.md`
- `.gitignore`
- `docs/arrangements/readme-production-update.md`

## Visibilidad de docs

Se quito la regla que ignoraba `/docs/*` para que la carpeta `docs/` pueda versionarse normalmente.

Tambien se reforzaron reglas explicitas para mantener fuera del tracking:

- `.env`
- `.env.local`
- `.next/`
- `node_modules/`
- `coverage/`
- `test-results/`
- `next-env.d.ts`
- `*.tsbuildinfo`

## Validacion

El cambio es documental. Antes de esta actualizacion se habian ejecutado correctamente:

- `npm.cmd run lint`
- `npx.cmd tsc --noEmit`
- `npm.cmd run test:run`
- `npm.cmd run test:integration`
- `npm.cmd run build`
- `npx.cmd prisma validate`

No se modifico codigo de aplicacion, Prisma, RBAC, Server Actions ni UI.

## Pendientes

- Versionar este documento con `git add -f` si `docs/` esta ignorado.
- Configurar SMTP real antes de produccion.
- Ejecutar E2E autenticados con `E2E_DATABASE_URL` aislada antes del despliegue final.
