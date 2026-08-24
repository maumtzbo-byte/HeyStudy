import "server-only";
import { prisma } from "@/lib/prisma/client";
import { UserFacingError } from "@/lib/actions/result";

// Confirma que la materia es del estudiante antes de dejarlo leer o escribir
// algo relacionado con ella. Antes había una copia casi idéntica de esto en
// 8 servicios distintos, con inconsistencias sutiles entre copias (algunas
// devolvían la materia y otras no, el mensaje de error variaba en
// puntuación) — señal de que se fueron copiando a mano en vez de compartir
// una sola fuente. Centralizado aquí para que un cambio futuro (ej. un
// filtro de borrado suave) sólo se tenga que hacer una vez.
export async function assertSubjectOwnership(studentProfileId: string, subjectId: string) {
  const subject = await prisma.subject.findFirst({ where: { id: subjectId, studentProfileId } });
  if (!subject) throw new UserFacingError("Materia no encontrada");
  return subject;
}

// Variante para los casos donde el subjectId es opcional (ej. un tutor
// personalizado que puede aplicar a todas las materias en vez de una sola):
// null es válido y no hay nada que verificar.
export async function assertSubjectOwnershipIfSet(studentProfileId: string, subjectId: string | null) {
  if (!subjectId) return null;
  return assertSubjectOwnership(studentProfileId, subjectId);
}
