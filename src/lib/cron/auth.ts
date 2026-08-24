import "server-only";

// Vercel manda automáticamente Authorization: Bearer $CRON_SECRET cuando esa
// env var existe — si CRON_SECRET no está configurada, la comparación nunca
// hace match y la ruta queda cerrada por default en vez de abierta.
export function isAuthorizedCronRequest(request: Request): boolean {
  const authHeader = request.headers.get("authorization");
  return authHeader === `Bearer ${process.env.CRON_SECRET}`;
}
