"use server";

import { revalidatePath } from "next/cache";
import { requireStudentProfile } from "@/lib/auth/getCurrentUser";
import { getAITier } from "@/services/usage/getAITier";
import { generateTodayPlan, toggleStudyPlanItem } from "@/services/studyplan/studyPlanService";
import { getOrGenerateVideoNotes } from "@/services/video/videoNotesService";
import { runAction } from "@/lib/actions/result";
import { prisma } from "@/lib/prisma/client";
import { track } from "@/lib/analytics/server";

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

  // is_first separa el momento "ajá" (la primera vez que ve un plan hecho
  // para él) del uso recurrente. Son dos preguntas distintas —activación vs
  // retención— y mezcladas en un solo número no se responde ninguna.
  const planCount = await prisma.studyPlan.count({ where: { studentProfileId: studentProfile.id } });
  await track(user.id, "study_plan_generated", {
    items_count: plan.items.length,
    is_first: planCount <= 1,
  });

  revalidatePath("/dashboard");
}

export async function toggleStudyPlanItemAction(itemId: string) {
  const { user, studentProfile } = await requireStudentProfile();
  const item = await toggleStudyPlanItem(studentProfile.id, itemId);

  // Sólo al marcar como hecho, no al desmarcar: lo que se quiere medir es
  // trabajo terminado, y contar los dos lados infla la cifra con el vaivén
  // de quien se equivoca de casilla.
  if (item.completed) {
    const planItemCount = await prisma.studyPlanItem.count({ where: { studyPlanId: item.studyPlanId } });
    await track(user.id, "study_plan_item_completed", { plan_items_total: planItemCount });
  }

  revalidatePath("/dashboard");
}

export async function generateVideoNotesAction(knowledgeTopicId: string, youtubeVideoId: string) {
  return runAction(async () => {
    const { user, studentProfile } = await requireStudentProfile();
    const tier = await getAITier(user.id);
    return getOrGenerateVideoNotes({
      knowledgeTopicId,
      youtubeVideoId,
      studentProfileId: studentProfile.id,
      userId: user.id,
      tier,
    });
  });
}
