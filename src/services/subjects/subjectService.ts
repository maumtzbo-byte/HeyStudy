import "server-only";
import { prisma } from "@/lib/prisma/client";
import type { SubjectInput } from "@/lib/validation/subjectSchemas";

export async function listSubjects(studentProfileId: string) {
  return prisma.subject.findMany({
    where: { studentProfileId },
    orderBy: { createdAt: "asc" },
    include: {
      _count: { select: { assignments: true, exams: true, materials: true } },
    },
  });
}

export async function getSubject(studentProfileId: string, subjectId: string) {
  return prisma.subject.findFirst({
    where: { id: subjectId, studentProfileId },
    include: {
      assignments: { orderBy: { dueDate: "asc" } },
      exams: { orderBy: { examDate: "asc" } },
      materials: { orderBy: { uploadedAt: "desc" } },
    },
  });
}

export async function createSubject(studentProfileId: string, input: SubjectInput) {
  return prisma.subject.create({
    data: { studentProfileId, name: input.name, color: input.color },
  });
}

export async function updateSubject(studentProfileId: string, subjectId: string, input: SubjectInput) {
  return prisma.subject.updateMany({
    where: { id: subjectId, studentProfileId },
    data: { name: input.name, color: input.color },
  });
}

export async function deleteSubject(studentProfileId: string, subjectId: string) {
  return prisma.subject.deleteMany({ where: { id: subjectId, studentProfileId } });
}
