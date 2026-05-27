# Documentación Sprint 14E — Limpieza de Rutas Auxiliares y Endpoint Seed

## Objetivo del Sprint
Revisar y limpiar de forma controlada rutas no usadas, rutas auxiliares sin enlace visible y el endpoint temporal `/api/seed`, sin romper navegación, seguridad, RBAC ni flujos existentes.

## Rama Git Utilizada
`feature/sprint-14e-route-cleanup-seed-review`

---

## Diagnóstico Inicial

### 1. Estado de `/api/seed`

**¿Qué hace?**
Es un Route Handler HTTP (GET) que ejecuta la lógica de inicialización de la base de datos: crea el usuario admin, el año lectivo 2025 y los niveles/grados/secciones correspondientes usando Prisma.

**¿Protecciones existentes?**
- Guard `NODE_ENV === "production"` → devolvía 403 en producción.
- Guard `SEED_TOKEN` → requería query param secreto.

**¿Tiene alternativa?**
Sí. Existe `prisma/seed.ts` con lógica equivalente y más detallada, registrado como script oficial: `npm run seed` (en `package.json`). Este es el mecanismo canónico de seed del proyecto.

**¿Referenciado desde la UI, scripts o docs?**
No. La búsqueda exhaustiva en `src/` no encontró ningún enlace, llamada fetch ni referencia desde componentes, hooks, tests ni documentación que apunte a `/api/seed`.

**Riesgos de mantenerlo activo:**
Un Route Handler HTTP de seed expone un vector de ataque si el `SEED_TOKEN` llegara a filtrarse o si se olvidara actualizar los guards antes de producción. Al existir una alternativa de CLI (`npm run seed`) más segura y completa, mantener el endpoint activo no aporta valor.

**Decisión: DESHABILITAR — Opción C (endpoint permanentemente inhabilitado, responde 410 Gone)**

Justificación:
- Existe alternativa canónica: `npm run seed` (`prisma/seed.ts`).
- El endpoint no está referenciado desde ninguna UI, test ni script.
- La lógica de seed no debe exponerse como endpoint HTTP por razones de seguridad pre-producción.
- Se devuelve 410 (Gone) con mensaje claro que señala el script alternativo.

---

### 2. Estado de `/dashboard/pagos/vencidos`

**¿Qué hace?**
Página funcional que lista estudiantes con cuotas en estado de morosidad, usando `getOverduePayments()` y renderizando `OverduePaymentsClient`.

**¿Tiene enlace visible desde la UI?**
**No.** La búsqueda exhaustiva no encontró ningún `Link`, `router.push` ni referencia a `/dashboard/pagos/vencidos` en el código fuente. Solo es accesible sabiendo la URL exacta.

**¿Es funcional?**
Sí. Tiene metadata, Server Component, lógica de carga, y Client Component completo con exportación CSV.

**Riesgo de eliminar:** Alto — es funcionalidad de negocio relevante para CAJA/ADMIN.
**Riesgo de mantener sin enlace:** UX degradada, ruta inaccesible en práctica.

**Decisión: MANTENER y AGREGAR ENLACE — Opción A**

Se agregó botón "Ver Vencidos" en `PaymentsDashboardClient` (módulo de Finanzas/Pagos), que es el punto de entrada natural para esta ruta.

---

### 3. Estado de `/dashboard/pagos/[matriculaId]`

**¿Qué hace?**
Página de historial financiero individual por matrícula. Recibe `matriculaId`, obtiene datos de `getEnrollmentById()` y renderiza `StudentPaymentHistory` con cronograma de cuotas, estados (PAGADO/PENDIENTE/VENCIDO) y botones para procesar pagos pendientes.

**¿Tiene enlace visible desde la UI?**
**No.** La búsqueda exhaustiva no encontró ningún link dinámico a `/dashboard/pagos/${id}` desde ningún componente. Solo `StudentPaymentHistory` mismo usa `router.back()` para volver desde esta ruta, confirmando que era accesible pero no tenía punto de entrada.

**¿Es funcional?**
Sí. Tiene metadata, manejo de `notFound()`, lógica de carga completa y componente `StudentPaymentHistory` con timeline visual completo.

**Riesgo de eliminar:** Alto — es funcionalidad clave del flujo financiero (historial de cuotas por estudiante).
**Riesgo de mantener sin enlace:** UX degradada, ruta inaccesible en práctica.

**Decisión: MANTENER y AGREGAR ENLACE — Opción A**

