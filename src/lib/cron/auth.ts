import "server-only";
import { timingSafeEqual } from "node:crypto";

// Vercel manda automáticamente Authorization: Bearer $CRON_SECRET cuando esa
// env var existe.
//
// Ojo con la versión anterior de esta función: comparaba contra
// `Bearer ${process.env.CRON_SECRET}` directo, y el comentario afirmaba que
// sin la variable "la ruta queda cerrada por default". Era falso: con
// CRON_SECRET indefinida el template literal produce la cadena literal
// "Bearer undefined", que cualquiera puede mandar en el header. Fallaba
// ABIERTA, no cerrada. Por eso ahora el secreto faltante o vacío se rechaza
// explícitamente antes de comparar nada.
export function isAuthorizedCronRequest(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;

  const authHeader = request.headers.get("authorization");
  if (!authHeader) return false;

  // timingSafeEqual exige buffers del mismo largo, así que se compara el
  // largo antes (eso sí filtra por tiempo, pero el largo del secreto no es
  // lo que protege) y luego el contenido en tiempo constante.
  const expected = Buffer.from(`Bearer ${secret}`);
  const received = Buffer.from(authHeader);
  if (expected.length !== received.length) return false;

  return timingSafeEqual(expected, received);
}
