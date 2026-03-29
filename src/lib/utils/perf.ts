/**
 * perf.ts — Wrapper de timing para Server Actions
 *
 * Uso:
 *   export const getEnrollments = withTiming("getEnrollments", async (params) => {
 *     ...
 *   });
 *
 * O para wrappear una función existente en un archivo:
 *   const result = await withTiming("getCriticalAttendance", async () => {
 *     return await originalFn();
 *   })();
 */

const SLOW_ACTION_THRESHOLD_MS = 500;

/**
 * Wrappea una función async y loggea su duración.
 * Si supera SLOW_ACTION_THRESHOLD_MS, emite un warning en consola.
 *
 * @param name  Nombre legible de la acción (aparece en los logs)
 * @param fn    Función async a ejecutar y medir
 */
export async function withTiming<T>(
  name: string,
  fn: () => Promise<T>,
): Promise<T> {
  const start = performance.now();
  try {
    const result = await fn();
    const duration = Math.round(performance.now() - start);

    if (duration > SLOW_ACTION_THRESHOLD_MS) {
      console.warn(`[ACTION TIMING] ⚠ ${name} tardó ${duration}ms`);
    } else if (process.env.NODE_ENV === "development") {
      console.log(`[ACTION TIMING] ${name}: ${duration}ms`);
    }

    return result;
  } catch (error) {
    const duration = Math.round(performance.now() - start);
    console.error(`[ACTION TIMING] ✗ ${name} falló después de ${duration}ms`);
    throw error;
  }
}
