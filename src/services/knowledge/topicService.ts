import "server-only";
import { prisma } from "@/lib/prisma/client";
import { generateText } from "@/services/ai/AIProvider";
import { assertSubjectOwnership } from "@/lib/auth/ownership";
import { UserFacingError } from "@/lib/actions/result";
import { STANDARDIZED_TOPIC_TEMPLATES } from "@/lib/data/standardizedExams";
import type { AITier } from "@/services/ai/models";

// Si la materia no tiene temas todavía, le pedimos a la IA una lista base.
// Se generan una sola vez; el estudiante no tiene que armarlos a mano.
export async function ensureTopicsForSubject(params: {
  studentProfileId: string;
  subjectId: string;
  userId: string;
  tier: AITier;
}) {
  const { studentProfileId, subjectId, userId, tier } = params;
  const subject = await assertSubjectOwnership(studentProfileId, subjectId);

  const existing = await prisma.knowledgeTopic.findMany({ where: { subjectId } });
  if (existing.length > 0) return existing;

  const raw = await generateText(
    { userId, tier, feature: "topic_generation" },
    {
      system:
        "Generas una lista de 6 a 10 temas centrales de una materia escolar, del nivel más " +
        "fundamental al más avanzado. Responde SOLO con un tema por línea, sin numeración, " +
        "sin viñetas, sin explicaciones adicionales.",
      prompt: `Materia: ${subject.name}`,
      maxTokens: 512,
    },
  );

  const topicNames = raw
    .split("\n")
    .map((line) => line.replace(/^[-*\d.)\s]+/, "").trim())
    .filter(Boolean)
    .slice(0, 10);

  if (topicNames.length === 0) return [];

  await prisma.knowledgeTopic.createMany({
    data: topicNames.map((name) => ({ subjectId, name })),
  });

  return prisma.knowledgeTopic.findMany({ where: { subjectId } });
}

// Carga determinista de un temario de referencia (sección 4.5): sin costo de
// IA y sin depender de que el modelo "adivine" temas de examen — se agregan
// sólo los que no existan ya, para poder aplicar más de una plantilla a la
// misma materia sin duplicar.
export async function loadStandardizedTopics(studentProfileId: string, subjectId: string, templateId: string) {
  await assertSubjectOwnership(studentProfileId, subjectId);

  const template = STANDARDIZED_TOPIC_TEMPLATES.find((t) => t.id === templateId);
  if (!template) throw new UserFacingError("Plantilla de temario no encontrada.");

  const existing = await prisma.knowledgeTopic.findMany({ where: { subjectId }, select: { name: true } });
  const existingNames = new Set(existing.map((t) => t.name));
  const newNames = template.topics.filter((name) => !existingNames.has(name));

  if (newNames.length > 0) {
    await prisma.knowledgeTopic.createMany({ data: newNames.map((name) => ({ subjectId, name })) });
  }
}

export async function listTopicsWithMastery(studentProfileId: string, subjectId: string) {
  await assertSubjectOwnership(studentProfileId, subjectId);

  const topics = await prisma.knowledgeTopic.findMany({
    where: { subjectId },
    orderBy: { createdAt: "asc" },
    include: {
      mastery: { where: { studentProfileId } },
      // Se muestra el patrón de error más frecuente por tema (si existe) para
      // que el estudiante vea EN QUÉ se equivoca, no sólo QUÉ tan mal le va —
      // antes esta señal se guardaba pero nunca llegaba a ninguna pantalla.
      errorPatterns: {
        where: { studentProfileId },
        orderBy: { occurrences: "desc" },
        take: 1,
      },
    },
  });

  const now = new Date();
  return topics.map((topic) => ({
    id: topic.id,
    name: topic.name,
    score: topic.mastery[0]?.score ?? 0,
    confidence: topic.mastery[0]?.confidence ?? 0,
    errorCount: topic.mastery[0]?.errorCount ?? 0,
    lastReviewed: topic.mastery[0]?.lastReviewed ?? null,
    reviewOverdue: !!topic.mastery[0]?.nextReview && topic.mastery[0].nextReview <= now,
    topErrorPattern: topic.errorPatterns[0]?.description ?? null,
  }));
}
