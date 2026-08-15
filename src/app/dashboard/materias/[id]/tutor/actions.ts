"use server";

import { redirect } from "next/navigation";
import { requireStudentProfile } from "@/lib/auth/getCurrentUser";
import { getAITier } from "@/services/usage/getAITier";
import { startConversation, sendMessage } from "@/services/tutor/tutorService";
import type { TutorMode } from "@/services/ai/types";

export async function startConversationAction(subjectId: string, mode: TutorMode) {
  const { studentProfile } = await requireStudentProfile();

  const conversationId = await startConversation({
    studentProfileId: studentProfile.id,
    subjectId,
    mode,
  });

  redirect(`/dashboard/materias/${subjectId}/tutor/${conversationId}`);
}

export async function sendMessageAction(
  conversationId: string,
  content: string,
): Promise<{ reply: string } | { error: string }> {
  const { user, studentProfile } = await requireStudentProfile();
  const tier = await getAITier(user.id);

  try {
    const reply = await sendMessage({
      studentProfileId: studentProfile.id,
      userId: user.id,
      tier,
      conversationId,
      content,
    });
    return { reply };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "No se pudo enviar tu mensaje" };
  }
}
