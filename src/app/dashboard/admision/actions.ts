"use server";

import { redirect } from "next/navigation";
import { requireStudentProfile } from "@/lib/auth/getCurrentUser";
import { selectAdmissionTarget } from "@/services/knowledge/admissionExamService";
import { runAction } from "@/lib/actions/result";

export async function selectAdmissionTargetAction(targetId: string) {
  return runAction(async () => {
    const { studentProfile } = await requireStudentProfile();
    const subjectId = await selectAdmissionTarget(studentProfile.id, targetId);
    // runAction reenvía el error de control de flujo de redirect(), así que
    // esto navega en vez de tragarse la excepción.
    redirect(`/dashboard/materias/${subjectId}/diagnostico`);
  });
}
