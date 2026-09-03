"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireStudentProfile } from "@/lib/auth/getCurrentUser";
import { getAITier } from "@/services/usage/getAITier";
import { runAction } from "@/lib/actions/result";
import { ensureTopicsForSubject, loadStandardizedTopics } from "@/services/knowledge/topicService";
import {
  startDiagnosticSession,
  submitAnswer,
  completeDiagnosticSession,
} from "@/services/knowledge/diagnosisService";
import { track } from "@/lib/analytics/server";
import { scoreBucket } from "@/lib/analytics/events";

// Estas tres iban sin runAction, y no era un detalle de estilo: el
// UserFacingError de claimDiagnostic ("Ya usaste tus N diagnósticos de este
// mes") subía sin manejar hasta el cliente, donde Next redacta el mensaje en
// producción. O sea, el aviso de límite del plan —la única conversación de
// venta del producto— era literalmente inalcanzable para el estudiante.
export async function generateTopicsAction(subjectId: string) {
  return runAction(async () => {
    const { user, studentProfile } = await requireStudentProfile();
    const tier = await getAITier(user.id);
    await ensureTopicsForSubject({ studentProfileId: studentProfile.id, subjectId, userId: user.id, tier });
    revalidatePath(`/dashboard/materias/${subjectId}/diagnostico`);
  });
}

export async function loadStandardizedTopicsAction(subjectId: string, templateId: string) {
  return runAction(async () => {
    const { studentProfile } = await requireStudentProfile();
    await loadStandardizedTopics(studentProfile.id, subjectId, templateId);
    revalidatePath(`/dashboard/materias/${subjectId}/diagnostico`);
  });
}

export async function startDiagnosticAction(subjectId: string, topicId: string) {
  return runAction(async () => {
    const { user, studentProfile } = await requireStudentProfile();
    const tier = await getAITier(user.id);

    const sessionId = await startDiagnosticSession({
      studentProfileId: studentProfile.id,
      userId: user.id,
      subjectId,
      topicId,
      tier,
    });

    // runAction reenvía el error de control de flujo de redirect().
    redirect(`/dashboard/materias/${subjectId}/diagnostico/${sessionId}`);
  });
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
  const { user, studentProfile } = await requireStudentProfile();
  const { answeredCount, averageMastery } = await completeDiagnosticSession(studentProfile.id, sessionId);

  await track(user.id, "diagnostic_completed", {
    score_bucket: scoreBucket(averageMastery),
    questions_answered: answeredCount,
  });

  revalidatePath(`/dashboard/materias/${subjectId}`);
  redirect(`/dashboard/materias/${subjectId}/diagnostico`);
}
