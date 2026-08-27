import type { AITier } from "@/services/ai/models";

export type { AITier };

export interface AICallContext {
  userId: string;
  tier: AITier;
  feature: string;
}

export interface GeneratedQuestion {
  prompt: string;
  difficulty: "FACIL" | "MEDIO" | "DIFICIL";
  correctAnswer: string;
  options?: string[];
}

export interface AnswerDiagnosis {
  isCorrect: boolean;
  masteryEstimate: number; // 0-1
  errorPattern: string | null;
  feedback: string;
}

export interface StudyPlanItemDraft {
  title: string;
  reason: string;
  minutes: number;
  topicName: string;
}

export type TutorMode = "socratico" | "explicar" | "pista" | "practica";

export interface TutorMessage {
  role: "user" | "assistant";
  content: string;
}

// self_harm es su propia categoría (no sólo "unsafe") porque necesita una
// respuesta distinta: contención y líneas de ayuda, no un rechazo seco.
export type ModerationCategory = "safe" | "self_harm" | "unsafe";

// Resultado de cerrar una conversación con el tutor (ver
// tutorService.generateWrapUp): la libreta de notas, una actualización del
// perfil de estilo de aprendizaje del estudiante (o null si no hay nada
// nuevo que agregar), y un tema existente sugerido para practicar (o null).
export interface ConversationWrapUp {
  notes: string;
  learningStyleUpdate: string | null;
  suggestedTopicId: string | null;
}
