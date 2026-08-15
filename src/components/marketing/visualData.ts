export const PLAN_PREVIEW = [
  { title: "Funciones cuadráticas", reason: "Tu tema más débil ahora mismo", minutes: 20, level: "danger" as const },
  { title: "Factorización", reason: "4 errores detectados esta semana", minutes: 15, level: "warning" as const },
  { title: "Ecuaciones lineales", reason: "Repaso rápido para mantener el nivel", minutes: 10, level: "success" as const },
];

export const KNOWLEDGE_MAP = [
  { topic: "Funciones", score: 0.42 },
  { topic: "Factorización", score: 0.67 },
  { topic: "Ecuaciones", score: 0.91 },
  { topic: "Polinomios", score: 0.73 },
  { topic: "Geometría", score: 0.88 },
];

export const DIAGNOSTIC_ITEMS = [
  { question: "¿Cuál es el vértice de f(x) = x² − 4x + 3?", correct: true, detail: "Dominas este concepto" },
  { question: "Factoriza x² − 5x + 6", correct: false, detail: "Confundes el signo del término medio" },
  { question: "Resuelve 2x + 3 = 11", correct: true, detail: "Dominas este concepto" },
];

export const TUTOR_CHAT = [
  { role: "user" as const, text: "¿Por qué la derivada de x² es 2x?" },
  { role: "assistant" as const, text: "Buena pregunta — ¿qué pasa si primero desarrollas (x+h)² y ves qué tan rápido crece?" },
];

export function levelFromScore(score: number): "danger" | "warning" | "success" {
  if (score >= 0.7) return "success";
  if (score >= 0.4) return "warning";
  return "danger";
}

// Estos mockups son "capturas de producto": deben verse siempre igual
// (claros), sin adaptarse al modo oscuro del sistema — por eso usan
// colores fijos en vez de los tokens de tema.
export const FIXED_LEVEL_BAR_CLASS: Record<"danger" | "warning" | "success", string> = {
  danger: "bg-[#b3341c]",
  warning: "bg-[#b4790a]",
  success: "bg-[#3f7d52]",
};
