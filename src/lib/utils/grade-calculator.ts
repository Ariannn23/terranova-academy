import { MIN_PASSING_SCORE } from "@/lib/constants";

/**
 * Calcula el promedio de un arreglo de notas.
 * Ignora los valores nulos.
 */
export function calculateAverage(scores: (number | null)[]): number | null {
  const validScores = scores.filter(
    (s): s is number => s !== null && s !== undefined,
  );
  if (validScores.length === 0) return null;

  const sum = validScores.reduce((acc, curr) => acc + curr, 0);
  return Number((sum / validScores.length).toFixed(2));
}

/**
 * Determina si una nota es aprobatoria.
 */
export function isPassing(
  score: number | null,
  passingScore: number = MIN_PASSING_SCORE,
): boolean {
  if (score === null) return false;
  return score >= passingScore;
}

/**
 * Calcula la nota final basada en los 4 periodos (P1, P2, P3, P4).
 */
export function calculateFinalScore(
  p1: number | null,
  p2: number | null,
  p3: number | null,
  p4: number | null,
): number | null {
  return calculateAverage([p1, p2, p3, p4]);
}

/**
 * Formatea la nota para visualización (ej: 14.5 -> "14.5", null -> "-")
 */
export function formatScore(score: number | null): string {
  if (score === null || score === undefined) return "-";
  return score.toString();
}
