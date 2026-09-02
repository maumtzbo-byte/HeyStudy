import "server-only";
import { prisma } from "@/lib/prisma/client";
import { findReferrerByCode, grantReferralReward } from "@/services/referrals/referralService";
import { selectAdmissionTarget } from "@/services/knowledge/admissionExamService";
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
        schoolCalendarUrl: input.schoolCalendarUrl,
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

  // Siembra del temario de admisión. Va fuera de la transacción por la misma
  // razón que la recompensa de referido: selectAdmissionTarget usa el cliente
  // global de Prisma, así que adentro no vería el perfil recién creado.
  //
  // Es lo que hace que el dashboard nazca con contenido en vez de con seis
  // ceros y un botón que falla: carga entre 12 y 19 áreas del examen, de
  // forma determinista y sin gastar una llamada de IA. Si falla no se tumba
  // el registro — el dashboard igual guía al mapa de conocimiento.
  if (input.admissionTargetId) {
    await selectAdmissionTarget(studentProfile.id, input.admissionTargetId).catch((err) => {
      console.error("[onboarding] fallo al sembrar el temario de admisión", err);
    });
  }

  // Fuera de la transacción, después de que el nuevo perfil ya existe: si
  // esto falla no debe tumbar el onboarding de quien se está registrando.
  if (referrerStudentProfileId) {
    await grantReferralReward(referrerStudentProfileId).catch((err) => {
      console.error("[onboarding] fallo al otorgar recompensa de referido", err);
    });
  }

  return studentProfile;
}
