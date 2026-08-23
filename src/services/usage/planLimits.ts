import "server-only";
import { prisma } from "@/lib/prisma/client";
import { UserFacingError } from "@/lib/actions/result";

// Límites de la sección 5 (tabla de freemium). "Documentos analizados/mes"
// no se incluye: `analyzeDocument` en AIProvider no está conectado a ningún
// flujo todavía (subir un material no dispara IA), así que no hay nada que
// limitar hoy — agregar el contador sería código muerto. Cuando se conecte,
// el patrón es el mismo que `diagnosticsUsed` de aquí abajo.
const FREE_DIAGNOSTICS_PER_MONTH = 6;

// El contador vive en Subscription y se resetea por ciclo. Antes se
// incrementaba en cada diagnóstico pero nada lo comparaba contra un
// límite — un usuario free tenía diagnósticos ilimitados en la práctica.
export async function assertDiagnosticAvailable(userId: string): Promise<void> {
  const subscription = await getOrRollSubscriptionPeriod(userId);
  if (subscription.plan === "PAID") return;

  if (subscription.diagnosticsUsed >= FREE_DIAGNOSTICS_PER_MONTH) {
    throw new UserFacingError(
      `Ya usaste tus ${FREE_DIAGNOSTICS_PER_MONTH} diagnósticos de este mes en el plan gratuito. ` +
        "Mejora tu plan para seguir diagnosticando sin límite.",
    );
  }
}

// Si el ciclo actual ya venció, resetea los contadores y avanza el periodo
// 30 días desde hoy antes de devolver la suscripción. Sin esto, el límite
// mensual se vuelve permanente en cuanto pasa un mes.
async function getOrRollSubscriptionPeriod(userId: string) {
  const subscription = await prisma.subscription.findUnique({ where: { userId } });
  if (!subscription) throw new UserFacingError("No se encontró tu suscripción.");

  if (subscription.currentPeriodEnd > new Date()) return subscription;

  const now = new Date();
  const periodEnd = new Date(now);
  periodEnd.setDate(periodEnd.getDate() + 30);

  return prisma.subscription.update({
    where: { userId },
    data: {
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
      diagnosticsUsed: 0,
      documentsAnalyzedUsed: 0,
    },
  });
}
