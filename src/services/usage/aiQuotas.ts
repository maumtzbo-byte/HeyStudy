import "server-only";
import { checkRateLimit } from "@/services/security/rateLimit";
import type { AITier } from "@/services/ai/models";
import { track } from "@/lib/analytics/server";

// Cuotas mensuales de las operaciones de IA que sí cuestan dinero por uso.
//
// Hasta ahora el único contador del producto era `diagnosticsUsed`, que mide
// justamente lo barato: un diagnóstico completo cuesta ~$0.02 USD. Mientras
// tanto el chat del tutor y la voz —los dos rubros caros y sin tope— eran
// ilimitados en AMBOS planes, así que el costo variable por usuario no tenía
// techo. Un usuario intensivo de voz costaba más de lo que cualquier
// suscripción razonable puede cobrar.
//
// Se implementa sobre `checkRateLimit` con ventana de 30 días en vez de
// columnas nuevas en Subscription para no depender de una migración: cierra
// la fuga hoy. Al conectar Stripe conviene moverlo a contadores atados al
// ciclo de facturación real (mismo patrón que `claimDiagnostic`).
const MONTH_SECONDS = 30 * 24 * 60 * 60;

export const TUTOR_MESSAGES_PER_MONTH: Record<AITier, number> = {
  free: 40,
  paid: 500,
};

export const VOICE_PLAYS_PER_MONTH = 100;

export async function claimTutorMessage(userId: string, tier: AITier): Promise<void> {
  const limit = TUTOR_MESSAGES_PER_MONTH[tier];
  const message =
    tier === "free"
      ? `Ya usaste tus ${limit} mensajes con el tutor de este mes en el plan gratuito. ` +
        "Mejora tu plan para seguir platicando con él."
      : `Ya usaste tus ${limit} mensajes con el tutor de este mes. Se reinician el próximo ciclo.`;

  try {
    await checkRateLimit(`tutor-msg:${userId}`, limit, MONTH_SECONDS, message);
  } catch (err) {
    // Se registra el tope alcanzado y se deja pasar el error tal cual: la
    // analítica observa, no cambia el comportamiento.
    await track(userId, "paywall_hit", { feature: "tutor_message", plan: tier === "paid" ? "PAID" : "FREE" });
    throw err;
  }
}

export async function claimVoicePlay(userId: string): Promise<void> {
  try {
    await checkRateLimit(
      `tts-month:${userId}`,
      VOICE_PLAYS_PER_MONTH,
      MONTH_SECONDS,
      `Ya usaste tus ${VOICE_PLAYS_PER_MONTH} reproducciones de voz de este mes. Se reinician el próximo ciclo.`,
    );
  } catch (err) {
    // La voz es exclusiva del plan pagado, así que quien llega hasta este
    // tope siempre es PAID — el FREE se queda en la puerta de synthesizeSpeech.
    await track(userId, "paywall_hit", { feature: "voice", plan: "PAID" });
    throw err;
  }
}
