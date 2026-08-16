// Datos ficticios pero coherentes entre secciones — mismo estudiante
// ("Alex"), mismas materias, mismos números — para que la landing cuente
// una sola historia de producto en vez de ejemplos sueltos por sección.
// Ninguno de estos datos toca funcionalidad real: son solo para las
// visualizaciones de producto de la landing.

export type Level = "success" | "warning" | "danger";

export function levelFromScore(score: number): Level {
  if (score >= 0.7) return "success";
  if (score >= 0.4) return "warning";
  return "danger";
}

// Clases fijas: estos mockups son "capturas de producto" y deben verse
// siempre iguales (claros), sin adaptarse al modo oscuro del sistema.
export const FIXED_LEVEL_BAR_CLASS: Record<Level, string> = {
  danger: "bg-[#a14b36]",
  warning: "bg-[#866327]",
  success: "bg-[#407765]",
};
export const FIXED_LEVEL_TEXT_CLASS: Record<Level, string> = {
  danger: "text-[#a14b36]",
  warning: "text-[#866327]",
  success: "text-[#407765]",
};
export const FIXED_LEVEL_SOFT_BG_CLASS: Record<Level, string> = {
  danger: "bg-[#a14b36]/10",
  warning: "bg-[#866327]/10",
  success: "bg-[#407765]/10",
};

// Knowledge Map
export const KNOWLEDGE_MAP = [
  { topic: "Álgebra", score: 0.92 },
  { topic: "Funciones", score: 0.68 },
  { topic: "Factorización", score: 0.44 },
  { topic: "Ecuaciones", score: 0.81 },
];

// AI Diagnostic
export const DIAGNOSTIC_EXAMPLE = {
  question: "Encuentra las raíces de f(x) = x² − 5x + 6",
  studentAnswer: "x = 2 y x = 4",
  concept: "Factorización",
  domain: 43,
  pattern: "Confusión entre factor común y diferencia de cuadrados.",
  recommendation: "Repasar factorización antes de continuar con funciones.",
};

// Exam Preparation
export const EXAM_PREP = {
  name: "Examen de Cálculo",
  date: "28 de agosto",
  readiness: 78,
  potential: 12,
  focus: "Integrales y Aplicaciones",
  topics: [
    { topic: "Funciones", score: 0.91 },
    { topic: "Derivadas", score: 0.74 },
    { topic: "Integrales", score: 0.53 },
    { topic: "Aplicaciones", score: 0.61 },
  ],
};

// Demo interactiva (elige materia)
export const PLAN_BY_SUBJECT: Record<
  string,
  { title: string; reason: string; minutes: number; level: Level }[]
> = {
  Matemáticas: [
    { title: "Funciones cuadráticas", reason: "Es tu tema más débil ahora mismo", minutes: 20, level: "danger" },
    { title: "Factorización", reason: "4 errores detectados esta semana", minutes: 15, level: "warning" },
    { title: "Ecuaciones lineales", reason: "Repaso rápido para mantener el nivel", minutes: 10, level: "success" },
  ],
  Historia: [
    { title: "Revolución Francesa", reason: "Es tu tema más débil ahora mismo", minutes: 20, level: "danger" },
    { title: "Causas de la Primera Guerra Mundial", reason: "3 errores detectados esta semana", minutes: 15, level: "warning" },
    { title: "Línea de tiempo del siglo XIX", reason: "Repaso rápido para mantener el nivel", minutes: 10, level: "success" },
  ],
  Biología: [
    { title: "Respiración celular", reason: "Es tu tema más débil ahora mismo", minutes: 20, level: "danger" },
    { title: "Mitosis y meiosis", reason: "5 errores detectados esta semana", minutes: 15, level: "warning" },
    { title: "Clasificación de los seres vivos", reason: "Repaso rápido para mantener el nivel", minutes: 10, level: "success" },
  ],
};
