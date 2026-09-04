// Catálogo de eventos de producto. Único lugar donde se declaran: si un
// evento no está aquí, no se puede mandar (el tipo de `track` lo impide).
//
// Por qué un catálogo y no strings sueltos: la analítica se pudre por
// deriva de nombres. `diagnostic_completed`, `diagnosticCompleted` y
// `completed_diagnostic` como tres eventos distintos son tres embudos rotos
// que nadie nota hasta que ya perdiste el mes de datos.
//
// REGLA DE PRIVACIDAD (esto es un producto con menores):
// ninguna propiedad puede llevar texto escrito por una persona ni nada que
// identifique. Prohibido: nombres, correos, @usuarios, nombres de materia o
// de grupo, mensajes del tutor, títulos de tarea. Permitido: enums cerrados,
// conteos, cubetas. El `distinct_id` es el UUID del usuario y nada más.

// Cubetas en vez de valores crudos donde el número exacto no aporta al
// análisis pero sí engorda la huella de datos.
export type ScoreBucket = "0-20" | "21-40" | "41-60" | "61-80" | "81-100";
export type SizeBucket = "<1MB" | "1-5MB" | "5-15MB" | ">15MB";

export type PlanTier = "FREE" | "PAID";

// Las tres operaciones que pueden toparse contra un límite de plan. Es el
// evento más importante del catálogo: es la única señal de dónde la gente
// choca con el muro de pago, y sin él la decisión de precio es a ciegas.
export type PaywallFeature = "diagnostic" | "tutor_message" | "voice";

export interface EventProperties {
  // --- Activación: del registro al primer valor real -------------------
  signup_completed: { method: "password" | "google" };
  onboarding_completed: {
    has_admission_target: boolean;
    subjects_count: number;
    referred: boolean;
  };
  diagnostic_started: { subject_kind: "admission" | "custom" };
  diagnostic_completed: { score_bucket: ScoreBucket; questions_answered: number };
  // El momento "ajá" del producto: la primera vez que el estudiante ve un
  // plan hecho para él. Todo el embudo de arriba existe para llegar aquí.
  study_plan_generated: { items_count: number; is_first: boolean };

  // --- Hábito: lo que separa a quien vuelve de quien no ----------------
  study_plan_item_completed: { plan_items_total: number };
  tutor_message_sent: { mode: string; has_custom_tutor: boolean };
  tutor_wrapup_generated: Record<string, never>;
  material_uploaded: { size_bucket: SizeBucket };

  // --- Micro-diagnóstico: el embudo del hero ---------------------------
  // Nunca se manda el texto de la respuesta. Lo que un estudiante escribe
  // sobre lo que no sabe no tiene por qué salir del navegador; la longitud
  // basta para ver dónde abandona.
  subject_selected: { subject: string };
  answer_submitted: { subject: string; answer_length: number };
  // El evento del embudo: cuántos llegan al momento de valor.
  measurement_shown: { subject: string; score_bucket: ScoreBucket };
  demo_error: { stage: "question" | "measure"; kind: string };
  // La pregunta que decide el rumbo del producto: ¿convierte mejor quien
  // salió bajo o quien salió alto? Si es bajo, ver el hueco motiva y la
  // tesis funciona. Si es alto, la gente compra por orgullo y hay que
  // replantear el encuadre.
  signup_from_demo: { subject: string; score_bucket: ScoreBucket };

  // --- Monetización ---------------------------------------------------
  paywall_hit: { feature: PaywallFeature; plan: PlanTier };
  upgrade_clicked: { source: string };

  // --- Bucles de crecimiento -------------------------------------------
  referral_converted: { rewarded: boolean };
  group_joined: { via: "code" | "created" };
  friend_request_sent: Record<string, never>;
}

export type EventName = keyof EventProperties;

export function scoreBucket(score01: number): ScoreBucket {
  const pct = Math.round(Math.max(0, Math.min(1, score01)) * 100);
  if (pct <= 20) return "0-20";
  if (pct <= 40) return "21-40";
  if (pct <= 60) return "41-60";
  if (pct <= 80) return "61-80";
  return "81-100";
}

export function sizeBucket(bytes: number): SizeBucket {
  const mb = bytes / (1024 * 1024);
  if (mb < 1) return "<1MB";
  if (mb <= 5) return "1-5MB";
  if (mb <= 15) return "5-15MB";
  return ">15MB";
}
