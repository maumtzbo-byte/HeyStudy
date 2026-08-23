import "server-only";
import { prisma } from "@/lib/prisma/client";
import { UserFacingError } from "@/lib/actions/result";

// Límite técnico por usuario/IP, independiente del plan free/pagado — la
// sección 8.5 lo pide explícito: "nadie necesita más que eso en uso
// legítimo". Se implementa sobre Postgres (ya lo tenemos vía Supabase) en
// vez de sumar Upstash/Redis: a la escala de un MVP personal, una tabla con
// un índice compuesto es suficiente y no agrega una cuenta/dependencia
// nueva. Si el tráfico crece, migrar a Redis es un cambio de una sola
// función, no de arquitectura — todo el resto de la app llama a
// `checkRateLimit`, no a la tabla directamente.
//
// Limitación conocida: el conteo y la inserción no son atómicos, así que
// bajo concurrencia alta dos requests simultáneos podrían colarse por
// encima del límite en el mismo instante. Aceptable para el volumen de un
// MVP de un usuario; si eso deja de ser cierto, es la señal de migrar a un
// contador atómico (Redis INCR con TTL).
export async function checkRateLimit(key: string, limit: number, windowSeconds: number) {
  const since = new Date(Date.now() - windowSeconds * 1000);

  const count = await prisma.rateLimitEvent.count({ where: { key, createdAt: { gte: since } } });
  if (count >= limit) {
    throw new UserFacingError("Estás enviando solicitudes muy rápido. Espera un momento e intenta de nuevo.");
  }

  await prisma.rateLimitEvent.create({ data: { key } });

  // Poda oportunista: 1 de cada ~50 llamadas borra registros ya vencidos
  // (de cualquier key) para que la tabla no crezca sin límite. No bloquea
  // la respuesta al estudiante ni necesita un cron aparte.
  if (Math.random() < 0.02) {
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
    void prisma.rateLimitEvent.deleteMany({ where: { createdAt: { lt: cutoff } } });
  }
}
