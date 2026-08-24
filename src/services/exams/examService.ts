import "server-only";
import { UserFacingError } from "@/lib/actions/result";
import { prisma } from "@/lib/prisma/client";
import type { ExamInput } from "@/lib/validation/subjectSchemas";

async function assertSubjectOwnership(studentProfileId: string, subjectId: string) {
  const subject = await prisma.subject.findFirst({ where: { id: subjectId, studentProfileId } });
  if (!subject) throw new UserFacingError("Materia no encontrada");
}

export async function createExam(studentProfileId: string, input: ExamInput) {
  await assertSubjectOwnership(studentProfileId, input.subjectId);
  return prisma.exam.create({
    data: { subjectId: input.subjectId, title: input.title, examDate: new Date(input.examDate) },
  });
}

export async function updateExam(studentProfileId: string, examId: string, input: ExamInput) {
  await assertSubjectOwnership(studentProfileId, input.subjectId);
  return prisma.exam.updateMany({
    where: { id: examId, subjectId: input.subjectId },
    data: { title: input.title, examDate: new Date(input.examDate) },
  });
}

export async function deleteExam(studentProfileId: string, examId: string) {
  return prisma.exam.deleteMany({ where: { id: examId, subject: { studentProfileId } } });
}

export async function listUpcomingExams(studentProfileId: string, limit = 5) {
  return prisma.exam.findMany({
    where: { subject: { studentProfileId }, examDate: { gte: new Date() } },
    orderBy: { examDate: "asc" },
    take: limit,
    include: { subject: { select: { name: true, color: true } } },
  });
}
