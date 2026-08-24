"use server";

import { revalidatePath } from "next/cache";
import { requireStudentProfile } from "@/lib/auth/getCurrentUser";
import { setExamTopics } from "@/services/exams/readinessService";
import { recordGrade, type GradeComparison } from "@/services/exams/gradeService";
import { runAction, UserFacingError, type ActionResult } from "@/lib/actions/result";
import { gradeSchema } from "@/lib/validation/subjectSchemas";

export async function setExamTopicsAction(subjectId: string, examId: string, formData: FormData) {
  const { studentProfile } = await requireStudentProfile();
  const topicIds = formData.getAll("topicIds").map((v) => v.toString());

  await setExamTopics(studentProfile.id, examId, topicIds);
  revalidatePath(`/dashboard/materias/${subjectId}/examenes/${examId}`);
  revalidatePath("/dashboard");
}

export async function recordGradeAction(
  subjectId: string,
  examId: string,
  _prev: ActionResult<GradeComparison | null> | undefined,
  formData: FormData,
): Promise<ActionResult<GradeComparison | null>> {
  return runAction(async () => {
    const { studentProfile, user } = await requireStudentProfile();

    const parsed = gradeSchema.safeParse({
      subjectId,
      examId,
      label: formData.get("label"),
      score: formData.get("score"),
      maxScore: formData.get("maxScore"),
    });
    if (!parsed.success) {
      throw new UserFacingError(parsed.error.issues[0]?.message ?? "Datos inválidos");
    }

    const { comparison } = await recordGrade({
      studentProfileId: studentProfile.id,
      userId: user.id,
      subjectId: parsed.data.subjectId,
      examId: parsed.data.examId || null,
      label: parsed.data.label,
      score: parsed.data.score,
      maxScore: parsed.data.maxScore,
    });

    revalidatePath(`/dashboard/materias/${subjectId}/examenes/${examId}`);
    return comparison;
  });
}
