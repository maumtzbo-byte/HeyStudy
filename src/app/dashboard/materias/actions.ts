"use server";

import { revalidatePath } from "next/cache";
import { requireStudentProfile } from "@/lib/auth/getCurrentUser";
import { subjectSchema, assignmentSchema, examSchema } from "@/lib/validation/subjectSchemas";
import * as subjectService from "@/services/subjects/subjectService";
import * as assignmentService from "@/services/assignments/assignmentService";
import * as examService from "@/services/exams/examService";
import * as materialService from "@/services/materials/materialService";

export type FormActionState = { error?: string; success?: boolean } | undefined;

export async function createSubjectAction(_prev: FormActionState, formData: FormData): Promise<FormActionState> {
  const { studentProfile } = await requireStudentProfile();
  const parsed = subjectSchema.safeParse({
    name: formData.get("name"),
    color: formData.get("color") || "#4F46E5",
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  await subjectService.createSubject(studentProfile.id, parsed.data);
  revalidatePath("/dashboard/materias");
  return { success: true };
}

export async function updateSubjectAction(
  subjectId: string,
  _prev: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  const { studentProfile } = await requireStudentProfile();
  const parsed = subjectSchema.safeParse({
    name: formData.get("name"),
    color: formData.get("color") || "#4F46E5",
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  await subjectService.updateSubject(studentProfile.id, subjectId, parsed.data);
  revalidatePath("/dashboard/materias");
  revalidatePath(`/dashboard/materias/${subjectId}`);
  return { success: true };
}

export async function deleteSubjectAction(subjectId: string) {
  const { studentProfile } = await requireStudentProfile();
  await subjectService.deleteSubject(studentProfile.id, subjectId);
  revalidatePath("/dashboard/materias");
}

export async function createAssignmentAction(
  _prev: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  const { studentProfile } = await requireStudentProfile();
  const parsed = assignmentSchema.safeParse({
    subjectId: formData.get("subjectId"),
    title: formData.get("title"),
    description: formData.get("description"),
    dueDate: formData.get("dueDate"),
    status: "PENDIENTE",
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  await assignmentService.createAssignment(studentProfile.id, parsed.data);
  revalidatePath(`/dashboard/materias/${parsed.data.subjectId}`);
  revalidatePath("/dashboard");
  return { success: true };
}

export async function toggleAssignmentAction(assignmentId: string, subjectId: string) {
  const { studentProfile } = await requireStudentProfile();
  await assignmentService.toggleAssignmentStatus(studentProfile.id, assignmentId);
  revalidatePath(`/dashboard/materias/${subjectId}`);
  revalidatePath("/dashboard");
}

export async function deleteAssignmentAction(assignmentId: string, subjectId: string) {
  const { studentProfile } = await requireStudentProfile();
  await assignmentService.deleteAssignment(studentProfile.id, assignmentId);
  revalidatePath(`/dashboard/materias/${subjectId}`);
  revalidatePath("/dashboard");
}

export async function createExamAction(_prev: FormActionState, formData: FormData): Promise<FormActionState> {
  const { studentProfile } = await requireStudentProfile();
  const parsed = examSchema.safeParse({
    subjectId: formData.get("subjectId"),
    title: formData.get("title"),
    examDate: formData.get("examDate"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  await examService.createExam(studentProfile.id, parsed.data);
  revalidatePath(`/dashboard/materias/${parsed.data.subjectId}`);
  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteExamAction(examId: string, subjectId: string) {
  const { studentProfile } = await requireStudentProfile();
  await examService.deleteExam(studentProfile.id, examId);
  revalidatePath(`/dashboard/materias/${subjectId}`);
  revalidatePath("/dashboard");
}

export async function uploadMaterialAction(_prev: FormActionState, formData: FormData): Promise<FormActionState> {
  const { user, studentProfile } = await requireStudentProfile();
  const subjectId = formData.get("subjectId");
  const file = formData.get("file");

  if (typeof subjectId !== "string" || !subjectId) return { error: "Materia inválida" };
  if (!(file instanceof File) || file.size === 0) return { error: "Selecciona un archivo" };

  try {
    await materialService.uploadMaterial({ userId: user.id, studentProfileId: studentProfile.id, subjectId, file });
  } catch (err) {
    return { error: err instanceof Error ? err.message : "No se pudo subir el archivo" };
  }

  revalidatePath(`/dashboard/materias/${subjectId}`);
  return { success: true };
}

export async function deleteMaterialAction(materialId: string, subjectId: string) {
  const { studentProfile } = await requireStudentProfile();
  await materialService.deleteMaterial(studentProfile.id, materialId);
  revalidatePath(`/dashboard/materias/${subjectId}`);
}

export async function getMaterialUrlAction(materialId: string) {
  const { studentProfile } = await requireStudentProfile();
  return materialService.getMaterialSignedUrl(studentProfile.id, materialId);
}
