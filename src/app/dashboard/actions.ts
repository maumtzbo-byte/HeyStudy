"use server";

import { revalidatePath } from "next/cache";
import { requireStudentProfile } from "@/lib/auth/getCurrentUser";
import { getAITier } from "@/services/usage/getAITier";
import { generateTodayPlan, toggleStudyPlanItem } from "@/services/studyplan/studyPlanService";

export type PlanActionState = { error?: string } | undefined;

export async function generatePlanAction(_prev: PlanActionState, formData: FormData): Promise<PlanActionState> {
  const { user, studentProfile } = await requireStudentProfile();
  const tier = await getAITier(user.id);
  const minutesAvailable = Number(formData.get("minutesAvailable")) || 45;

  const plan = await generateTodayPlan({ studentProfileId: studentProfile.id, userId: user.id, tier, minutesAvailable });
  if (!plan) {
    return { error: "Diagnostica al menos un tema antes de pedir tu plan de estudio." };
  }

  revalidatePath("/dashboard");
}

export async function toggleStudyPlanItemAction(itemId: string) {
  const { studentProfile } = await requireStudentProfile();
  await toggleStudyPlanItem(studentProfile.id, itemId);
  revalidatePath("/dashboard");
}
