import "server-only";
import { UserFacingError } from "@/lib/actions/result";
import { prisma } from "@/lib/prisma/client";
import { assertSubjectOwnership } from "@/lib/auth/ownership";
import type { AssignmentInput } from "@/lib/validation/subjectSchemas";

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

export async function toggleAssignmentStatus(studentProfileId: string, assignmentId: string) {
  const assignment = await prisma.assignment.findFirst({
    where: { id: assignmentId, subject: { studentProfileId } },
  });
  if (!assignment) throw new UserFacingError("Tarea no encontrada");
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
