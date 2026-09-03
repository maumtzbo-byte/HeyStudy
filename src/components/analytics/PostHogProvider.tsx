"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import posthog from "posthog-js";
import type { EventName, EventProperties } from "@/lib/analytics/events";

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com";

let started = false;

function startPostHog() {
  if (started || !POSTHOG_KEY) return;
  started = true;

  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,

    // Autocapture APAGADO a propósito. Es un producto con menores: el
    // autocapture manda el texto de botones y enlaces en los que hacen clic,
    // y en esta app esos textos incluyen nombres de materias, de grupos y de
    // tutores que el estudiante escribió. Sólo salen los eventos del
    // catálogo, que están revisados uno por uno.
    autocapture: false,

    // Grabación de sesión APAGADA por la misma razón, y peor: grabaría el
    // chat del tutor, que es lo más sensible que hay en el producto.
    disable_session_recording: true,

    // Los pageviews se mandan a mano abajo: el App Router navega sin
    // recargar y el automático se pierde los cambios de ruta.
    capture_pageview: false,

    // No crea perfil de persona para visitantes anónimos de la landing —
    // sólo desde que hay identify(). Los eventos anónimos igual se
    // registran y el embudo landing → registro se sigue viendo.
    person_profiles: "identified_only",
  });
}

// Se monta una sola vez en el layout raíz. Sin llave configurada no hace
// absolutamente nada, así que la app corre igual en local sin cuenta de
// PostHog.
export function PostHogProvider() {
  const pathname = usePathname();

  useEffect(() => {
    startPostHog();
  }, []);

  useEffect(() => {
    if (!POSTHOG_KEY || !pathname) return;
    // Sólo la ruta, sin querystring: los enlaces de referido llevan el
    // código en la query y no tiene por qué acabar en la analítica.
    posthog.capture("$pageview", { $current_url: window.location.origin + pathname });
  }, [pathname]);

  return null;
}

// Une la sesión anónima del navegador con el usuario ya autenticado. El
// distinct_id es el UUID de Supabase, el mismo que usa el servidor, para
// que ambos caminos caigan en la misma persona.
export function AnalyticsIdentify({ userId }: { userId: string }) {
  useEffect(() => {
    if (!POSTHOG_KEY) return;
    startPostHog();
    // Sin propiedades: el plan y el nivel educativo los pone el servidor con
    // identifyUser(), donde ya se conocen sin pagar una consulta extra en
    // cada carga del dashboard.
    posthog.identify(userId);
  }, [userId]);

  return null;
}

// Eventos disparados desde la interfaz (clics que no llegan al servidor).
// Mismo catálogo tipado que el servidor: un evento que no exista ahí no
// compila.
export function trackClient<E extends EventName>(event: E, properties: EventProperties[E]) {
  if (!POSTHOG_KEY) return;
  posthog.capture(event, properties);
}
