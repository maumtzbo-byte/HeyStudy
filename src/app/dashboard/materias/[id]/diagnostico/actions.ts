"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireStudentProfile } from "@/lib/auth/getCurrentUser";
import { getAITier } from "@/services/usage/getAITier";
import { ensureTopicsForSubject } from "@/services/knowledge/topicService";
import {
  startDiagnosticSession,
  submitAnswer,
  completeDiagnosticSession,
} from "@/services/knowledge/diagnosisService";

export async function generateTopicsAction(subjectId: string) {
  const { user, studentProfile } = await requireStudentProfile();
  const tier = await getAITier(user.id);
  await ensureTopicsForSubject({ studentProfileId: studentProfile.id, subjectId, userId: user.id, tier });
  revalidatePath(`/dashboard/materias/${subjectId}/diagnostico`);
}

export async function startDiagnosticAction(subjectId: string, topicId: string) {
  const { user, studentProfile } = await requireStudentProfile();
  const tier = await getAITier(user.id);

  const sessionId = await startDiagnosticSession({
    studentProfileId: studentProfile.id,
    userId: user.id,
    subjectId,
    topicId,
    tier,
  });

  redirect(`/dashboard/materias/${subjectId}/diagnostico/${sessionId}`);
}

export type AnswerActionState =
  | { error: string }
  | { result: { isCorrect: boolean; feedback: string; masteryEstimate: number } }
  | undefined;

export async function submitAnswerAction(
  questionId: string,
  _prev: AnswerActionState,
  formData: FormData,
): Promise<AnswerActionState> {
  const { user, studentProfile } = await requireStudentProfile();
  const tier = await getAITier(user.id);
  const studentResponse = (formData.get("studentResponse") as string | null)?.trim();

  if (!studentResponse) return { error: "Escribe tu respuesta" };

  try {
    const { diagnosis } = await submitAnswer({
      studentProfileId: studentProfile.id,
      userId: user.id,
      questionId,
      studentResponse,
      tier,
    });
    return {
      result: {
        isCorrect: diagnosis.isCorrect,
        feedback: diagnosis.feedback,
        masteryEstimate: diagnosis.masteryEstimate,
      },
    };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "No se pudo evaluar tu respuesta" };
  }
}

export async function finishSessionAction(sessionId: string, subjectId: string) {
  const { studentProfile } = await requireStudentProfile();
  await completeDiagnosticSession(studentProfile.id, sessionId);
  revalidatePath(`/dashboard/materias/${subjectId}`);
  redirect(`/dashboard/materias/${subjectId}/diagnostico`);
}
