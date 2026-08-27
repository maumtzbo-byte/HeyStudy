import "server-only";
import { prisma } from "@/lib/prisma/client";
import { UserFacingError } from "@/lib/actions/result";
import { checkRateLimit } from "@/services/security/rateLimit";
import { getEffectivePlan } from "@/services/usage/effectivePlan";

const ELEVENLABS_VOICE_ID = process.env.ELEVENLABS_VOICE_ID || "21m00Tcm4TlvDq8ikWAM";
// Suficiente para una respuesta larga del tutor (MAX_TOKENS_DEFAULT en
// AIProvider.ts ya la acota); es un tope de defensa, no algo que se espere
// alcanzar seguido.
const MAX_TTS_CHARS = 2000;

// La voz del tutor cuesta por carácter en un servicio externo (ElevenLabs),
// aparte de lo que ya pagamos por el texto — por eso es beneficio de plan
// pagado, igual que "el tutor más capaz" (ver PlanUsageCard).
export async function synthesizeSpeech(userId: string, rawText: string): Promise<Buffer> {
  const subscription = await prisma.subscription.findUnique({ where: { userId } });
  if (!subscription || getEffectivePlan(subscription) !== "PAID") {
    throw new UserFacingError("La voz del tutor es un beneficio del plan pagado.");
  }

  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) throw new UserFacingError("La voz del tutor no está disponible por ahora.");

  // Límite técnico independiente del plan, mismo criterio que checkAIRateLimit
  // en AIProvider.ts — cada llamada aquí sí tiene costo real, así que va más
  // apretado que un chat de solo texto.
  await checkRateLimit(`tts:${userId}`, 15, 60);

  const text = rawText.trim().slice(0, MAX_TTS_CHARS);
  if (!text) throw new UserFacingError("No hay texto para leer.");

  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}`, {
    method: "POST",
    headers: {
      "xi-api-key": apiKey,
      "Content-Type": "application/json",
      Accept: "audio/mpeg",
    },
    body: JSON.stringify({
      text,
      model_id: "eleven_multilingual_v2",
      voice_settings: { stability: 0.5, similarity_boost: 0.75 },
    }),
  });

  if (!response.ok) {
    console.error("[tts] ElevenLabs respondió", response.status, await response.text().catch(() => ""));
    throw new UserFacingError("No pudimos generar el audio. Intenta de nuevo.");
  }

  return Buffer.from(await response.arrayBuffer());
}
