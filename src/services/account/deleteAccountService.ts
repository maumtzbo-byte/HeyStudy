import "server-only";
import { prisma } from "@/lib/prisma/client";
import { createAdminClient } from "@/lib/supabase/admin";
import { UserFacingError } from "@/lib/actions/result";

const MATERIALS_BUCKET = "materials";

// La política de privacidad promete que el estudiante puede "eliminar tu
// cuenta completa desde tu perfil en cualquier momento" — esa promesa no
// tenía ningún código detrás. Esto la cumple de verdad.
//
// Orden deliberado, de menos a más irreversible: primero los archivos de
// Storage (si falla, no rompió nada, se puede reintentar), luego la fila
// de Prisma (el cascade se lleva perfil, materias, tareas, exámenes,
// diagnósticos, planes, conversaciones — todo), y al final, sólo si lo
// anterior funcionó, la fila de auth.users — es el punto de no retorno
// porque después de eso el estudiante ya no puede iniciar sesión para
// reintentar. Borrar auth.users primero dejaría datos huérfanos e
// inalcanzables si un paso posterior fallara.
export async function deleteAccount(userId: string): Promise<void> {
  const studentProfile = await prisma.studentProfile.findUnique({
    where: { userId },
    select: { id: true },
  });

  if (studentProfile) {
    const materials = await prisma.material.findMany({
      where: { subject: { studentProfileId: studentProfile.id } },
      select: { storagePath: true },
    });

    if (materials.length > 0) {
      const admin = createAdminClient();
      const { error: storageError } = await admin.storage
        .from(MATERIALS_BUCKET)
        .remove(materials.map((m) => m.storagePath));
      // No abortamos por esto: un archivo huérfano en Storage es un
      // problema de limpieza, no una razón para negarle a alguien el
      // derecho a que se borren sus datos académicos.
      if (storageError) {
        console.error("[deleteAccount] no se pudieron borrar todos los archivos de Storage", storageError);
      }
    }
  }

  // El cascade en el schema se encarga del resto: StudentProfile,
  // Subject, Assignment, Exam, Material, Grade, KnowledgeTopic,
  // KnowledgeMastery, StudySession, Question, Answer, ErrorPattern,
  // StudyPlan, StudyPlanItem, TutorConversation, CustomTutor,
  // TutorChatMessage, Subscription, AIUsageLog, membresías de grupo.
  await prisma.user.delete({ where: { id: userId } });

  const admin = createAdminClient();
  const { error: authError } = await admin.auth.admin.deleteUser(userId);
  if (authError) {
    // Los datos de la app ya se borraron — lo que falló es la cuenta de
    // acceso en sí. Se lo decimos tal cual al estudiante en vez de
    // fingir que todo salió bien.
    throw new UserFacingError(
      "Tus datos se eliminaron, pero no pudimos cerrar tu cuenta de acceso por completo. Escríbenos para confirmarlo.",
    );
  }
}
