import "server-only";
import { prisma } from "@/lib/prisma/client";
import { generateQuestions, diagnoseKnowledge } from "@/services/ai/AIProvider";
import { applyDiagnosisToMastery } from "@/services/knowledge/masteryService";
import { assertDiagnosticAvailable } from "@/services/usage/planLimits";
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

  await assertDiagnosticAvailable(userId);

  const topic = await prisma.knowledgeTopic.findFirst({
    where: { id: topicId, subjectId, subject: { studentProfileId } },
    include: { subject: true },
  });
  if (!topic) throw new Error("Tema no encontrado");

  const session = await prisma.studySession.create({
    data: { studentProfileId, mode: "DIAGNOSTICO" },
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

  await prisma.subscription.updateMany({
    where: { userId },
    data: { diagnosticsUsed: { increment: 1 } },
  });

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
  if (!question) throw new Error("Pregunta no encontrada");
  if (question.answer) throw new Error("Esta pregunta ya fue respondida");

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
  return prisma.studySession.updateMany({
    where: { id: sessionId, studentProfileId },
    data: { completedAt: new Date() },
  });
}
