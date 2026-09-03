import "server-only";
import { PostHog } from "posthog-node";
import type { EventName, EventProperties } from "@/lib/analytics/events";

// Misma llave pública del proyecto para navegador y servidor: PostHog
// ingiere con la project API key en ambos lados, así que configurar una sola
// variable deja funcionando los dos caminos.
const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com";

// Sin llave el cliente arranca deshabilitado en vez de no existir: así
// `track()` no necesita ramas por todos lados y la app corre igual en
// local y en preview sin configurar nada. Mismo criterio que el placeholder
// de Resend.
const client = new PostHog(POSTHOG_KEY || "phc_disabled", {
  host: POSTHOG_HOST,
  disabled: !POSTHOG_KEY,
  // En serverless el proceso se congela apenas responde la petición, así
  // que un lote en memoria esperando su flush periódico se pierde. Cada
  // evento se manda solo (ver captureImmediate abajo); esto sólo evita que
  // se acumule nada por accidente.
  flushAt: 1,
  flushInterval: 0,
});

export function isAnalyticsEnabled(): boolean {
  return Boolean(POSTHOG_KEY);
}

/**
 * Registra un evento de producto. Nunca lanza y nunca bloquea al usuario:
 * la analítica es observabilidad, no parte del flujo. Si PostHog está caído
 * o mal configurado, el estudiante no se entera.
 *
 * `distinctId` es SIEMPRE el UUID del usuario (nunca correo ni nombre) para
 * que se una con lo que manda el navegador vía identify().
 */
export async function track<E extends EventName>(
  distinctId: string,
  event: E,
  properties: EventProperties[E],
): Promise<void> {
  if (!POSTHOG_KEY) return;
  try {
    // captureImmediate y no capture: en Vercel el runtime puede congelarse
    // antes de que corra un flush en segundo plano, y el evento se pierde
    // en silencio. Cuesta una petición por evento; a esta escala es el
    // intercambio correcto — un embudo con huecos no sirve para decidir.
    await client.captureImmediate({ distinctId, event, properties });
  } catch (err) {
    console.error("[analytics]", event, err);
  }
}

/**
 * Propiedades a nivel persona (plan, no PII). Se usa al cerrar onboarding y
 * al cambiar de plan, para poder segmentar embudos por tipo de usuario.
 */
export async function identifyUser(
  distinctId: string,
  properties: Record<string, string | number | boolean>,
): Promise<void> {
  if (!POSTHOG_KEY) return;
  try {
    await client.identifyImmediate({ distinctId, properties });
  } catch (err) {
    console.error("[analytics identify]", err);
  }
}
