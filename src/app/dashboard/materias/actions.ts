"use server";

import { revalidatePath } from "next/cache";
import { requireStudentProfile } from "@/lib/auth/getCurrentUser";
import { subjectSchema, assignmentSchema, examSchema } from "@/lib/validation/subjectSchemas";
import * as subjectService from "@/services/subjects/subjectService";
import * as assignmentService from "@/services/assignments/assignmentService";
import * as examService from "@/services/exams/examService";
import * as materialService from "@/services/materials/materialService";
import { runAction, UserFacingError, type ActionResult } from "@/lib/actions/result";

export async function createSubjectAction(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  return runAction(async () => {
    const { studentProfile } = await requireStudentProfile();
    const parsed = subjectSchema.safeParse({
      name: formData.get("name"),
      color: formData.get("color") || "#C1502E",
    });
    if (!parsed.success) throw new UserFacingError(parsed.error.issues[0]?.message ?? "Datos inválidos");

    await subjectService.createSubject(studentProfile.id, parsed.data);
    revalidatePath("/dashboard/materias");
  });
}

export async function updateSubjectAction(
  subjectId: string,
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  return runAction(async () => {
    const { studentProfile } = await requireStudentProfile();
    const parsed = subjectSchema.safeParse({
      name: formData.get("name"),
      color: formData.get("color") || "#C1502E",
    });
    if (!parsed.success) throw new UserFacingError(parsed.error.issues[0]?.message ?? "Datos inválidos");

    await subjectService.updateSubject(studentProfile.id, subjectId, parsed.data);
    revalidatePath("/dashboard/materias");
    revalidatePath(`/dashboard/materias/${subjectId}`);
  });
}

export async function deleteSubjectAction(subjectId: string): Promise<ActionResult> {
  return runAction(async () => {
    const { studentProfile } = await requireStudentProfile();
    await subjectService.deleteSubject(studentProfile.id, subjectId);
    revalidatePath("/dashboard/materias");
  });
}

export async function createAssignmentAction(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  return runAction(async () => {
    const { studentProfile } = await requireStudentProfile();
    const parsed = assignmentSchema.safeParse({
      subjectId: formData.get("subjectId"),
      title: formData.get("title"),
      description: formData.get("description"),
      dueDate: formData.get("dueDate"),
      status: "PENDIENTE",
    });
    if (!parsed.success) throw new UserFacingError(parsed.error.issues[0]?.message ?? "Datos inválidos");

    await assignmentService.createAssignment(studentProfile.id, parsed.data);
    revalidatePath(`/dashboard/materias/${parsed.data.subjectId}`);
    revalidatePath("/dashboard");
  });
}

// Invocada vía <form action={...bind}> (no useActionState), así que React
// exige que devuelva void — nada lee el ActionResult. runAction se usa
// igual adentro para que un error no tumbe la página a una pantalla rota;
// simplemente no se propaga el resultado.
export async function toggleAssignmentAction(assignmentId: string, subjectId: string): Promise<void> {
  await runAction(async () => {
    const { studentProfile } = await requireStudentProfile();
    await assignmentService.toggleAssignmentStatus(studentProfile.id, assignmentId);
    revalidatePath(`/dashboard/materias/${subjectId}`);
    revalidatePath("/dashboard");
  });
}

export async function deleteAssignmentAction(assignmentId: string, subjectId: string): Promise<void> {
  await runAction(async () => {
    const { studentProfile } = await requireStudentProfile();
    await assignmentService.deleteAssignment(studentProfile.id, assignmentId);
    revalidatePath(`/dashboard/materias/${subjectId}`);
    revalidatePath("/dashboard");
  });
}

export async function createExamAction(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  return runAction(async () => {
    const { studentProfile } = await requireStudentProfile();
    const parsed = examSchema.safeParse({
      subjectId: formData.get("subjectId"),
      title: formData.get("title"),
      examDate: formData.get("examDate"),
    });
    if (!parsed.success) throw new UserFacingError(parsed.error.issues[0]?.message ?? "Datos inválidos");

    await examService.createExam(studentProfile.id, parsed.data);
    revalidatePath(`/dashboard/materias/${parsed.data.subjectId}`);
    revalidatePath("/dashboard");
  });
}

export async function deleteExamAction(examId: string, subjectId: string): Promise<void> {
  await runAction(async () => {
    const { studentProfile } = await requireStudentProfile();
    await examService.deleteExam(studentProfile.id, examId);
    revalidatePath(`/dashboard/materias/${subjectId}`);
    revalidatePath("/dashboard");
  });
}

export async function uploadMaterialAction(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  return runAction(async () => {
    const { user, studentProfile } = await requireStudentProfile();
    const subjectId = formData.get("subjectId");
    const file = formData.get("file");

    if (typeof subjectId !== "string" || !subjectId) throw new UserFacingError("Materia inválida");
    if (!(file instanceof File) || file.size === 0) throw new UserFacingError("Selecciona un archivo");

    await materialService.uploadMaterial({ userId: user.id, studentProfileId: studentProfile.id, subjectId, file });
    revalidatePath(`/dashboard/materias/${subjectId}`);
  });
}

export async function deleteMaterialAction(materialId: string, subjectId: string): Promise<void> {
  await runAction(async () => {
    const { studentProfile } = await requireStudentProfile();
    await materialService.deleteMaterial(studentProfile.id, materialId);
    revalidatePath(`/dashboard/materias/${subjectId}`);
  });
}

export async function getMaterialUrlAction(materialId: string): Promise<ActionResult<string>> {
  return runAction(async () => {
    const { studentProfile } = await requireStudentProfile();
    return materialService.getMaterialSignedUrl(studentProfile.id, materialId);
  });
}
