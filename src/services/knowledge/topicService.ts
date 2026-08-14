import "server-only";
import { prisma } from "@/lib/prisma/client";
import { generateText } from "@/services/ai/AIProvider";
import type { AITier } from "@/services/ai/models";

async function assertSubjectOwnership(studentProfileId: string, subjectId: string) {
  const subject = await prisma.subject.findFirst({ where: { id: subjectId, studentProfileId } });
  if (!subject) throw new Error("Materia no encontrada");
  return subject;
}

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

export async function listTopicsWithMastery(studentProfileId: string, subjectId: string) {
  const topics = await prisma.knowledgeTopic.findMany({
    where: { subjectId },
    orderBy: { createdAt: "asc" },
    include: {
      mastery: { where: { studentProfileId } },
    },
  });

  return topics.map((topic) => ({
    id: topic.id,
    name: topic.name,
    score: topic.mastery[0]?.score ?? 0,
    confidence: topic.mastery[0]?.confidence ?? 0,
    errorCount: topic.mastery[0]?.errorCount ?? 0,
    lastReviewed: topic.mastery[0]?.lastReviewed ?? null,
  }));
}
