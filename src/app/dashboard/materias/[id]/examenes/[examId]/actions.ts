"use server";

import { revalidatePath } from "next/cache";
import { requireStudentProfile } from "@/lib/auth/getCurrentUser";
import { setExamTopics } from "@/services/exams/readinessService";
import { recordGrade, type GradeComparison } from "@/services/exams/gradeService";
import { runAction, type ActionResult } from "@/lib/actions/result";

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

    const { comparison } = await recordGrade({
      studentProfileId: studentProfile.id,
      userId: user.id,
      subjectId,
      examId,
      label: String(formData.get("label") ?? ""),
      score: Number(formData.get("score")),
      maxScore: Number(formData.get("maxScore") ?? 100),
    });

    revalidatePath(`/dashboard/materias/${subjectId}/examenes/${examId}`);
    return comparison;
  });
}
