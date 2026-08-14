import { z } from "zod";

export const subjectSchema = z.object({
  name: z.string().min(1, "Ponle un nombre a la materia").max(60),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Color inválido")
    .default("#4F46E5"),
});

export type SubjectInput = z.infer<typeof subjectSchema>;

export const assignmentStatuses = ["PENDIENTE", "COMPLETADA"] as const;

export const assignmentSchema = z.object({
  subjectId: z.string().uuid(),
  title: z.string().min(1, "Ponle un título a la tarea").max(120),
  description: z.string().max(2000).optional().or(z.literal("")),
  dueDate: z.string().min(1, "Elige una fecha de entrega"),
  status: z.enum(assignmentStatuses).default("PENDIENTE"),
});

export type AssignmentInput = z.infer<typeof assignmentSchema>;

export const examSchema = z.object({
  subjectId: z.string().uuid(),
  title: z.string().min(1, "Ponle un título al examen").max(120),
  examDate: z.string().min(1, "Elige una fecha de examen"),
});

export type ExamInput = z.infer<typeof examSchema>;

export const gradeSchema = z.object({
  subjectId: z.string().uuid(),
  examId: z.string().uuid().optional().or(z.literal("")),
  label: z.string().min(1, "Describe qué calificación es").max(120),
  score: z.coerce.number().min(0),
  maxScore: z.coerce.number().min(1).default(100),
});

export type GradeInput = z.infer<typeof gradeSchema>;
