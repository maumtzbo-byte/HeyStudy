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