Se agregó botón "Historial de Pagos" en `EnrollmentDetailsClient`, que es el punto de entrada natural para ver el detalle financiero de una matrícula específica.

---

## Rutas Confirmadas como Principales

| Ruta | Estado | Tipo | Enlace desde |
|---|---|---|---|
| `/dashboard` | ✅ Activa | Principal | Sidebar, QuickAccess, navbar |
| `/dashboard/matriculas` | ✅ Activa | Principal | Sidebar, QuickAccess |
| `/dashboard/estudiantes` | ✅ Activa | Principal | Sidebar |
| `/dashboard/docentes` | ✅ Activa | Principal | Sidebar |
| `/dashboard/cursos` | ✅ Activa | Principal | Sidebar |
| `/dashboard/horarios` | ✅ Activa | Principal | Sidebar |
| `/dashboard/notas` | ✅ Activa | Principal | Sidebar |
| `/dashboard/asistencia` | ✅ Activa | Principal | Sidebar, QuickAccess |
| `/dashboard/pagos` | ✅ Activa | Principal | Sidebar, QuickAccess |
| `/dashboard/pagos/registrar` | ✅ Activa | Secundaria | PaymentsDashboardClient, OverduePaymentsClient |
| `/dashboard/incidencias` | ✅ Activa | Principal | Sidebar |
| `/dashboard/inhabilitaciones` | ✅ Activa | Principal | Sidebar |
| `/dashboard/reportes` | ✅ Activa | Principal | Sidebar, QuickAccess |
| `/dashboard/comunicados` | ✅ Activa | Principal | Sidebar |
| `/dashboard/configuracion` | ✅ Activa | Principal | Sidebar |
| `/dashboard/calendar` | ✅ Activa | Principal | Sidebar |

## Rutas Secundarias/Detalle Confirmadas

| Ruta | Estado | Decisión |
|---|---|---|
| `/dashboard/pagos/vencidos` | ✅ Activa + Enlace agregado | Mantener con enlace desde Pagos |
| `/dashboard/pagos/[matriculaId]` | ✅ Activa + Enlace agregado | Mantener con enlace desde Detalle de Matrícula |
| `/dashboard/matriculas/[id]` | ✅ Activa | Enlace desde EnrollmentsClient |
| `/dashboard/estudiantes/[id]` | ✅ Activa | Enlace desde Directorio |
| `/dashboard/notas/[matriculaId]` | ✅ Activa | Enlace desde Detalle Matrícula |
| `/dashboard/asistencia/[matriculaId]` | ✅ Activa | Enlace desde Detalle Matrícula |
| `/dashboard/incidencias/[id]` | ✅ Activa | Enlace desde lista de incidencias |
| `/dashboard/inhabilitaciones/[id]` | ✅ Activa | Enlace desde lista de inhabilitaciones |

---

## Archivos Modificados

* **`[MODIFY]` [seed/route.ts](file:///c:/Users/arian/arian/Escritorio/Programacion/Portafolio/terranova-academy/src/app/api/seed/route.ts)**: Inhabilitado permanentemente con respuesta 410 Gone. Lógica eliminada. Imports innecesarios eliminados.
* **`[MODIFY]` [PaymentsDashboardClient.tsx](file:///c:/Users/arian/arian/Escritorio/Programacion/Portafolio/terranova-academy/src/components/modules/payments/PaymentsDashboardClient.tsx)**: Agregado botón "Ver Vencidos" que enlaza a `/dashboard/pagos/vencidos`.
* **`[MODIFY]` [EnrollmentDetailsClient.tsx](file:///c:/Users/arian/arian/Escritorio/Programacion/Portafolio/terranova-academy/src/components/modules/enrollments/EnrollmentDetailsClient.tsx)**: Agregado botón "Historial de Pagos" que enlaza a `/dashboard/pagos/${enrollment.id}`.

---

## Validaciones Ejecutadas
1. **Linter (`npm run lint`)**: Aprobado sin errores.
2. **TypeScript (`npx tsc --noEmit`)**: Compilación limpia.
3. **Pruebas unitarias (`npm run test:run`)**: Todas aprobadas.
4. **Compilación de producción (`npm run build`)**: Exitosa.

## Pendientes
- Confirmar que la ruta `/dashboard/comunicados` tiene un enlace desde algún flujo de creación (no revisado en este sprint por estar fuera del alcance).
- Revisar en sprint futuro si `catch-all /dashboard/[...catchAll]` cubre bien todos los casos de rutas inexistentes.
- Agregar cobertura E2E (Playwright) para verificar que todos los enlaces funcionen con datos reales de prueba.
