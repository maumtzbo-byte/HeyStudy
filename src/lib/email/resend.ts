import "server-only";
import { Resend } from "resend";

// El constructor de Resend lanza de forma síncrona si no hay key en ningún
// lado (ni parámetro ni process.env.RESEND_API_KEY) — eso tumbaría el
// módulo entero apenas se importara, no sólo el envío. El placeholder evita
// ese throw: sin key real, .send() simplemente falla con un 401 de la API
// de Resend, que reviewReminderService.ts ya captura como fallo normal.
export const resend = new Resend(process.env.RESEND_API_KEY || "re_not_configured");

// Resend exige un dominio verificado para mandar a destinatarios que no sean
// el dueño de la cuenta. onboarding@resend.dev es el remitente de prueba que
// Resend da por default — sólo entrega al correo con el que te registraste,
// no sirve para producción. Hay que verificar un dominio propio en Resend y
// poner ese remitente aquí (env var) antes de que los recordatorios lleguen
// a estudiantes de verdad.
export const REVIEW_REMINDER_FROM = process.env.RESEND_FROM_EMAIL || "HeyStudy <onboarding@resend.dev>";

// Mismo remitente para el resto de correos transaccionales (resumen semanal,
// recordatorio de entregas, reporte a padres/tutores) — no hay razón para
// que cada uno pida su propio dominio verificado en Resend.
export const REPORT_FROM = REVIEW_REMINDER_FROM;

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://heystudy.app";

// La dirección desnuda, sin el "HeyStudy <...>", para el mailto: de baja.
function fromAddress(): string {
  const match = REPORT_FROM.match(/<([^>]+)>/);
  return match?.[1] ?? REPORT_FROM;
}

// A quién le llega el correo cambia cómo se da de baja: el estudiante tiene
// cuenta y sus interruptores en el perfil; el padre o tutor NO tiene cuenta,
// así que su única vía real es contestar el correo.
export type EmailAudience = "student" | "parent";

// Todos los correos salen por aquí. Antes cada servicio llamaba
// resend.emails.send directo y ninguno mandaba List-Unsubscribe ni ofrecía
// una forma visible de darse de baja — para correo automatizado eso es un
// problema de reputación de dominio y, en el caso del reporte a padres,
// también de consentimiento: llega correo sobre un menor con nombre a una
// dirección que nadie verificó.
//
// Limitación conocida: la baja de un clic de verdad necesita un token
// firmado, y eso pide una columna nueva o un secreto nuevo en el entorno.
// Por ahora la cabecera va con mailto:, que es un mecanismo válido del
// estándar, más el pie visible. Cuando Stripe traiga su migración conviene
// hacer la versión con token.
export async function sendTransactionalEmail(params: {
  to: string;
  subject: string;
  html: string;
  audience: EmailAudience;
}) {
  const { to, subject, html, audience } = params;
  const unsubscribeMailto = `mailto:${fromAddress()}?subject=${encodeURIComponent("Baja de correos")}`;

  // El pie va envuelto en el mismo contenedor centrado de 480px que usan los
  // cuerpos de los correos, para que no se pegue al borde izquierdo abajo del
  // contenido.
  const footerText =
    audience === "student"
      ? `Puedes apagar estos correos cuando quieras desde ` +
        `<a href="${APP_URL}/dashboard/perfil" style="color:#6d46e3">tu cuenta en HeyStudy</a>.`
      : `Recibes este resumen porque un estudiante puso tu correo en su cuenta de HeyStudy. ` +
        `Si no quieres seguir recibiéndolo, responde a este correo y lo damos de baja.`;

  const footer =
    `<div style="font-family:-apple-system,sans-serif;max-width:480px;margin:0 auto;">` +
    `<p style="margin-top:32px;font-size:12px;color:#8a938f">${footerText}</p>` +
    `</div>`;

  return resend.emails.send({
    from: REPORT_FROM,
    to,
    subject,
    html: html + footer,
    headers: {
      "List-Unsubscribe": `<${unsubscribeMailto}>`,
      "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
    },
  });
}
