import "server-only";

// PAID real (Stripe, cuando esté conectado) o días de bono por referidos
// (bonusPaidUntil, ver referralService.ts) cuentan igual para efectos de
// límites — el estudiante no necesita saber cuál es cuál.
export function getEffectivePlan(subscription: { plan: string; bonusPaidUntil: Date | null }): "FREE" | "PAID" {
  if (subscription.plan === "PAID") return "PAID";
  if (subscription.bonusPaidUntil && subscription.bonusPaidUntil > new Date()) return "PAID";
  return "FREE";
}
