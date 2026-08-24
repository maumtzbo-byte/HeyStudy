import "server-only";
import { prisma } from "@/lib/prisma/client";
import { UserFacingError } from "@/lib/actions/result";
import { getEffectivePlan } from "@/services/usage/effectivePlan";

// Límites de la sección 5 (tabla de freemium). "Documentos analizados/mes"
// no se incluye: `analyzeDocument` en AIProvider no está conectado a ningún
// flujo todavía (subir un material no dispara IA), así que no hay nada que
// limitar hoy — agregar el contador sería código muerto. Cuando se conecte,
// el patrón es el mismo que `diagnosticsUsed` de aquí abajo.
const FREE_DIAGNOSTICS_PER_MONTH = 6;

// El contador vive en Subscription y se resetea por ciclo. Antes se
// incrementaba en cada diagnóstico pero nada lo comparaba contra un
// límite — un usuario free tenía diagnósticos ilimitados en la práctica.
//
// Chequeo e incremento en un solo UPDATE condicional (no leer diagnosticsUsed
// y luego incrementarlo aparte): dos solicitudes concurrentes del mismo
// usuario (doble clic, retry) podían leer el mismo valor antes de que
// cualquiera incrementara, dejando pasar un diagnóstico de más del límite
// del plan free. Con el WHERE en el propio UPDATE, sólo una de las dos
// puede ganar la carrera.
export async function claimDiagnostic(userId: string): Promise<void> {
  const subscription = await getOrRollSubscriptionPeriod(userId);
  if (getEffectivePlan(subscription) === "PAID") return;

  const { count } = await prisma.subscription.updateMany({
    where: { userId, diagnosticsUsed: { lt: FREE_DIAGNOSTICS_PER_MONTH } },
    data: { diagnosticsUsed: { increment: 1 } },
  });

  if (count === 0) {
    throw new UserFacingError(
      `Ya usaste tus ${FREE_DIAGNOSTICS_PER_MONTH} diagnósticos de este mes en el plan gratuito. ` +
        "Mejora tu plan para seguir diagnosticando sin límite.",
    );
  }
}

export interface PlanUsageSummary {
  plan: "FREE" | "PAID";
  diagnosticsUsed: number;
  diagnosticsLimit: number;
  periodEnd: Date;
}

// Para mostrarle al estudiante cuánto le queda — antes el límite existía
// pero era invisible, así que llegar a él se sentía como un error random en
// vez de una razón clara para mejorar de plan.
export async function getPlanUsageSummary(userId: string): Promise<PlanUsageSummary> {
  const subscription = await getOrRollSubscriptionPeriod(userId);
  return {
    plan: getEffectivePlan(subscription),
    diagnosticsUsed: subscription.diagnosticsUsed,
    diagnosticsLimit: FREE_DIAGNOSTICS_PER_MONTH,
    periodEnd: subscription.currentPeriodEnd,
  };
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
