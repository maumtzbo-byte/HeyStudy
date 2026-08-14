import "server-only";
import { prisma } from "@/lib/prisma/client";
import type { AssignmentInput } from "@/lib/validation/subjectSchemas";

async function assertSubjectOwnership(studentProfileId: string, subjectId: string) {
  const subject = await prisma.subject.findFirst({ where: { id: subjectId, studentProfileId } });
  if (!subject) throw new Error("Materia no encontrada");
}

export async function createAssignment(studentProfileId: string, input: AssignmentInput) {
  await assertSubjectOwnership(studentProfileId, input.subjectId);
  return prisma.assignment.create({
    data: {
      subjectId: input.subjectId,
      title: input.title,
      description: input.description || null,
      dueDate: new Date(input.dueDate),
      status: input.status,
    },
  });
}

export async function updateAssignment(studentProfileId: string, assignmentId: string, input: AssignmentInput) {
  await assertSubjectOwnership(studentProfileId, input.subjectId);
  return prisma.assignment.updateMany({
    where: { id: assignmentId, subjectId: input.subjectId },
    data: {
      title: input.title,
      description: input.description || null,
      dueDate: new Date(input.dueDate),
      status: input.status,
    },
  });
}

export async function toggleAssignmentStatus(studentProfileId: string, assignmentId: string) {
  const assignment = await prisma.assignment.findFirst({
    where: { id: assignmentId, subject: { studentProfileId } },
  });
  if (!assignment) throw new Error("Tarea no encontrada");
  return prisma.assignment.update({
    where: { id: assignmentId },
    data: { status: assignment.status === "PENDIENTE" ? "COMPLETADA" : "PENDIENTE" },
  });
}

export async function deleteAssignment(studentProfileId: string, assignmentId: string) {
  return prisma.assignment.deleteMany({
    where: { id: assignmentId, subject: { studentProfileId } },
  });
}

export async function listUpcomingAssignments(studentProfileId: string, limit = 5) {
  return prisma.assignment.findMany({
    where: { subject: { studentProfileId }, status: "PENDIENTE" },
    orderBy: { dueDate: "asc" },
    take: limit,
    include: { subject: { select: { name: true, color: true } } },
  });
}
