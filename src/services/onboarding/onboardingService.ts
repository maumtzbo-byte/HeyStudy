import "server-only";
import { prisma } from "@/lib/prisma/client";
import type { OnboardingInput } from "@/lib/validation/onboardingSchemas";

const SUBJECT_COLORS = ["#C1502E", "#2A6F73", "#B8860B", "#4B7B5D", "#7D4F6D", "#B15D5D"];

export async function completeOnboarding(params: { userId: string; input: OnboardingInput }) {
  const { userId, input } = params;

  const existing = await prisma.studentProfile.findUnique({ where: { userId } });
  if (existing) return existing;

  const now = new Date();
  const periodEnd = new Date(now);
  periodEnd.setDate(periodEnd.getDate() + 30);

  return prisma.$transaction(async (tx) => {
    const studentProfile = await tx.studentProfile.create({
      data: {
        userId,
        displayName: input.displayName,
        educationLevel: input.educationLevel,
        onboardedAt: now,
      },
    });

    await tx.subject.createMany({
      data: input.subjectNames.map((name, i) => ({
        studentProfileId: studentProfile.id,
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

    return studentProfile;
  });
}
