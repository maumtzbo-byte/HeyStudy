"use server";

import { revalidatePath } from "next/cache";
import { requireStudentProfile } from "@/lib/auth/getCurrentUser";
import { runAction, type ActionResult } from "@/lib/actions/result";
import {
  createCustomTutor,
  updateCustomTutor,
  deleteCustomTutor,
  type CustomTutorInput,
} from "@/services/tutor/customTutorService";
import type { TutorMode } from "@/services/ai/types";

const VALID_MODES: TutorMode[] = ["socratico", "explicar", "pista", "practica"];

function parseTutorForm(formData: FormData): CustomTutorInput {
  const rawMode = String(formData.get("baseMode") ?? "explicar");
  const baseMode = (VALID_MODES as string[]).includes(rawMode) ? (rawMode as TutorMode) : "explicar";
  const subjectId = String(formData.get("subjectId") ?? "").trim();

  return {
    name: String(formData.get("name") ?? ""),
    emoji: String(formData.get("emoji") ?? "🎓"),
    instructions: String(formData.get("instructions") ?? ""),
    baseMode,
    subjectId: subjectId || null,
  };
}

export async function createTutorAction(_prev: ActionResult | undefined, formData: FormData) {
  return runAction(async () => {
    const { studentProfile } = await requireStudentProfile();
    await createCustomTutor(studentProfile.id, parseTutorForm(formData));
    revalidatePath("/dashboard/tutores");
  });
}

export async function updateTutorAction(_prev: ActionResult | undefined, formData: FormData) {
  return runAction(async () => {
    const { studentProfile } = await requireStudentProfile();
    const tutorId = String(formData.get("tutorId") ?? "");
    await updateCustomTutor(studentProfile.id, tutorId, parseTutorForm(formData));
    revalidatePath("/dashboard/tutores");
  });
}

export async function deleteTutorAction(tutorId: string) {
  return runAction(async () => {
    const { studentProfile } = await requireStudentProfile();
    await deleteCustomTutor(studentProfile.id, tutorId);
    revalidatePath("/dashboard/tutores");
  });
}
