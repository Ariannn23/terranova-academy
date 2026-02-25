import { StudentStatus } from "@prisma/client";

/**
 * Calcula el estado del estudiante (semáforo) basado en su rendimiento y asistencia.
 * Según MASTER.md sección 6.1
 */
export function calculateStudentStatus(
  attendancePercent: number,
  failingCourses: number,
  totalCourses: number,
  average: number,
): StudentStatus {
  const failingRatio = failingCourses / totalCourses;

  // 1. Inhabilitado: Faltas > 30% OR jalando > 50% de cursos
  if (attendancePercent < 70 || failingRatio > 0.5) return "INHABILITADO";

  // 2. Evaluamos otros estados de alerta
  if (attendancePercent < 85 || failingCourses >= 3 || average < 11) {
    // Redundancia protectora según MASTER.md
    if (attendancePercent < 70 || failingRatio > 0.5) return "INHABILITADO";

    // En Riesgo: Jalando 3+ cursos OR asistencia < 70% (aunque < 70 ya es inhabilitado arriba)
    if (failingCourses >= 3 || attendancePercent < 70) return "EN_RIESGO";

    // Observado: Promedio < 11 OR asistencia < 85%
    return "OBSERVADO";
  }

  return "ACTIVO";
}
