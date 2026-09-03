import "server-only";
import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/prisma/client";
import { track } from "@/lib/analytics/server";

// Recompensa fija: días de plan pagado gratis para quien invita, cuando la
// persona invitada termina su onboarding (no basta con abrir el link — eso
// evita regalar días por un simple clic).
export const REFERRAL_REWARD_DAYS = 7;

// Tope de por vida. Antes no había ninguno, y el plan pagado no es un
// detalle cosmético: desbloquea Sonnet en vez de Haiku (3× el costo por
// token), diagnósticos ilimitados y la voz del tutor, que es el rubro más
// caro del producto. Como el registro sólo está limitado por IP, tener
// PAID perpetuo gratis era un script de una tarde.
//
// 10 × 7 = 70 días es más que suficiente para premiar a quien de verdad
// trae gente, sin que la cola sea infinita.
export const MAX_REWARDED_REFERRALS = 10;

function generateCode(): string {
  // 8 caracteres en base36 de un UUID — suficiente espacio para no chocar
  // en la práctica, y se reintenta en el raro caso de colisión.
  return randomUUID().replace(/-/g, "").slice(0, 8).toUpperCase();
}

// Perfiles creados antes de este feature no tienen código todavía —
// se genera la primera vez que lo piden (perfil o completeOnboarding).
export async function getOrCreateReferralCode(studentProfileId: string): Promise<string> {
  const existing = await prisma.studentProfile.findUnique({
    where: { id: studentProfileId },
    select: { referralCode: true },
  });
  if (existing?.referralCode) return existing.referralCode;

  for (let attempt = 0; attempt < 5; attempt++) {
    const code = generateCode();
    try {
      const updated = await prisma.studentProfile.update({
        where: { id: studentProfileId },
        data: { referralCode: code },
        select: { referralCode: true },
      });
      return updated.referralCode as string;
    } catch (err) {
      const isUniqueViolation =
        typeof err === "object" && err !== null && (err as { code?: string }).code === "P2002";
      if (!isUniqueViolation) throw err;
    }
  }
  throw new Error("No se pudo generar un código de referido.");
}

export async function findReferrerByCode(code: string): Promise<string | null> {
  const referrer = await prisma.studentProfile.findUnique({ where: { referralCode: code }, select: { id: true } });
  return referrer?.id ?? null;
}

// Se llama una sola vez, cuando el referido termina su onboarding. Extiende
// (no reemplaza) el bono existente, por si ya tenía días de otra invitación.
export async function grantReferralReward(referrerStudentProfileId: string): Promise<void> {
  const referrer = await prisma.studentProfile.findUnique({
    where: { id: referrerStudentProfileId },
    select: { userId: true },
  });
  if (!referrer) return;

  // El perfil del referido YA existe cuando llegamos aquí (completeOnboarding
  // lo crea con referredByStudentProfileId y después llama a esta función),
  // así que este conteo ya lo incluye. Por eso la comparación es contra
  // "mayor que" el tope y no "mayor o igual": el referido número 10 todavía
  // premia, el 11 ya no.
  const rewardedSoFar = await prisma.studentProfile.count({
    where: { referredByStudentProfileId: referrerStudentProfileId },
  });
  // Se registra la conversión aunque ya no haya premio: para medir el bucle
  // importa que alguien invitó y el invitado se registró, no si cobró.
  await track(referrer.userId, "referral_converted", { rewarded: rewardedSoFar <= MAX_REWARDED_REFERRALS });
  if (rewardedSoFar > MAX_REWARDED_REFERRALS) return;

  const subscription = await prisma.subscription.findUnique({ where: { userId: referrer.userId } });
  if (!subscription) return;

  const base = subscription.bonusPaidUntil && subscription.bonusPaidUntil > new Date() ? subscription.bonusPaidUntil : new Date();
  const bonusPaidUntil = new Date(base.getTime() + REFERRAL_REWARD_DAYS * 24 * 60 * 60 * 1000);

  await prisma.subscription.update({ where: { userId: referrer.userId }, data: { bonusPaidUntil } });
}

export interface ReferralStats {
  code: string;
  referralCount: number;
  bonusPaidUntil: Date | null;
}

export async function getReferralStats(studentProfileId: string, userId: string): Promise<ReferralStats> {
  const [code, referralCount, subscription] = await Promise.all([
    getOrCreateReferralCode(studentProfileId),
    prisma.studentProfile.count({ where: { referredByStudentProfileId: studentProfileId } }),
    prisma.subscription.findUnique({ where: { userId }, select: { bonusPaidUntil: true } }),
  ]);

  return { code, referralCount, bonusPaidUntil: subscription?.bonusPaidUntil ?? null };
}
