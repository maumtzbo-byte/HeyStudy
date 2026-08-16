"use server";

import { redirect } from "next/navigation";
import { requireStudentProfile } from "@/lib/auth/getCurrentUser";
import { runAction } from "@/lib/actions/result";
import { getAITier } from "@/services/usage/getAITier";
import { startConversation, sendMessage } from "@/services/tutor/tutorService";
import type { TutorMode } from "@/services/ai/types";

export async function startConversationAction(
  subjectId: string,
  mode: TutorMode,
  customTutorId?: string | null,
) {
  const { studentProfile } = await requireStudentProfile();

  const conversationId = await startConversation({
    studentProfileId: studentProfile.id,
    subjectId,
    mode,
    customTutorId,
  });

  redirect(`/dashboard/materias/${subjectId}/tutor/${conversationId}`);
}

export async function sendMessageAction(conversationId: string, content: string) {
  return runAction(async () => {
    const { user, studentProfile } = await requireStudentProfile();
    const tier = await getAITier(user.id);
    return sendMessage({
      studentProfileId: studentProfile.id,
      userId: user.id,
      tier,
      conversationId,
      content,
    });
  });
}
