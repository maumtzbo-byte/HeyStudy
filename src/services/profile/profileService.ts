import "server-only";
import { prisma } from "@/lib/prisma/client";
import { UserFacingError } from "@/lib/actions/result";
import type { studyMethods } from "@/lib/validation/onboardingSchemas";

export async function updatePreferredStudyMethod(
  userId: string,
  preferredStudyMethod: (typeof studyMethods)[number],
) {
  await prisma.studentProfile.update({
    where: { userId },
    data: { preferredStudyMethod },
  });
}

export async function updateReviewRemindersEnabled(userId: string, enabled: boolean) {
  await prisma.studentProfile.update({
    where: { userId },
    data: { reviewRemindersEnabled: enabled },
  });
}

export async function updateWeeklyReportEnabled(userId: string, enabled: boolean) {
  await prisma.studentProfile.update({
    where: { userId },
    data: { weeklyReportEnabled: enabled },
  });
}

export async function updateDeadlineRemindersEnabled(userId: string, enabled: boolean) {
  await prisma.studentProfile.update({
    where: { userId },
    data: { deadlineRemindersEnabled: enabled },
  });
}

// El correo del padre/tutor lo da el propio estudiante (sección 4.5) — nunca
// se pide en el registro ni se infiere de nada. Borrar el correo apaga
// automáticamente el reporte: no puede quedar "activado" sin destinatario.
export async function updateParentEmail(userId: string, parentEmail: string | null) {
  await prisma.studentProfile.update({
    where: { userId },
    data: parentEmail ? { parentEmail } : { parentEmail: null, parentReportEnabled: false },
  });
}

// Link de calendario (ICS/webcal) de la plataforma de la escuela — ver
// schoolCalendarUrlSchema en onboardingSchemas.ts. Se puede dar en el
// onboarding o agregar/cambiar después desde aquí.
export async function updateSchoolCalendarUrl(userId: string, schoolCalendarUrl: string | null) {
  await prisma.studentProfile.update({
    where: { userId },
    data: { schoolCalendarUrl },
  });
}

export async function updateParentReportEnabled(userId: string, enabled: boolean) {
  if (enabled) {
    const profile = await prisma.studentProfile.findUnique({ where: { userId }, select: { parentEmail: true } });
    if (!profile?.parentEmail) {
      throw new UserFacingError("Agrega primero el correo de tu padre, madre o tutor.");
    }
  }
  await prisma.studentProfile.update({
    where: { userId },
    data: { parentReportEnabled: enabled },
  });
}
