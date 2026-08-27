"use server";

import { revalidatePath } from "next/cache";
import { requireStudentProfile } from "@/lib/auth/getCurrentUser";
import { getAITier } from "@/services/usage/getAITier";
import { generateTodayPlan, toggleStudyPlanItem } from "@/services/studyplan/studyPlanService";
import { getOrGenerateVideoNotes } from "@/services/video/videoNotesService";
import { runAction } from "@/lib/actions/result";

export type PlanActionState = { error?: string } | undefined;

const MIN_MINUTES_AVAILABLE = 15;
const MAX_MINUTES_AVAILABLE = 240;

export async function generatePlanAction(_prev: PlanActionState, formData: FormData): Promise<PlanActionState> {
  const { user, studentProfile } = await requireStudentProfile();
  const tier = await getAITier(user.id);
  const rawMinutes = Number(formData.get("minutesAvailable"));
  // Sin acotar esto, un valor negativo o absurdamente grande llegaba directo
  // al prompt de la IA que arma el plan.
  const minutesAvailable = Number.isFinite(rawMinutes)
    ? Math.min(Math.max(rawMinutes, MIN_MINUTES_AVAILABLE), MAX_MINUTES_AVAILABLE)
    : 45;

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

export async function generateVideoNotesAction(knowledgeTopicId: string, youtubeVideoId: string) {
  return runAction(async () => {
    const { user } = await requireStudentProfile();
    const tier = await getAITier(user.id);
    return getOrGenerateVideoNotes({ knowledgeTopicId, youtubeVideoId, userId: user.id, tier });
  });
}
