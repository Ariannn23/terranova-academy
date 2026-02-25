// lib/constants.ts — Constantes globales del sistema TerraNova Academy

// ─── Reglas académicas (configurables desde /dashboard/configuracion/reglas) ──
export const MIN_PASSING_SCORE = 11; // Nota mínima de aprobación
export const MAX_ABSENCE_PERCENT = 30; // % máximo de faltas injustificadas
export const RISK_ABSENCE_PERCENT = 20; // % de faltas para alerta crítica
export const OBSERVADO_ABSENCE_PERCENT = 15; // % de faltas para estado OBSERVADO
export const MAX_FAILING_COURSES_INHABILITADO = 0.5; // Ratio: más de la mitad

// ─── Periodos académicos ──────────────────────────────────────────────────────
export const GRADE_PERIODS = ["P1", "P2", "P3", "P4", "FINAL"] as const;

// ─── Niveles educativos ───────────────────────────────────────────────────────
export const SCHOOL_LEVELS = {
  INICIAL: "Inicial",
  PRIMARIA: "Primaria",
  SECUNDARIA: "Secundaria",
} as const;

// ─── Estructura académica (14 secciones = 1 por grado) ───────────────────────
export const GRADE_STRUCTURE = [
  // Nivel Inicial
  { name: "1er Año Inicial", level: "INICIAL", order: 1 },
  { name: "2do Año Inicial", level: "INICIAL", order: 2 },
  { name: "3er Año Inicial", level: "INICIAL", order: 3 },
  // Nivel Primaria
  { name: "1er Grado", level: "PRIMARIA", order: 4 },
  { name: "2do Grado", level: "PRIMARIA", order: 5 },
  { name: "3er Grado", level: "PRIMARIA", order: 6 },
  { name: "4to Grado", level: "PRIMARIA", order: 7 },
  { name: "5to Grado", level: "PRIMARIA", order: 8 },
  { name: "6to Grado", level: "PRIMARIA", order: 9 },
  // Nivel Secundaria
  { name: "1ro Secundaria", level: "SECUNDARIA", order: 10 },
  { name: "2do Secundaria", level: "SECUNDARIA", order: 11 },
  { name: "3ro Secundaria", level: "SECUNDARIA", order: 12 },
  { name: "4to Secundaria", level: "SECUNDARIA", order: 13 },
  { name: "5to Secundaria", level: "SECUNDARIA", order: 14 },
] as const;

// ─── Pagos ────────────────────────────────────────────────────────────────────
export const UPCOMING_PAYMENT_DAYS = 7; // Días antes del vencimiento para alerta

// ─── Storage ─────────────────────────────────────────────────────────────────
export const MAX_PHOTO_SIZE_MB = 5;
export const ALLOWED_PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];

// ─── Colores del semáforo de estado ──────────────────────────────────────────
export const STATUS_COLORS = {
  ACTIVO: { bg: "bg-green-100", text: "text-green-800", label: "Activo" },
  OBSERVADO: {
    bg: "bg-yellow-100",
    text: "text-yellow-800",
    label: "Observado",
  },
  EN_RIESGO: {
    bg: "bg-orange-100",
    text: "text-orange-800",
    label: "En Riesgo",
  },
  INHABILITADO: {
    bg: "bg-red-100",
    text: "text-red-800",
    label: "Inhabilitado",
  },
  RETIRADO: { bg: "bg-gray-100", text: "text-gray-800", label: "Retirado" },
} as const;
