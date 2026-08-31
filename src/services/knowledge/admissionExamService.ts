import "server-only";
import { prisma } from "@/lib/prisma/client";
import { UserFacingError } from "@/lib/actions/result";
import { ADMISSION_TARGETS } from "@/lib/data/standardizedExams";
import { loadTopicsForFamily } from "@/services/knowledge/topicService";

// Color de marca (no uno de los rotativos de SUBJECT_COLORS en
// subjectService.ts) — para que la materia autogenerada se distinga a
// simple vista de las que el estudiante creó a mano.
const ADMISSION_SUBJECT_COLOR = "#6d46e3";

// Un clic: elige tu universidad destino → creamos (o reusamos) una materia
// dedicada a esa familia de examen y le cargamos el temario de referencia
// completo, listo para diagnosticar. Reusa la materia si el estudiante ya
// eligió antes otra universidad de la misma familia (p. ej. Tec y luego
// UDEM, ambas PAA), en vez de duplicar.
export async function selectAdmissionTarget(studentProfileId: string, targetId: string) {
  const target = ADMISSION_TARGETS.find((t) => t.id === targetId);
  if (!target) throw new UserFacingError("Examen no encontrado.");

  const subjectName = `Admisión — ${target.familyId}`;

  let subject = await prisma.subject.findFirst({ where: { studentProfileId, name: subjectName } });
  if (!subject) {
    subject = await prisma.subject.create({
      data: { studentProfileId, name: subjectName, color: ADMISSION_SUBJECT_COLOR },
    });
  }

  await loadTopicsForFamily(studentProfileId, subject.id, target.familyId);

  return subject.id;
}
