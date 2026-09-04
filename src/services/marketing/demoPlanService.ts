import "server-only";
import { jsonSchemaOutputFormat } from "@anthropic-ai/sdk/helpers/json-schema";
import { anthropic } from "@/services/ai/anthropicClient";
import { MODEL_BY_TIER } from "@/services/ai/models";
import { checkRateLimit } from "@/services/security/rateLimit";
import { UserFacingError } from "@/lib/actions/result";

// AVISO: esto genera un plan de EJEMPLO, no un diagnóstico. No mide a
// nadie. El prompt tenía instrucciones de inventar un hallazgo ("detectamos
// errores en...") y de ocultar que era un ejemplo; se retiraron, porque
// simular una medición que no ocurrió es justo lo contrario de la tesis del
// producto y destruye lo único que esta marca puede ofrecer sin usuarios:
// que no miente. Quien consuma esta salida DEBE etiquetarla como ejemplo.
//
// La experiencia de evidencia real es el micro-diagnóstico, que sí mide una
// respuesta de verdad (ver services/diagnostic/).
//
// Demo pública del landing (sección 4.5 / "20 cosas que ocupa un startup"):
// conecta a IA real, pero es la única llamada de todo AIProvider que no pasa
// por generateText/logAIUsage — esas funciones exigen un userId real (FK a
// User) para atribuir el costo, y aquí no hay sesión. El límite de costo lo
// pone el rate limit por IP, no el registro de uso por usuario.
export const DEMO_SUBJECTS = ["Matemáticas", "Historia", "Biología", "Química", "Física", "Inglés"] as const;
export type DemoSubject = (typeof DEMO_SUBJECTS)[number];

const DEMO_RATE_LIMIT = 5;
const DEMO_RATE_WINDOW_SECONDS = 60 * 60;

export interface DemoPlanItem {
  title: string;
  reason: string;
  minutes: number;
  level: "success" | "warning" | "danger";
}

export async function generateDemoPlan(params: { subject: string; ip: string }): Promise<DemoPlanItem[]> {
  const { subject, ip } = params;

  if (!DEMO_SUBJECTS.includes(subject as DemoSubject)) {
    throw new UserFacingError("Materia no válida para la demo.");
  }

  await checkRateLimit(`landing_demo:${ip}`, DEMO_RATE_LIMIT, DEMO_RATE_WINDOW_SECONDS);

  const response = await anthropic.messages.parse({
    model: MODEL_BY_TIER.free,
    max_tokens: 1024,
    system:
      "Generas un ejemplo ilustrativo de plan de estudio diario para la landing page de HeyStudy, " +
      "una app de estudio para estudiantes mexicanos. Exactamente 3 items, del más urgente al más " +
      "ligero. Cada item: un tema concreto y realista de la materia, una razón corta que explique por " +
      "qué ese tema suele ir antes que los otros (por su dificultad o porque es prerequisito de los " +
      "demás), minutos (10-25), y nivel de urgencia. " +
      "NUNCA afirmes ni insinúes que mediste, detectaste o analizaste algo de esta persona: no la " +
      "conoces. Prohibido escribir 'detectamos', 'notamos', 'tus errores' o 'tu nivel'. " +
      "Responde en español de México.",
    messages: [{ role: "user", content: `Materia: ${subject}` }],
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
                level: { type: "string", enum: ["success", "warning", "danger"] },
              },
              required: ["title", "reason", "minutes", "level"],
              additionalProperties: false,
            },
          },
        },
        required: ["items"],
        additionalProperties: false,
      } as const),
    },
  });

  const items = response.parsed_output?.items ?? [];
  if (items.length === 0) throw new UserFacingError("No se pudo generar el ejemplo. Intenta de nuevo.");
  return items.slice(0, 3);
}
