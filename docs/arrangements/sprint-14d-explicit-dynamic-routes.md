# Documentación Sprint 14D — Declaración Explícita de Rutas Dinámicas

## Objetivo del Sprint
Revisar las rutas protegidas del dashboard que generaban logs `DYNAMIC_SERVER_USAGE` durante la ejecución de `npm run build` y declarar explícitamente como dinámicas solo aquellas páginas/layouts que realmente dependen de la sesión, headers, auth, cookies o datos sensibles. Esto reduce el ruido visual en la compilación de producción y clarifica la intención de renderizado dinámico en la intranet de la academia.

## Rama Git Utilizada
`feature/sprint-14d-explicit-dynamic-routes`

## Logs Detectados Inicialmente y Rutas Afectadas
Durante la fase de prerenderizado estático en `npm run build`, Next.js intentaba compilar de forma estática las siguientes rutas, lo que provocaba errores/advertencias de `DYNAMIC_SERVER_USAGE`:
- `/dashboard/calendar` (uso de headers, BD activa)
- `/dashboard/cursos` (uso de headers)
- `/dashboard/notas` (uso de headers y getAcademicStructure)

## Causa Detectada
El layout protegido `src/app/(dashboard)/layout.tsx` utiliza llamadas dinámicas como `headers()` (para leer la URL y proteger el acceso de rol) y `auth()` (para obtener la sesión de NextAuth). Al renderizar cualquier página hija de `/dashboard/*`, Next.js detecta que el layout padre está utilizando estas APIs dinámicas, resultando en advertencias si las subpáginas no están explícitamente declaradas como dinámicas.

## Decisión de Arquitectura: "force-dynamic" en Layout Protegido
Se eligió la **Opción A** del sprint: declarar `export const dynamic = "force-dynamic"` en el layout protegido:
- **`src/app/(dashboard)/layout.tsx`**

**Justificación:**
Dado que la totalidad del árbol `/dashboard/*` es privado y requiere de sesión activa del usuario, lectura de cabeceras de rol y consumo de datos sensibles del backend, es 100% coherente que todas las subrutas hereden la configuración dinámica. Centralizar esto a nivel de layout simplifica el código, evita redundancias ruta por ruta y previene que futuras páginas del dashboard vuelvan a arrojar advertencias.

## Por qué no se tocó el Layout Raíz
El layout raíz (`src/app/layout.tsx`) abarca tanto la intranet privada como la landing pública institucional (`src/app/page.tsx`) y la pantalla de login (`src/app/(auth)/login/page.tsx`). Si declaráramos `force-dynamic` en el layout raíz, habríamos destruido el comportamiento estático de la landing pública, lo cual afectaría negativamente el rendimiento de carga y el SEO de cara al público general. Al acotarlo al layout protegido del grupo `(dashboard)`, mantenemos la landing como página estática optimizada.

---

## Archivos Modificados
* **`[MODIFY]` [layout.tsx](file:///c:/Users/arian/arian/Escritorio/Programacion/Portafolio/terranova-academy/src/app/(dashboard)/layout.tsx)**: Se agregó la exportación `export const dynamic = "force-dynamic";`.

---

## Resultado del Build (Antes vs Después)

### Antes:
- Logs repetidos de `DYNAMIC_SERVER_USAGE` y warnings de compilación de base de datos durante la compilación de `/dashboard/notas`, `/dashboard/calendar` y `/dashboard/cursos`.

### Después:
- Cero logs de `DYNAMIC_SERVER_USAGE`.
- Compilación completamente limpia:
  - Landing pública `/` se compila como **Static (`○`)**.
  - Login `/login` se compila como **Static (`○`)**.
  - Todas las subrutas `/dashboard/*` se compilan directamente como **Dynamic (`ƒ`)** desde el inicio de la recopilación de páginas.

---

## Validaciones Ejecutadas
1. **Linter (`npm run lint`)**: Completado con éxito sin errores.
2. **TypeScript (`npx tsc --noEmit`)**: Compilación limpia.
3. **Pruebas Unitarias (`npm run test:run`)**: 131/131 pruebas aprobadas.
4. **Compilación de Producción (`npm run build`)**: Construido con éxito sin logs de dynamic server usage.

## Pendientes
- Ninguno. Todos los logs de `DYNAMIC_SERVER_USAGE` han sido eliminados de la compilación de producción.
