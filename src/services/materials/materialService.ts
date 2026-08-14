import "server-only";
import { prisma } from "@/lib/prisma/client";
import { createClient } from "@/lib/supabase/server";

const MATERIALS_BUCKET = "materials";
const ALLOWED_TYPES: Record<string, "PDF" | "IMAGEN"> = {
  "application/pdf": "PDF",
  "image/png": "IMAGEN",
  "image/jpeg": "IMAGEN",
  "image/webp": "IMAGEN",
};
const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024;

async function assertSubjectOwnership(studentProfileId: string, subjectId: string) {
  const subject = await prisma.subject.findFirst({ where: { id: subjectId, studentProfileId } });
  if (!subject) throw new Error("Materia no encontrada");
}

export async function uploadMaterial(params: {
  userId: string;
  studentProfileId: string;
  subjectId: string;
  file: File;
}) {
  const { userId, studentProfileId, subjectId, file } = params;
  await assertSubjectOwnership(studentProfileId, subjectId);

  const fileType = ALLOWED_TYPES[file.type];
  if (!fileType) throw new Error("Solo se permiten PDF o imágenes (PNG, JPG, WEBP)");
  if (file.size > MAX_FILE_SIZE_BYTES) throw new Error("El archivo no puede pesar más de 25 MB");

  const storagePath = `${userId}/${subjectId}/${Date.now()}-${file.name}`;

  const supabase = await createClient();
  const { error: uploadError } = await supabase.storage.from(MATERIALS_BUCKET).upload(storagePath, file, {
    contentType: file.type,
    upsert: false,
  });
  if (uploadError) throw new Error(`No se pudo subir el archivo: ${uploadError.message}`);

  return prisma.material.create({
    data: {
      subjectId,
      fileName: file.name,
      fileType,
      storagePath,
      fileSizeKb: Math.round(file.size / 1024),
    },
  });
}

export async function deleteMaterial(studentProfileId: string, materialId: string) {
  const material = await prisma.material.findFirst({
    where: { id: materialId, subject: { studentProfileId } },
  });
  if (!material) throw new Error("Material no encontrado");

  const supabase = await createClient();
  await supabase.storage.from(MATERIALS_BUCKET).remove([material.storagePath]);

  return prisma.material.delete({ where: { id: materialId } });
}

export async function getMaterialSignedUrl(studentProfileId: string, materialId: string) {
  const material = await prisma.material.findFirst({
    where: { id: materialId, subject: { studentProfileId } },
  });
  if (!material) throw new Error("Material no encontrado");

  const supabase = await createClient();
  const { data, error } = await supabase.storage
    .from(MATERIALS_BUCKET)
    .createSignedUrl(material.storagePath, 60 * 5);
  if (error || !data) throw new Error("No se pudo generar el enlace del archivo");
  return data.signedUrl;
}
