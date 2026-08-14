import "server-only";
import { jsonSchemaOutputFormat } from "@anthropic-ai/sdk/helpers/json-schema";
import { anthropic } from "@/services/ai/anthropicClient";
import { MODEL_BY_TIER } from "@/services/ai/models";
import { logAIUsage } from "@/services/usage/logAIUsage";
import type {
  AICallContext,
  AnswerDiagnosis,
  GeneratedQuestion,
  StudyPlanItemDraft,
  TutorMessage,
  TutorMode,
} from "@/services/ai/types";

// Capa de abstracción de IA. Todo el resto de la app pasa por aquí — nunca
// llama a Anthropic directamente. El parámetro `tier` centraliza el routing
// de costos: free -> Haiku, paid -> Sonnet (sección 3 del spec).

const MAX_TOKENS_DEFAULT = 2048;

async function logUsage(ctx: AICallContext, model: string, inputTokens: number, outputTokens: number) {
  await logAIUsage({ userId: ctx.userId, model, feature: ctx.feature, inputTokens, outputTokens });
}

export async function generateText(
  ctx: AICallContext,
  params: { prompt: string; system?: string; maxTokens?: number },
): Promise<string> {
  const model = MODEL_BY_TIER[ctx.tier];
  const response = await anthropic.messages.create({
    model,
    max_tokens: params.maxTokens ?? MAX_TOKENS_DEFAULT,
    system: params.system,
    messages: [{ role: "user", content: params.prompt }],
  });

  await logUsage(ctx, model, response.usage.input_tokens, response.usage.output_tokens);

  const textBlock = response.content.find((block) => block.type === "text");
  return textBlock?.type === "text" ? textBlock.text : "";
}

export async function analyzeDocument(
  ctx: AICallContext,
  params: { documentText: string; instructions: string },
): Promise<string> {
  return generateText(ctx, {
    system:
      "Eres un asistente que analiza materiales educativos. Extrae información " +
      "precisa y relevante del documento provisto, siguiendo exactamente las instrucciones.",
    prompt: `${params.instructions}\n\n---\nDocumento:\n${params.documentText}`,
    maxTokens: 4096,
  });
}

export async function generateQuestions(
  ctx: AICallContext,
  params: { topicName: string; subjectContext: string; difficulty: "FACIL" | "MEDIO" | "DIFICIL"; count: number },
): Promise<GeneratedQuestion[]> {
  const model = MODEL_BY_TIER[ctx.tier];
  const response = await anthropic.messages.parse({
    model,
    max_tokens: 4096,
    system:
      "Eres un generador de preguntas de diagnóstico académico. Generas preguntas " +
      "claras, correctas, y calibradas exactamente a la dificultad pedida.",
    messages: [
      {
        role: "user",
        content:
          `Genera ${params.count} pregunta(s) de dificultad "${params.difficulty}" sobre el tema ` +
          `"${params.topicName}", en el contexto de la materia: ${params.subjectContext}.`,
      },
    ],
    output_config: {
      format: jsonSchemaOutputFormat({
        type: "object",
        properties: {
          questions: {
            type: "array",
            items: {
              type: "object",
              properties: {
                prompt: { type: "string" },
                difficulty: { type: "string", enum: ["FACIL", "MEDIO", "DIFICIL"] },
                correctAnswer: { type: "string" },
                options: { type: "array", items: { type: "string" } },
              },
              required: ["prompt", "difficulty", "correctAnswer"],
              additionalProperties: false,
            },
          },
        },
        required: ["questions"],
        additionalProperties: false,
      } as const),
    },
  });

  await logUsage(ctx, model, response.usage.input_tokens, response.usage.output_tokens);

  return response.parsed_output?.questions ?? [];
}

