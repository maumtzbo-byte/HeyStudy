import "server-only";
import { prisma } from "@/lib/prisma/client";
import { UserFacingError } from "@/lib/actions/result";
import { checkRateLimit } from "@/services/security/rateLimit";
import { getEffectivePlan } from "@/services/usage/effectivePlan";
import { claimVoicePlay } from "@/services/usage/aiQuotas";

const ELEVENLABS_VOICE_ID = process.env.ELEVENLABS_VOICE_ID || "21m00Tcm4TlvDq8ikWAM";
// Flash v2.5 en vez de multilingual v2: cuesta la mitad por carácter
// (~$0.05 vs ~$0.10 por cada 1,000) y soporta 32 idiomas, español incluido.
// Para leer en voz alta la respuesta de un tutor no necesitamos el modelo
// más caro; la diferencia de calidad no justifica duplicar el costo del
// rubro más caro del producto.
const ELEVENLABS_MODEL_ID = process.env.ELEVENLABS_MODEL_ID || "eleven_flash_v2_5";
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

  // Además del límite por minuto, cuota mensual: 15/min sin tope mensual
  // permite ~648,000 reproducciones al mes en teoría, y en la práctica un
  // usuario intensivo costaba más de lo que paga.
  await claimVoicePlay(userId);

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
      model_id: ELEVENLABS_MODEL_ID,
      voice_settings: { stability: 0.5, similarity_boost: 0.75 },
    }),
  });

  if (!response.ok) {
    console.error("[tts] ElevenLabs respondió", response.status, await response.text().catch(() => ""));
    throw new UserFacingError("No pudimos generar el audio. Intenta de nuevo.");
  }

  return Buffer.from(await response.arrayBuffer());
}
