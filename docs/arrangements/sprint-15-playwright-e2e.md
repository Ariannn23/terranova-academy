# Sprint 15 - Pruebas E2E con Playwright

## Objetivo
Configurar Playwright y crear una primera suite end-to-end para validar navegacion publica, proteccion de rutas privadas, login, navegacion visual por rol y rutas criticas basicas de TerraNova Academy, sin modificar reglas de negocio ni flujos funcionales.

## Rama usada
`feature/sprint-15-playwright-e2e`

## Diagnostico inicial
- No existia configuracion propia de Playwright en el proyecto.
- `package.json` ya tenia pruebas unitarias e integracion con Vitest: `test:run`, `test:integration` y `test:coverage`.
- El seed canonico es `npm run seed` mediante `prisma/seed.ts`.
- El seed disponible solo garantiza usuario ADMIN: `director@terranova.edu.pe`.
- No se identificaron credenciales seed estables para RECEPCION, CAJA, DOCENTE ni COORDINADOR.
- No se uso `/api/seed`, porque fue deshabilitado en Sprint 14E.

## Estrategia E2E
- Se instalo `@playwright/test`.
- Se instalo navegador Chromium para Playwright.
- Se creo `playwright.config.ts` con `baseURL`, screenshots, video y trace en fallos.
- Para evitar que el servidor de Next.js quede colgado en Windows, `npm run test:e2e` usa `scripts/run-e2e.mjs`, que levanta Next, ejecuta Playwright y cierra el proceso del servidor al finalizar.
- Las pruebas autenticadas con datos reales quedan condicionadas por variables `E2E_*` o `E2E_RUN_AUTHENTICATED=1`.
- No se usan credenciales productivas ni base de datos productiva.

## Dependencias instaladas
- `@playwright/test`

## Scripts agregados
- `npm run test:e2e`
- `npm run test:e2e:ui`
- `npm run test:e2e:headed`
- `npm run test:e2e:report`

## Archivos creados
- `playwright.config.ts`
- `scripts/e2e-web-server.mjs`
- `scripts/run-e2e.mjs`
- `e2e/public.spec.ts`
- `e2e/auth.spec.ts`
- `e2e/dashboard-navigation.spec.ts`
- `e2e/role-navigation.spec.ts`
- `e2e/payments-routes.spec.ts`
- `e2e/fixtures/users.ts`
- `e2e/utils/login.ts`
- `e2e/utils/selectors.ts`

## Archivos modificados
- `package.json`
- `package-lock.json`
- `.gitignore`

## Pruebas creadas
### Landing publica
- Carga `/`.
- Muestra TerraNova Academy y acceso a intranet.
- El boton superior navega a `/login`.
- La navegacion publica expone Inicio, Nuestra Propuesta, Admision y Contacto.
- Los formularios visuales no navegan ni rompen la pagina.

### Autenticacion y proteccion
- Usuario sin sesion en `/dashboard` redirige a `/login`.
- Usuario sin sesion en `/dashboard/pagos` redirige a `/login`.
- Login invalido permanece en `/login`.
- Login ADMIN queda preparado, pero omitido si no hay base E2E configurada.

### Navegacion por rol
- Casos preparados para RECEPCION, CAJA, DOCENTE, COORDINADOR y ADMIN.
- Se omiten si no existen credenciales E2E por rol.

### Rutas de pagos
- Caso preparado para `/dashboard/pagos` y `/dashboard/pagos/vencidos`.
- Se omite si no hay credenciales ADMIN contra base E2E.
- Historial por matricula queda pendiente porque requiere matricula seed estable.

## Pruebas omitidas y motivo
| Caso | Motivo |
|---|---|
| Login ADMIN real | Requiere base E2E sembrada y credenciales explicitas o `E2E_RUN_AUTHENTICATED=1`. |
| Navegacion por rol RECEPCION/CAJA/DOCENTE/COORDINADOR | No hay credenciales seed estables para esos roles. |
| RBAC manual por rol | Depende de credenciales E2E por rol. |
| Rutas autenticadas de pagos | Requieren credenciales ADMIN/CAJA contra una base E2E. |
| Historial de pagos por matricula | Requiere matricula seed estable y estrategia de setup/teardown. |

## Validaciones ejecutadas
- `npm.cmd run lint`: aprobado sin warnings ni errores.
- `npx.cmd tsc --noEmit`: aprobado.
- `npm.cmd run test:run`: 22 archivos, 131 pruebas aprobadas.
- `npm.cmd run test:integration`: 6 archivos, 23 pruebas aprobadas.
- `npm.cmd run test:e2e -- --reporter=list`: 7 pruebas aprobadas, 11 omitidas de forma justificada.
- `npm.cmd run test:coverage`: aprobado; cobertura global aproximada 42.48% statements, 45.36% branches, 48.72% functions, 42.70% lines.
- `npm.cmd run build`: aprobado.

Observacion no bloqueante:
- Vitest muestra un aviso informativo sobre `vite-tsconfig-paths`, indicando que Vite ya soporta resolucion nativa de paths mediante `resolve.tsconfigPaths`.
- Durante E2E, Next.js muestra avisos de cache de webpack (`Unable to snapshot resolve dependencies`). No bloquean la ejecucion ni generan fallos de pruebas.

## Resultado E2E
Resultado actual:
- 7 pruebas pasaron.
- 11 pruebas omitidas de forma justificada.
- 0 fallos.

## Pendientes para Sprint 16
- Definir una base E2E aislada.
- Crear usuarios seed por rol: ADMIN, RECEPCION, CAJA, DOCENTE y COORDINADOR.
- Crear datos seed estables para matriculas, pagos, notas y asistencia.
- Activar pruebas autenticadas por rol.
- Agregar flujos mutantes con setup/teardown: crear estudiante, matricular, registrar pago, registrar asistencia e incidencias.
