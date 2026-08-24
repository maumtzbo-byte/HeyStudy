import "server-only";
import { prisma } from "@/lib/prisma/client";
import { findReferrerByCode, grantReferralReward } from "@/services/referrals/referralService";
import type { OnboardingInput } from "@/lib/validation/onboardingSchemas";

const SUBJECT_COLORS = ["#C1502E", "#2A6F73", "#B8860B", "#4B7B5D", "#7D4F6D", "#B15D5D"];

export async function completeOnboarding(params: { userId: string; input: OnboardingInput; referralCode?: string | null }) {
  const { userId, input, referralCode } = params;

  const existing = await prisma.studentProfile.findUnique({ where: { userId } });
  if (existing) return existing;

  const now = new Date();
  const periodEnd = new Date(now);
  periodEnd.setDate(periodEnd.getDate() + 30);

  // Se resuelve el código ANTES de la transacción: es una lectura, no
  // necesita el mismo aislamiento, y así un código inválido no invalida el
  // resto del onboarding — simplemente no hay referidor.
  const referrerStudentProfileId = referralCode ? await findReferrerByCode(referralCode) : null;

  const studentProfile = await prisma.$transaction(async (tx) => {
    const created = await tx.studentProfile.create({
      data: {
        userId,
        displayName: input.displayName,
        educationLevel: input.educationLevel,
        preferredStudyMethod: input.preferredStudyMethod,
        onboardedAt: now,
        referredByStudentProfileId: referrerStudentProfileId,
      },
    });

    await tx.subject.createMany({
      data: input.subjectNames.map((name, i) => ({
        studentProfileId: created.id,
        name,
        color: SUBJECT_COLORS[i % SUBJECT_COLORS.length],
      })),
    });

    await tx.subscription.create({
      data: {
        userId,
        plan: "FREE",
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
      },
    });

    return created;
  });

  // Fuera de la transacción, después de que el nuevo perfil ya existe: si
  // esto falla no debe tumbar el onboarding de quien se está registrando.
  if (referrerStudentProfileId) {
    await grantReferralReward(referrerStudentProfileId).catch((err) => {
      console.error("[onboarding] fallo al otorgar recompensa de referido", err);
    });
  }

  return studentProfile;
}
