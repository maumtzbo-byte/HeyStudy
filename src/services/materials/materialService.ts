import "server-only";
import { UserFacingError } from "@/lib/actions/result";
import { prisma } from "@/lib/prisma/client";
import { createClient } from "@/lib/supabase/server";
import { assertSubjectOwnership } from "@/lib/auth/ownership";
import { checkRateLimit } from "@/services/security/rateLimit";

const MATERIALS_BUCKET = "materials";
const ALLOWED_TYPES: Record<string, "PDF" | "IMAGEN"> = {
  "application/pdf": "PDF",
  "image/png": "IMAGEN",
  "image/jpeg": "IMAGEN",
  "image/webp": "IMAGEN",
};
const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024;

// file.name lo controla el cliente; el RLS del bucket ya impide que un
// usuario toque la carpeta de otro ((storage.foldername(name))[1] = auth.uid()),
// pero igual lo saneamos antes de usarlo en el path por profundidad de defensa.
function sanitizeFileName(name: string): string {
  const safe = name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-150);
  return safe || "archivo";
}

export async function uploadMaterial(params: {
  userId: string;
  studentProfileId: string;
  subjectId: string;
  file: File;
}) {
  const { userId, studentProfileId, subjectId, file } = params;
  await assertSubjectOwnership(studentProfileId, subjectId);

  // 25 MB por archivo pero archivos ilimitados: sin contador, subir es un
  // drenaje de storage gratis. El límite va después de verificar que la
  // materia es suya, para no gastar cuota en un intento que igual falla.
  await checkRateLimit(
    `material-upload:${studentProfileId}`,
    30,
    60 * 60,
    "Subiste muchos archivos seguidos. Espera un rato antes de subir otro.",
  );

  const fileType = ALLOWED_TYPES[file.type];
  if (!fileType) throw new UserFacingError("Solo se permiten PDF o imágenes (PNG, JPG, WEBP)");
  if (file.size > MAX_FILE_SIZE_BYTES) throw new UserFacingError("El archivo no puede pesar más de 25 MB");

  const storagePath = `${userId}/${subjectId}/${Date.now()}-${sanitizeFileName(file.name)}`;

  const supabase = await createClient();
  const { error: uploadError } = await supabase.storage.from(MATERIALS_BUCKET).upload(storagePath, file, {
    contentType: file.type,
    upsert: false,
  });
  if (uploadError) throw new UserFacingError(`No se pudo subir el archivo: ${uploadError.message}`);

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
  if (!material) throw new UserFacingError("Material no encontrado");

  const supabase = await createClient();
  await supabase.storage.from(MATERIALS_BUCKET).remove([material.storagePath]);

  return prisma.material.delete({ where: { id: materialId } });
}

export async function getMaterialSignedUrl(studentProfileId: string, materialId: string) {
  const material = await prisma.material.findFirst({
    where: { id: materialId, subject: { studentProfileId } },
  });
  if (!material) throw new UserFacingError("Material no encontrado");

  const supabase = await createClient();
  const { data, error } = await supabase.storage
    .from(MATERIALS_BUCKET)
    .createSignedUrl(material.storagePath, 60 * 5);
  if (error || !data) throw new UserFacingError("No se pudo generar el enlace del archivo");
  return data.signedUrl;
}
