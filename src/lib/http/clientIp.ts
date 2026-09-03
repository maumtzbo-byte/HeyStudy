import "server-only";
import { headers } from "next/headers";

// Ojo con la versión anterior: leía el PRIMER valor de x-forwarded-for.
// En una cadena de proxies que va agregando ("cliente, proxy1, proxy2"),
// ese primer segmento es justo el que el cliente controla — basta con
// mandar `X-Forwarded-For: <lo que sea>` distinto en cada request para
// reiniciar cualquier límite llaveado por IP. Eso tumbaba cuatro
// limitadores reales: login, registro, recuperar contraseña y el demo
// público de la landing.
//
// Ahora se prefieren los headers que pone la plataforma y el cliente no
// puede falsificar (Vercel sobreescribe ambos), y sólo se cae al
// x-forwarded-for crudo cuando no hay ninguno — en un entorno sin proxy
// de confianza enfrente, ese fallback sigue siendo tan débil como antes,
// pero ya no es el camino normal.
export async function clientIp(): Promise<string> {
  const h = await headers();

  const vercelIp = h.get("x-vercel-forwarded-for");
  if (vercelIp) return vercelIp.trim();

  const realIp = h.get("x-real-ip");
  if (realIp) return realIp.trim();

  return h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
}
