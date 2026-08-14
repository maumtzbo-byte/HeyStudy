"use server";

import { revalidatePath } from "next/cache";
import { requireStudentProfile } from "@/lib/auth/getCurrentUser";
import { setExamTopics } from "@/services/exams/readinessService";

export async function setExamTopicsAction(subjectId: string, examId: string, formData: FormData) {
  const { studentProfile } = await requireStudentProfile();
  const topicIds = formData.getAll("topicIds").map((v) => v.toString());

  await setExamTopics(studentProfile.id, examId, topicIds);
  revalidatePath(`/dashboard/materias/${subjectId}/examenes/${examId}`);
  revalidatePath("/dashboard");
}
