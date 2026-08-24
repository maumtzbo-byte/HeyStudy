import "server-only";
import { prisma } from "@/lib/prisma/client";
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
