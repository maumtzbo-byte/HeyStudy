import "server-only";
import { prisma } from "@/lib/prisma/client";
import type { AnswerDiagnosis } from "@/services/ai/types";

// Evidencia acumulativa: la primera respuesta fija el score; las siguientes
// lo mueven con una media móvil (más peso a lo reciente, sin borrar el
// historial). La confianza crece con cada respuesta hasta un tope de 1.
export async function applyDiagnosisToMastery(params: {
  studentProfileId: string;
  knowledgeTopicId: string;
  diagnosis: AnswerDiagnosis;
}) {
  const { studentProfileId, knowledgeTopicId, diagnosis } = params;

  const existing = await prisma.knowledgeMastery.findUnique({
    where: { studentProfileId_knowledgeTopicId: { studentProfileId, knowledgeTopicId } },
  });

  const alpha = !existing || existing.confidence === 0 ? 1 : 0.4;
  const previousScore = existing?.score ?? 0;
  const newScore = previousScore * (1 - alpha) + diagnosis.masteryEstimate * alpha;
  const newConfidence = Math.min(1, (existing?.confidence ?? 0) + 0.15);
  const newErrorCount = (existing?.errorCount ?? 0) + (diagnosis.isCorrect ? 0 : 1);

  const reviewIntervalDays = newScore >= 0.7 ? 7 : newScore >= 0.4 ? 3 : 1;
  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + reviewIntervalDays);

  const mastery = await prisma.knowledgeMastery.upsert({
    where: { studentProfileId_knowledgeTopicId: { studentProfileId, knowledgeTopicId } },
    create: {
      studentProfileId,
      knowledgeTopicId,
      score: newScore,
      confidence: newConfidence,
      errorCount: newErrorCount,
      lastReviewed: new Date(),
      nextReview,
    },
    update: {
      score: newScore,
      confidence: newConfidence,
      errorCount: newErrorCount,
      lastReviewed: new Date(),
      nextReview,
    },
  });

  let errorPatternId: string | null = null;
  if (!diagnosis.isCorrect && diagnosis.errorPattern) {
    const existingPattern = await prisma.errorPattern.findFirst({
      where: { studentProfileId, knowledgeTopicId, description: diagnosis.errorPattern },
    });

    const pattern = existingPattern
      ? await prisma.errorPattern.update({
          where: { id: existingPattern.id },
          data: { occurrences: { increment: 1 }, lastDetectedAt: new Date() },
        })
      : await prisma.errorPattern.create({
          data: { studentProfileId, knowledgeTopicId, description: diagnosis.errorPattern },
        });

    errorPatternId = pattern.id;
  }

  return { mastery, errorPatternId };
}
