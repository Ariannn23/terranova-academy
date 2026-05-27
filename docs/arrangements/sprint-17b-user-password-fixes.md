# Sprint 17B-Fix — Password flows en usuarios

## Problema detectado

En `/dashboard/usuarios` habia friccion operativa al crear usuarios y al resetear contraseñas:

- No quedaba claro cual era la contraseña temporal inicial.
- El flujo de reset podia no reflejar la nueva contraseña al iniciar sesion.
- El feedback de exito/error era poco explicito para operacion administrativa.

## Causa encontrada

- No existia una contraseña temporal por defecto centralizada para el formulario de alta.
- El modal de reset mezclaba `react-hook-form` con un `hidden input` controlado por `value`, lo que podia desalinear el `userId` enviado en ciertos cambios de estado del modal.
- Los toasts de creacion y reset eran genericos y no informaban claramente el resultado operativo.

## Decision sobre contraseña temporal

Se centralizo la contraseña temporal inicial con variable de entorno:

```env
DEFAULT_NEW_USER_PASSWORD="Terranova2026!"
```

Aplicaciones:

- Alta de usuario en `/dashboard/usuarios` (precarga editable por ADMIN).
- Bootstrap ADMIN como fallback seguro cuando no se define `BOOTSTRAP_ADMIN_PASSWORD`.

## Cambios en creacion de usuario

- `UsersPage` pasa `defaultNewUserPassword` desde entorno al cliente.
- `UserFormModal` precarga `password` con `DEFAULT_NEW_USER_PASSWORD`.
- Se agrega nota visible: contraseña temporal inicial y recomendacion de cambio posterior.
- `createUser()` mantiene hashing con bcrypt y devuelve `temporaryPassword` para feedback de UI.
- Toast de exito ahora muestra email y contraseña temporal usada.
- El correo institucional queda bloqueado por UI con sufijo fijo `@terranova.edu.pe`.
- Si se pega un correo externo, se limpia el dominio y se muestra error de validacion.
- Se agrega boton mostrar/ocultar contraseña inicial con iconos `Eye/EyeOff`.
- `name` ahora valida sin numeros (letras, espacios y caracteres validos en español).

## Cambios en reset de contraseña

- `ResetPasswordModal` ahora envia `userId` de forma explicita al invocar action (sin `hidden input` controlado).
- Se resetea el formulario al abrir/cerrar modal para evitar residuos.
- Toasts mas claros:
  - loading: actualizando contraseña;
  - success: contraseña actualizada correctamente;
  - error: no se pudo actualizar la contraseña.
- `resetUserPassword()` mantiene validacion Zod + hashing bcrypt + update de `passwordHash`.

## Toasts agregados/ajustados

- Crear usuario: mensaje explicito con email y contraseña temporal.
- Reset contraseña: mensajes de loading/success/error con texto operativo claro.

## Tests agregados/actualizados

- `src/lib/actions/__tests__/user.actions.test.ts`
  - `createUser` usa password enviada (`Terranova2026!`) y no fuerza `Credenciales por defecto en seed`.
  - `createUser` acepta correo institucional y rechaza correos externos.
  - `resetUserPassword` actualiza `passwordHash` en `User`.
- `src/lib/validations/__tests__/user.schema.test.ts`
  - acepta nombre sin numeros y rechaza nombre con numeros;
  - acepta correo institucional y rechaza externo;
  - acepta `Terranova2026!` en create/reset;
  - rechaza contraseña vacia;
  - mantiene rechazo de contraseña corta.

## Prueba manual realizada

Pendiente de ejecucion operativa completa con doble sesion para validar:

1. Alta de usuario CAJA con `Terranova2026!`.
2. Login exitoso con contraseña temporal.
3. Reset a `NuevaCaja2026!`.
4. Rechazo con contraseña anterior y acceso con contraseña nueva.
5. Bloqueo por desactivacion y recuperacion tras reactivacion.

Checklist UX/formulario adicional:

1. En "Nuevo usuario", el correo se captura como local-part + sufijo fijo `@terranova.edu.pe`.
2. El nombre rechaza valores con numeros (ejemplo: `Arian123`).
3. La contraseña inicia oculta y puede alternarse con el boton de ojo.
4. El valor temporal por defecto se mantiene en `Terranova2026!`.

## Pendientes

- Ejecutar y registrar evidencia de la prueba manual completa.
- Mantener rotacion de credenciales sensibles en entornos reales.
