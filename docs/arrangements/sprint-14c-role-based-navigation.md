# Documentación Sprint 14C — Navegación Visual por Rol

## Objetivo del Sprint
Filtrar visualmente la navegación del dashboard según el rol del usuario autenticado, de manera que la **Sidebar** y el componente **QuickAccess** muestren únicamente los accesos a módulos que el rol del usuario tiene permitido utilizar. Esto mejora la UX institucional y sienta las bases para pruebas E2E, sin relajar ni alterar los controles de seguridad del backend.

## Rama Git Utilizada
`feature/sprint-14c-role-based-navigation`

## Diagnóstico Inicial
1. **Obtención del usuario autenticado:** Se obtiene en el backend a través de NextAuth mediante la función `auth()` (en layouts y Server Components) o mediante el hook de cliente `useSession` en componentes de cliente.
2. **Obtención del rol:** El rol del usuario (`role`) se almacena en el token JWT y en la sesión de NextAuth (`session.user.role`), normalizándose mediante las utilidades en `src/lib/rbac.ts`.
3. **Sidebar y usuario:** El componente `<Sidebar />` era un componente de cliente que no recibía información del usuario ni de su rol, por lo que mostraba de manera fija todos los módulos del sistema.
4. **Módulos en Sidebar:** Mostraba 15 módulos sin discriminación de rol.
5. **QuickAccess:** Mostraba 6 botones fijos de accesos rápidos para todos los usuarios.
6. **RBAC reutilizable:** `getAllowedRolesForPath()` y `hasAllowedRole()` de `src/lib/rbac.ts` definen de forma inequívoca qué roles tienen permitido el acceso a cada prefijo de ruta.
7. **Archivos a modificar:**
   - `src/lib/navigation.ts` [NEW]
   - `src/lib/__tests__/navigation.test.ts` [NEW]
   - `src/app/(dashboard)/layout.tsx`
   - `src/app/(dashboard)/_components/Sidebar.tsx`
   - `src/app/(dashboard)/dashboard/page.tsx`
   - `src/components/modules/dashboard/QuickAccess.tsx`
8. **Riesgos:** Ninguno de seguridad real, ya que el middleware y el layout siguen protegiendo las rutas a nivel de servidor. El único riesgo es de consistencia de la UI, el cual mitigamos usando `getAllowedRolesForPath` como fuente de verdad.

---

## Estrategia de Filtrado y Reglas de Negocio

### Configuración de Permisos por Ruta (Filtro Visual)
De acuerdo con las reglas centrales de RBAC, la navegación visual se filtra de la siguiente manera:

* **Inicio (`/dashboard`):** Visible para todos los roles autenticados.
* **Matrículas (`/dashboard/matriculas`):** ADMIN, DIRECTOR, RECEPCION.
* **Estudiantes (`/dashboard/estudiantes`):** ADMIN, DIRECTOR, RECEPCION.
* **Docentes (`/dashboard/docentes`):** ADMIN, DIRECTOR.
* **Cursos (`/dashboard/cursos`):** ADMIN, DIRECTOR, COORDINADOR, DOCENTE.
* **Horarios (`/dashboard/horarios`):** ADMIN, DIRECTOR, COORDINADOR, DOCENTE.
* **Calificaciones (`/dashboard/notas`):** ADMIN, DIRECTOR, COORDINADOR, DOCENTE.
* **Asistencia (`/dashboard/asistencia`):** ADMIN, DIRECTOR, COORDINADOR, DOCENTE.
* **Finanzas/Pagos (`/dashboard/pagos`):** ADMIN, DIRECTOR, CAJA.
* **Calendario (`/dashboard/calendar`):** ADMIN, DIRECTOR, COORDINADOR, DOCENTE.
* **Comunicados (`/dashboard/comunicados`):** ADMIN, DIRECTOR.
* **Inhabilitaciones (`/dashboard/inhabilitaciones`):** ADMIN, DIRECTOR, COORDINADOR.
* **Incidencias (`/dashboard/incidencias`):** ADMIN, DIRECTOR, COORDINADOR.
* **Reportes (`/dashboard/reportes`):** ADMIN, DIRECTOR, COORDINADOR, CAJA.
* **Configuración (`/dashboard/configuracion`):** ADMIN, DIRECTOR.

