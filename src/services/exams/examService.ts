import "server-only";
import { prisma } from "@/lib/prisma/client";
import { todayInTimezone } from "@/lib/utils/dates";
import { assertSubjectOwnership } from "@/lib/auth/ownership";
import type { ExamInput } from "@/lib/validation/subjectSchemas";

export async function createExam(studentProfileId: string, input: ExamInput) {
  await assertSubjectOwnership(studentProfileId, input.subjectId);
  return prisma.exam.create({
    data: { subjectId: input.subjectId, title: input.title, examDate: new Date(input.examDate) },
  });
}

export async function deleteExam(studentProfileId: string, examId: string) {
  return prisma.exam.deleteMany({ where: { id: examId, subject: { studentProfileId } } });
}

export async function listUpcomingExams(studentProfileId: string, limit = 5) {
  const profile = await prisma.studentProfile.findUnique({
    where: { id: studentProfileId },
    select: { timezone: true },
  });
  // examDate se guarda como medianoche UTC del día calendario elegido (igual
  // que todayInTimezone) — comparar contra new Date() (instante absoluto) en
  // vez de contra "hoy" en la zona del estudiante hacía que un examen de
  // "mañana" pareciera ya pasado desde media tarde en México (UTC-6).
  const today = todayInTimezone(profile?.timezone);

  return prisma.exam.findMany({
    where: { subject: { studentProfileId }, examDate: { gte: today } },
    orderBy: { examDate: "asc" },
    take: limit,
    include: { subject: { select: { name: true, color: true } } },
  });
}