export async function diagnoseKnowledge(
  ctx: AICallContext,
  params: { question: string; correctAnswer: string; studentResponse: string },
): Promise<AnswerDiagnosis> {
  const model = MODEL_BY_TIER[ctx.tier];
  const response = await anthropic.messages.parse({
    model,
    max_tokens: 1024,
    system:
      "Analizas la respuesta de un estudiante más allá de correcto/incorrecto: " +
      "estimas su nivel real de dominio del concepto (0 a 1) y, si hay un error, " +
      "describes el patrón de error específico (no solo 'se equivocó').",
    messages: [
      {
        role: "user",
        content:
          `Pregunta: ${params.question}\nRespuesta correcta: ${params.correctAnswer}\n` +
          `Respuesta del estudiante: ${params.studentResponse}`,
      },
    ],
    output_config: {
      format: jsonSchemaOutputFormat({
        type: "object",
        properties: {
          isCorrect: { type: "boolean" },
          masteryEstimate: { type: "number" },
          errorPattern: { type: ["string", "null"] },
          feedback: { type: "string" },
        },
        required: ["isCorrect", "masteryEstimate", "errorPattern", "feedback"],
        additionalProperties: false,
      } as const),
    },
  });

  await logUsage(ctx, model, response.usage.input_tokens, response.usage.output_tokens);

  return (
    response.parsed_output ?? {
      isCorrect: false,
      masteryEstimate: 0,
      errorPattern: null,
      feedback: "",
    }
  );
}

export async function createStudyPlan(
  ctx: AICallContext,
  params: { weakTopicsSummary: string; minutesAvailable: number },
): Promise<StudyPlanItemDraft[]> {
  const model = MODEL_BY_TIER[ctx.tier];
  const response = await anthropic.messages.parse({
    model,
    max_tokens: 2048,
    system:
      "Generas un plan de estudio diario explicable: cada item indica qué estudiar, " +
      "cuánto tiempo, y por qué (vinculado a la debilidad detectada más urgente). " +
      "La suma de minutos no debe exceder el tiempo disponible.",
    messages: [
      {
        role: "user",
        content:
          `Debilidades detectadas del estudiante:\n${params.weakTopicsSummary}\n\n` +
          `Tiempo disponible hoy: ${params.minutesAvailable} minutos.`,
      },
    ],
    output_config: {
      format: jsonSchemaOutputFormat({
        type: "object",
        properties: {
          items: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                reason: { type: "string" },
                minutes: { type: "integer" },
                topicName: { type: "string" },
              },
              required: ["title", "reason", "minutes", "topicName"],
              additionalProperties: false,
            },
          },
        },
        required: ["items"],
        additionalProperties: false,
      } as const),
    },
  });

  await logUsage(ctx, model, response.usage.input_tokens, response.usage.output_tokens);

  return response.parsed_output?.items ?? [];
}

const TUTOR_MODE_INSTRUCTIONS: Record<TutorMode, string> = {
  socratico:
    "Modo socrático: NUNCA des la respuesta directa. Guía al estudiante con preguntas " +
    "que lo lleven a descubrirla por sí mismo.",
  explicar: "Modo explicar: da una explicación clara y completa del concepto, con un ejemplo.",
  pista: "Modo pista: da una sola pista breve, sin resolver el problema.",
  practica: "Modo práctica: propone un ejercicio similar para que el estudiante practique.",
};

export async function tutorResponse(
  ctx: AICallContext,
  params: { mode: TutorMode; subjectContext: string; masterySummary: string; history: TutorMessage[] },
): Promise<string> {
  const model = MODEL_BY_TIER[ctx.tier];
  const response = await anthropic.messages.create({
    model,
    max_tokens: MAX_TOKENS_DEFAULT,
    system:
      `Eres un tutor de HeyStudy. ${TUTOR_MODE_INSTRUCTIONS[params.mode]}\n\n` +
      `Contexto de la materia:\n${params.subjectContext}\n\n` +
      `Mastery actual del estudiante en temas relevantes:\n${params.masterySummary}`,
    messages: params.history.map((m) => ({ role: m.role, content: m.content })),
  });

  await logUsage(ctx, model, response.usage.input_tokens, response.usage.output_tokens);

  const textBlock = response.content.find((block) => block.type === "text");
  return textBlock?.type === "text" ? textBlock.text : "";
}
