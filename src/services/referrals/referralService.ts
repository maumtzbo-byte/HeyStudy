import "server-only";
import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/prisma/client";

// Recompensa fija: días de plan pagado gratis para quien invita, cuando la
// persona invitada termina su onboarding (no basta con abrir el link — eso
// evita regalar días por un simple clic). No hay tope de referidos: a la
// escala de un MVP no vale la pena la complejidad de un límite todavía.
export const REFERRAL_REWARD_DAYS = 7;

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
