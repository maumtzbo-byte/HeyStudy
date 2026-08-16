import "server-only";
import { prisma } from "@/lib/prisma/client";
import { UserFacingError } from "@/lib/actions/result";
import { MAX_TUTOR_INSTRUCTIONS } from "@/services/ai/AIProvider";
import type { TutorMode } from "@/services/ai/types";
import type { TutorConversationMode as DbTutorMode } from "@/generated/prisma/client";

export const MODE_TO_DB: Record<TutorMode, DbTutorMode> = {
  socratico: "SOCRATICO",
  explicar: "EXPLICAR",
  pista: "PISTA",
  practica: "PRACTICA",
};

export const MODE_FROM_DB: Record<DbTutorMode, TutorMode> = {
  SOCRATICO: "socratico",
  EXPLICAR: "explicar",
  PISTA: "pista",
  PRACTICA: "practica",
};

const MAX_TUTORS_PER_STUDENT = 12;
const MAX_NAME_LENGTH = 40;

export interface CustomTutorInput {
  name: string;
  emoji: string;
  instructions: string;
  baseMode: TutorMode;
  subjectId: string | null;
}

function normalize(input: CustomTutorInput) {
  const name = input.name.trim();
  const instructions = input.instructions.trim();

  if (name.length < 2) throw new UserFacingError("Ponle un nombre de al menos 2 caracteres.");
  if (name.length > MAX_NAME_LENGTH) throw new UserFacingError(`El nombre no puede pasar de ${MAX_NAME_LENGTH} caracteres.`);
  if (instructions.length < 10) {
    throw new UserFacingError("Describe con un poco más de detalle cómo quieres que te explique.");
  }
  if (instructions.length > MAX_TUTOR_INSTRUCTIONS) {
    throw new UserFacingError(`La personalidad no puede pasar de ${MAX_TUTOR_INSTRUCTIONS} caracteres.`);
  }

  // Un emoji puede ocupar varios code units, así que se mide por caracteres
  // reales y se recorta al primero.
  const emoji = [...input.emoji.trim()][0] ?? "🎓";

  return { name, emoji, instructions, baseMode: MODE_TO_DB[input.baseMode], subjectId: input.subjectId || null };
}

// Si el tutor está atado a una materia, esa materia tiene que ser del propio
// estudiante — si no, el subjectId de otra persona se colaría por el form.
async function assertSubjectOwnership(studentProfileId: string, subjectId: string | null) {
  if (!subjectId) return;
  const subject = await prisma.subject.findFirst({ where: { id: subjectId, studentProfileId }, select: { id: true } });
  if (!subject) throw new UserFacingError("Materia no encontrada.");
}

export async function listCustomTutors(studentProfileId: string) {
  const tutors = await prisma.customTutor.findMany({
    where: { studentProfileId },
    orderBy: { createdAt: "asc" },
    include: { subject: { select: { id: true, name: true } } },
  });

  return tutors.map((t) => ({
    id: t.id,
    name: t.name,
    emoji: t.emoji,
    instructions: t.instructions,
    baseMode: MODE_FROM_DB[t.baseMode],
    subject: t.subject,
  }));
}

// Tutores disponibles al abrir el chat de una materia: los generales más los
// atados a esa materia.
export async function listTutorsForSubject(studentProfileId: string, subjectId: string) {
  const tutors = await prisma.customTutor.findMany({
    where: { studentProfileId, OR: [{ subjectId: null }, { subjectId }] },
    orderBy: { createdAt: "asc" },
  });

  return tutors.map((t) => ({
    id: t.id,
    name: t.name,
    emoji: t.emoji,
    baseMode: MODE_FROM_DB[t.baseMode],
  }));
}

export async function createCustomTutor(studentProfileId: string, input: CustomTutorInput) {
  const count = await prisma.customTutor.count({ where: { studentProfileId } });
  if (count >= MAX_TUTORS_PER_STUDENT) {
    throw new UserFacingError(`Puedes tener hasta ${MAX_TUTORS_PER_STUDENT} tutores. Borra uno para crear otro.`);
  }

  const data = normalize(input);
  await assertSubjectOwnership(studentProfileId, data.subjectId);

  const tutor = await prisma.customTutor.create({ data: { studentProfileId, ...data } });
  return tutor.id;
}

export async function updateCustomTutor(studentProfileId: string, tutorId: string, input: CustomTutorInput) {
  const existing = await prisma.customTutor.findFirst({
    where: { id: tutorId, studentProfileId },
    select: { id: true },
  });
  if (!existing) throw new UserFacingError("Tutor no encontrado.");

  const data = normalize(input);
  await assertSubjectOwnership(studentProfileId, data.subjectId);

  await prisma.customTutor.update({ where: { id: tutorId }, data });
}

export async function deleteCustomTutor(studentProfileId: string, tutorId: string) {
  // deleteMany con el studentProfileId en el where evita tener que leer antes
  // y garantiza que solo se borre algo propio.
  const { count } = await prisma.customTutor.deleteMany({ where: { id: tutorId, studentProfileId } });
  if (count === 0) throw new UserFacingError("Tutor no encontrado.");
}
