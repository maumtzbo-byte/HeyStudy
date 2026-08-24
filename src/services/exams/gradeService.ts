import "server-only";
import { prisma } from "@/lib/prisma/client";
import { generateText } from "@/services/ai/AIProvider";
import { UserFacingError } from "@/lib/actions/result";

// Sección 4.5: comparar la calificación real contra el Exam Readiness Score
// que la app había calculado antes del examen (congelado en
// ReadinessSnapshot), y generar un mensaje de refuerzo. El caso (superó /
// quedó por debajo / coincidió) se decide aquí con matemática simple, no se
// le pide a la IA que lo determine — sólo que lo redacte con calidez. Así
// el tono nunca puede contradecir los números.
const MATCH_TOLERANCE_POINTS = 5;

export interface GradeComparison {
  predictedScore: number;
  actualPercent: number;
  message: string;
}

async function assertSubjectOwnership(studentProfileId: string, subjectId: string) {
  const subject = await prisma.subject.findFirst({ where: { id: subjectId, studentProfileId } });
  if (!subject) throw new UserFacingError("Materia no encontrada");
}

async function buildReinforcementMessage(params: {
  userId: string;
  examTitle: string;
  predictedScore: number;
  actualPercent: number;
}): Promise<string> {
  const { userId, examTitle, predictedScore, actualPercent } = params;
  const diff = actualPercent - predictedScore;

  const situation =
    Math.abs(diff) <= MATCH_TOLERANCE_POINTS
      ? "El resultado coincidió con la predicción. Refuerza que el diagnóstico de HeyStudy está siendo preciso, para generar confianza en la herramienta."
      : diff > 0
        ? "El estudiante superó su propia expectativa. Felicítalo de forma específica, mencionando los dos números."
        : "El estudiante quedó por debajo de lo esperado. Anímalo sin regañar, y no le des vueltas al numero bajo — enfócate en que esto sirve para calibrar mejor la próxima vez.";

  // Haiku (tier "free" fijo, sin importar el plan del estudiante): esto no
  // requiere razonamiento complejo, tal como pide la sección 4.5.
  return generateText(
    { userId, tier: "free", feature: "grade_reinforcement" },
    {
      system:
        "Escribes mensajes cortos de refuerzo para un estudiante en HeyStudy, en español, cercanos " +
        "pero sin exagerar. Un mensaje de 1-2 oraciones. Nunca inventes datos que no te den.",
      prompt:
        `Examen: ${examTitle}\n` +
        `Preparación que predijo la app antes del examen: ${predictedScore}%\n` +
        `Calificación real: ${actualPercent}%\n` +
        `Situación: ${situation}\n\n` +
        "Escribe el mensaje para el estudiante.",
      maxTokens: 200,
    },
  );
}

export async function recordGrade(params: {
  studentProfileId: string;
  userId: string;
  subjectId: string;
  examId?: string | null;
  label: string;
  score: number;
  maxScore: number;
}): Promise<{ gradeId: string; comparison: GradeComparison | null }> {
  const { studentProfileId, userId, subjectId, examId, label, score, maxScore } = params;

  await assertSubjectOwnership(studentProfileId, subjectId);
  // gradeSchema (capa de acción) ya valida formato y rangos individuales;
  // lo que falta aquí es lo que un schema de un solo campo no puede ver:
  // espacios en blanco disfrazando un label vacío, y que score no rebase
  // maxScore (son dos campos independientes para zod).
  if (!label.trim()) throw new UserFacingError("Ponle un nombre a la calificación.");
  if (score > maxScore) throw new UserFacingError("La calificación no puede ser mayor que el máximo.");

  let exam: { id: string; title: string; readinessSnapshot: { score: number } | null } | null = null;
  if (examId) {
    exam = await prisma.exam.findFirst({
      where: { id: examId, subjectId },
      include: { readinessSnapshot: { select: { score: true } } },
    });
    if (!exam) throw new UserFacingError("Examen no encontrado");
  }

  const grade = await prisma.grade.create({
    data: { studentProfileId, subjectId, examId: examId ?? null, label: label.trim(), score, maxScore },
  });

  let comparison: GradeComparison | null = null;
  if (exam?.readinessSnapshot) {
    const predictedScore = exam.readinessSnapshot.score;
    const actualPercent = Math.round((score / maxScore) * 100);
    const message = await buildReinforcementMessage({ userId, examTitle: exam.title, predictedScore, actualPercent });
    comparison = { predictedScore, actualPercent, message };
  }

  return { gradeId: grade.id, comparison };
}

export async function listGradesForExam(studentProfileId: string, examId: string) {
  return prisma.grade.findMany({
    where: { studentProfileId, examId },
    orderBy: { recordedAt: "desc" },
  });
}