---

## Archivos Creados y Modificados

### Utilidad Centralizada
* **`[NEW]` [navigation.ts](file:///c:/Users/arian/arian/Escritorio/Programacion/Portafolio/terranova-academy/src/lib/navigation.ts)**: Configuración centralizada de ítems con sus nombres, iconos de Lucide y funciones puras (`canAccessNavigationItem`, `filterNavigationByRole`) para validar el acceso usando el RBAC central como fuente de verdad.

### Sidebar del Dashboard
* **`[MODIFY]` [layout.tsx](file:///c:/Users/arian/arian/Escritorio/Programacion/Portafolio/terranova-academy/src/app/(dashboard)/layout.tsx)**: Recupera el rol de usuario de la sesión de servidor y se lo inyecta como prop al Sidebar.
* **`[MODIFY]` [Sidebar.tsx](file:///c:/Users/arian/arian/Escritorio/Programacion/Portafolio/terranova-academy/src/app/(dashboard)/_components/Sidebar.tsx)**: Acepta `userRole` como prop y filtra los módulos cargados utilizando la función utilitaria `filterNavigationByRole`. Se incluye un comentario explícito aclarando que el filtrado es puramente visual.

### Accesos Rápidos (QuickAccess)
* **`[MODIFY]` [page.tsx](file:///c:/Users/arian/arian/Escritorio/Programacion/Portafolio/terranova-academy/src/app/(dashboard)/dashboard/page.tsx)**: Recupera la sesión en el Server Component y pasa el rol como prop al componente QuickAccess.
* **`[MODIFY]` [QuickAccess.tsx](file:///c:/Users/arian/arian/Escritorio/Programacion/Portafolio/terranova-academy/src/components/modules/dashboard/QuickAccess.tsx)**: Recibe `userRole` y filtra dinámicamente los botones de acceso rápido usando `canAccessNavigationItem`. Se conserva correctamente el link `/dashboard/matriculas/nueva` para los roles de admisión permitidos.

---

## Pruebas Unitarias
Se agregaron pruebas unitarias puras en:
* **`[NEW]` [navigation.test.ts](file:///c:/Users/arian/arian/Escritorio/Programacion/Portafolio/terranova-academy/src/lib/__tests__/navigation.test.ts)**

Casos de prueba cubiertos:
1. **ADMIN** ve módulos administrativos y generales.
2. **DIRECTOR** ve módulos de gestión amplios.
3. **RECEPCION** ve Matrículas, Estudiantes y generales, pero no Finanzas ni Configuración.
4. **CAJA** ve Pagos y Reportes, pero no Calificaciones ni Configuración.
5. **DOCENTE** ve Notas, Asistencia, Horarios y Calendario, pero no Pagos ni Matrículas.
6. **COORDINADOR** ve Incidencias, Inhabilitaciones y Reportes, pero no Configuración.
7. Usuarios sin rol no pueden ver rutas privadas.
8. El enlace `/dashboard/matriculas/nueva` permanece visible solo para los roles de admisión autorizados.

---

## Validaciones Ejecutadas
1. Pruebas unitarias de Vitest: `npm run test:run` -> Todas exitosas.
2. Comprobación de Tipos de TypeScript: `npx tsc --noEmit` -> Compilación limpia.
3. Linter: `npm run lint` -> Aprobado sin errores.
4. Construcción de producción: `npm run build` -> Compilación exitosa.

---

## Pendientes
* Configurar casos de pruebas automatizadas E2E en Playwright para simular el inicio de sesión y comprobar la visibilidad/ocultamiento de elementos del DOM por rol.
