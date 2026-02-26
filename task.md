# Tareas Pendientes y Deuda Técnica

Este documento registra los ajustes menores y deuda técnica identificada durante el Code Review de los Sprints B-01 al B-09.

## Code Review Sprints B-01 / B-09

- [ ] **Tipado TypeScript:** Refactorizar las ~45 declaraciones explícitas de `: any` encontradas en los Server Actions de `src/lib/actions/*`.
  - La mayoría están en los bloques `catch (error: any)`. Reemplazar por `catch (error: unknown)` o tipar correctamente si corresponde a `PrismaClientKnownRequestError`.
  - Revisar casos en funciones `.map((x: any))` para aprovechar la inferencia de tipos de Prisma.
- [ ] **Configuración Global:** Extraer el valor hardcodeado `11` (nota mínima aprobatoria) hacia un archivo de configuración o tabla en la base de datos (e.g. `constants.ts` o tabla `Settings`). Ficheros afectados:
  - `src/lib/actions/disability.actions.ts` (Línea 153 aprox.)
  - `src/lib/actions/attendance.actions.ts` (Línea 638 aprox.)

## Tareas Previas Completadas

- Sprint B-09: Generación de PDFs y Reportes completado con éxito.
- Code Review integral del backend superado.
