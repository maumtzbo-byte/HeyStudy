import "server-only";
import { UserFacingError } from "@/lib/actions/result";
import { prisma } from "@/lib/prisma/client";
import { generateQuestions, diagnoseKnowledge } from "@/services/ai/AIProvider";
import { applyDiagnosisToMastery } from "@/services/knowledge/masteryService";
import { claimDiagnostic } from "@/services/usage/planLimits";
import { track } from "@/lib/analytics/server";
import type { AITier } from "@/services/ai/models";

// Free (Haiku) hace un diagnóstico más corto y menos profundo que paid (Sonnet),
// tal como pide la sección 5 del spec.
const DIFFICULTY_PLAN: Record<AITier, Array<{ difficulty: "FACIL" | "MEDIO" | "DIFICIL"; count: number }>> = {
  free: [{ difficulty: "MEDIO", count: 3 }],
  paid: [
    { difficulty: "FACIL", count: 1 },
    { difficulty: "MEDIO", count: 2 },
    { difficulty: "DIFICIL", count: 2 },
  ],
};

export async function startDiagnosticSession(params: {
  studentProfileId: string;
  userId: string;
  subjectId: string;
  topicId: string;
  tier: AITier;
}) {
  const { studentProfileId, userId, subjectId, topicId, tier } = params;

  // Chequeo e incremento atómicos (ver claimDiagnostic) — pasa antes de
  // gastar la llamada a IA, no después.
  await claimDiagnostic(userId);

  const topic = await prisma.knowledgeTopic.findFirst({
    where: { id: topicId, subjectId, subject: { studentProfileId } },
    include: { subject: true },
  });
  if (!topic) throw new UserFacingError("Tema no encontrado");

  const session = await prisma.studySession.create({
    data: { studentProfileId, mode: "DIAGNOSTICO" },
  });

  // El prefijo lo pone selectAdmissionTarget al sembrar el temario (ver
  // admissionExamService): distingue a quien se prepara para un examen de
  // admisión de quien cargó sus propias materias, que son dos productos
  // distintos en la práctica. Se manda el tipo, nunca el nombre.
  await track(userId, "diagnostic_started", {
    subject_kind: topic.subject.name.startsWith("Admisión —") ? "admission" : "custom",
  });

  const plan = DIFFICULTY_PLAN[tier];
  for (const step of plan) {
    const generated = await generateQuestions(
      { userId, tier, feature: "diagnostic_questions" },
      {
        topicName: topic.name,
        subjectContext: topic.subject.name,
        difficulty: step.difficulty,
        count: step.count,
      },
    );

    if (generated.length > 0) {
      await prisma.question.createMany({
        data: generated.map((q) => ({
          studySessionId: session.id,
          knowledgeTopicId: topic.id,
          prompt: q.prompt,
          difficulty: q.difficulty,
          correctAnswer: q.correctAnswer,
          options: q.options ?? undefined,
        })),
      });
    }
  }

  return session.id;
}

export async function getSessionWithProgress(studentProfileId: string, sessionId: string) {
  const session = await prisma.studySession.findFirst({
    where: { id: sessionId, studentProfileId },
    include: {
      questions: {
        orderBy: { createdAt: "asc" },
        include: { answer: true, knowledgeTopic: { select: { name: true, subjectId: true } } },
      },
    },
  });
  return session;
}

export async function submitAnswer(params: {
  studentProfileId: string;
  userId: string;
  questionId: string;
  studentResponse: string;
  tier: AITier;
}) {
  const { studentProfileId, userId, questionId, studentResponse, tier } = params;

  const question = await prisma.question.findFirst({
    where: { id: questionId, studySession: { studentProfileId } },
    include: { answer: true },
  });
  if (!question) throw new UserFacingError("Pregunta no encontrada");
  if (question.answer) throw new UserFacingError("Esta pregunta ya fue respondida");

  const diagnosis = await diagnoseKnowledge(
    { userId, tier, feature: "diagnose_answer" },
    {
      question: question.prompt,
      correctAnswer: question.correctAnswer ?? "",
      studentResponse,
    },
  );

  const { errorPatternId } = await applyDiagnosisToMastery({
    studentProfileId,
    knowledgeTopicId: question.knowledgeTopicId,
    diagnosis,
  });

  const answer = await prisma.answer.create({
    data: {
      questionId: question.id,
      studentResponse,
      isCorrect: diagnosis.isCorrect,
      masteryEstimate: diagnosis.masteryEstimate,
      feedback: diagnosis.feedback,
      errorPatternId,
    },
  });

  return { answer, diagnosis };
}

export async function completeDiagnosticSession(studentProfileId: string, sessionId: string) {
  await prisma.studySession.updateMany({
    where: { id: sessionId, studentProfileId },
    data: { completedAt: new Date() },
  });

  // Se devuelven los números del cierre para que la acción pueda registrar
  // el evento sin volver a consultar. Es una sola agregación y sólo corre al
  // terminar un diagnóstico, no en cada respuesta.
  const stats = await prisma.answer.aggregate({
    where: { question: { studySessionId: sessionId } },
    _avg: { masteryEstimate: true },
    _count: { _all: true },
  });

  return {
    answeredCount: stats._count._all,
    averageMastery: stats._avg.masteryEstimate ?? 0,
  };
}
