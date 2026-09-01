"use server";

import { revalidatePath } from "next/cache";
import { requireStudentProfile } from "@/lib/auth/getCurrentUser";
import { runAction } from "@/lib/actions/result";
import {
  getUploadUrl,
  createStudyDrop,
  deleteStudyDrop,
  toggleLike,
  getFeed,
} from "@/services/studydrops/studyDropService";
import type { StudyDropMediaType } from "@/generated/prisma/client";

// A diferencia de createGroupAction/joinGroupAction (formularios HTML
// tradicionales, FormData tiene sentido), la subida de un drop es un flujo
// en dos pasos manejado por JS del lado del cliente (pedir signed URL, subir
// directo a Storage, avisar cuando terminó) — mismo estilo de argumentos
// tipados que leaveGroupAction/shareTodayPlanAction, no FormData.

export async function getStudyDropUploadUrlAction(params: {
  fileName: string;
  contentType: string;
  fileSizeBytes: number;
}) {
  return runAction(async () => {
    const { user } = await requireStudentProfile();
    return getUploadUrl({ userId: user.id, ...params });
  });
}

export async function createStudyDropAction(params: {
  subjectId: string | null;
  caption: string | null;
  mediaType: StudyDropMediaType;
  storagePath: string;
  durationSeconds: number | null;
  fileSizeKb: number | null;
}) {
  return runAction(async () => {
    const { studentProfile } = await requireStudentProfile();
    const drop = await createStudyDrop(studentProfile.id, { authorName: studentProfile.displayName, ...params });
    revalidatePath("/dashboard/drops");
    return drop;
  });
}

export async function toggleStudyDropLikeAction(studyDropId: string) {
  return runAction(async () => {
    const { studentProfile } = await requireStudentProfile();
    const result = await toggleLike(studentProfile.id, studyDropId);
    revalidatePath("/dashboard/drops");
    return result;
  });
}

export async function deleteStudyDropAction(studyDropId: string) {
  return runAction(async () => {
    const { studentProfile } = await requireStudentProfile();
    await deleteStudyDrop(studentProfile.id, studyDropId);
    revalidatePath("/dashboard/drops");
  });
}

// Para el botón "Cargar más" del feed — la primera página ya viene del
// server component (page.tsx), esto sólo trae páginas siguientes.
export async function loadMoreStudyDropsAction(cursor: string) {
  return runAction(async () => {
    const { studentProfile } = await requireStudentProfile();
    return getFeed(studentProfile.id, { cursor });
  });
}
