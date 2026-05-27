# Sprint 14A — Correccion minima de rutas y landing institucional antes de E2E

## Objetivo

Corregir hallazgos minimos detectados en la auditoria de `src/app` que podian afectar navegacion, pruebas E2E o experiencia del usuario, sin modificar estructura de rutas, RBAC, Prisma, auditoria, Server Actions ni reglas de negocio.

## Rama usada

`feature/sprint-14a-app-routes-navigation-fixes`

Nota: no se identifico una rama local `develop`. La rama del sprint se creo desde `feature/sprint-13-final-any-cleanup`, que estaba limpia y alineada con `origin/feature/sprint-13-final-any-cleanup`.

## Diagnostico inicial

| Punto revisado | Estado encontrado |
| --- | --- |
| Link de nueva matricula en QuickAccess | Apuntaba a `/dashboard/matriculas/registrar`, ruta no existente. |
| `src/app/page.tsx` | Mostraba la plantilla inicial de Next.js. |
| Catch-all del dashboard | Renderizaba la pantalla local de "Modulo en Construccion", lo que podia ocultar rutas rotas. |
| Sidebar | Muestra todos los modulos sin filtrar por rol; se mantiene para Sprint 14B. |
| `DYNAMIC_SERVER_USAGE` | Se mantiene para Sprint 14C. |

## Hallazgos corregidos

### Link de nueva matricula

Archivo modificado:

- `src/components/modules/dashboard/QuickAccess.tsx`

Cambio aplicado:

```text
/dashboard/matriculas/registrar -> /dashboard/matriculas/nueva
```

No se modificaron textos, iconos ni estructura visual del bloque de accesos rapidos.

### Landing institucional en `/`

Archivo modificado:

- `src/app/page.tsx`

Se reemplazo la plantilla inicial de Next.js por una landing institucional simple de TerraNova Academy.

Contenido agregado:

- Header superior con identidad textual y logo interno.
- Boton visible hacia `/login` con texto "Iniciar sesion".
- Hero institucional con descripcion de la plataforma escolar.
- Bloques de beneficios para gestion academica, matriculas, pagos/reportes y comunicacion escolar.
- Seccion final con boton de ingreso al sistema.

Restricciones respetadas:

- No usa `auth()`.
- No consulta backend.
- No usa Prisma.
- No usa Server Actions.
- No agrega dependencias.
- No cambia `/login`.
- No usa imagenes externas.

### Catch-all del dashboard

Archivos modificados:

- `src/app/(dashboard)/dashboard/[...catchAll]/page.tsx`
- `src/app/(dashboard)/dashboard/not-found.tsx`

Decision aplicada:

- El catch-all ahora llama a `notFound()`.
- El mensaje local dejo de decir "Modulo en Construccion" y ahora comunica "Ruta no encontrada o modulo no habilitado".

Esto ayuda a que pruebas E2E detecten rutas incorrectas con mayor claridad.

## Archivos modificados

- `src/app/page.tsx`
- `src/app/(dashboard)/dashboard/[...catchAll]/page.tsx`
- `src/app/(dashboard)/dashboard/not-found.tsx`
- `src/components/modules/dashboard/QuickAccess.tsx`
- `docs/arrangements/app-folder-structure-audit.md`
- `docs/arrangements/sprint-14a-app-routes-navigation-fixes.md`

## Pendientes

| Sprint futuro | Pendiente |
| --- | --- |
| Sprint 14B | Filtrar visualmente Sidebar y QuickAccess segun rol. |
| Sprint 14C | Declarar rutas dinamicas explicitas para reducir logs `DYNAMIC_SERVER_USAGE`. |
| Sprint 14D | Revisar `/api/seed`, rutas no enlazadas y posibles carpetas/rutas heredadas. |

## Validaciones ejecutadas

| Comando | Resultado |
| --- | --- |
| `npm.cmd run lint` | Correcto, sin warnings ni errores. |
| `npx.cmd tsc --noEmit` | Correcto. |
| `npm.cmd run test:run` | Correcto, 21 archivos y 122 pruebas. |
| `npm.cmd run test:integration` | Correcto, 6 archivos y 23 pruebas. |
| `npm.cmd run test:coverage` | Correcto. Coverage global: statements 42.16%, branches 44.86%, functions 48.06%, lines 42.45%. |
| `npm.cmd run build` | Correcto. Mantiene logs conocidos `DYNAMIC_SERVER_USAGE`, pendientes para Sprint 14C. |

## Pruebas manuales sugeridas

1. Entrar a `/` y confirmar que se muestra la landing institucional de TerraNova Academy.
2. Confirmar que el boton superior "Iniciar sesion" navega a `/login`.
3. Desde el dashboard, usar el acceso rapido "Nueva Matricula" y confirmar que abre `/dashboard/matriculas/nueva`.
4. Entrar a `/dashboard/ruta-inventada` y confirmar que muestra una pantalla clara de ruta no encontrada o modulo no habilitado.
5. Entrar a `/dashboard/matriculas/registrar` y confirmar que ya no esta enlazada y cae en el fallback claro.
