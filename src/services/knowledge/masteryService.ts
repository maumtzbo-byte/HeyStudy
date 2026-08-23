import "server-only";
import { prisma } from "@/lib/prisma/client";
import type { AnswerDiagnosis } from "@/services/ai/types";
import type { KnowledgeMastery } from "@/generated/prisma/client";

// Repetición espaciada tipo SM-2 (sección 4.6): el intervalo crece con cada
// acierto y se resetea a corto plazo con cada falla — no es un tope fijo
// según el score absoluto, que es lo que había antes.
const SM2_INTERVALS_DAYS = [1, 3, 7, 14, 30] as const;
const SM2_RESET_INTERVAL_DAYS = 1;

// El intervalo anterior no se guarda como campo aparte: se deriva de
// lastReviewed/nextReview de la fila existente, que ya lo implican. Evita
// una migración sólo para esto.
function nextReviewIntervalDays(existing: KnowledgeMastery | null, isCorrect: boolean): number {
  if (!isCorrect) return SM2_RESET_INTERVAL_DAYS;
  if (!existing?.lastReviewed || !existing?.nextReview) return SM2_INTERVALS_DAYS[0];

  const previousIntervalDays = Math.round(
    (existing.nextReview.getTime() - existing.lastReviewed.getTime()) / (1000 * 60 * 60 * 24),
  );
  const stepIndex = SM2_INTERVALS_DAYS.findIndex((days) => days > previousIntervalDays);
  return stepIndex === -1 ? SM2_INTERVALS_DAYS[SM2_INTERVALS_DAYS.length - 1] : SM2_INTERVALS_DAYS[stepIndex];
}

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

  const reviewIntervalDays = nextReviewIntervalDays(existing, diagnosis.isCorrect);
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
