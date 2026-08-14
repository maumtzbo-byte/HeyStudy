import "server-only";
import { prisma } from "@/lib/prisma/client";
import { createStudyPlan } from "@/services/ai/AIProvider";
import type { AITier } from "@/services/ai/models";

function todayDateOnly() {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

// Junta las debilidades más urgentes del estudiante: mastery bajo, ponderado
// más si el tema está cubierto por un examen próximo (spec: "vinculado a la
// debilidad detectada más urgente").
async function buildWeakTopicsSummary(studentProfileId: string): Promise<string | null> {
  const upcomingExams = await prisma.exam.findMany({
    where: { subject: { studentProfileId }, examDate: { gte: new Date() } },
    include: { topics: true },
    orderBy: { examDate: "asc" },
    take: 10,
  });

  const daysUntilByTopic = new Map<string, number>();
  for (const exam of upcomingExams) {
    const days = Math.ceil((exam.examDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    for (const examTopic of exam.topics) {
      const prev = daysUntilByTopic.get(examTopic.knowledgeTopicId);
      if (prev === undefined || days < prev) daysUntilByTopic.set(examTopic.knowledgeTopicId, days);
    }
  }

  const masteryRows = await prisma.knowledgeMastery.findMany({
    where: { studentProfileId },
    include: { knowledgeTopic: { include: { subject: true } } },
  });
  if (masteryRows.length === 0) return null;

  const scored = masteryRows
    .map((m) => {
      const daysUntilExam = daysUntilByTopic.get(m.knowledgeTopicId);
      const examUrgency = daysUntilExam !== undefined ? Math.max(0, (21 - daysUntilExam) / 21) : 0;
      const weaknessScore = (1 - m.score) * 0.6 + examUrgency * 0.4;
      return { topic: m.knowledgeTopic, score: m.score, daysUntilExam, weaknessScore };
    })
    .sort((a, b) => b.weaknessScore - a.weaknessScore)
    .slice(0, 6);

  return scored
    .map((s) => {
      const examNote = s.daysUntilExam !== undefined ? `, examen en ${s.daysUntilExam} días` : "";
      return `- ${s.topic.name} (materia: ${s.topic.subject.name}): dominio actual ${Math.round(s.score * 100)}%${examNote}`;
    })
    .join("\n");
}

export async function getTodayPlan(studentProfileId: string) {
  return prisma.studyPlan.findUnique({
    where: { studentProfileId_forDate: { studentProfileId, forDate: todayDateOnly() } },
    include: {
      items: { orderBy: { orderIndex: "asc" }, include: { knowledgeTopic: { select: { name: true, subjectId: true } } } },
    },
  });
}

export async function generateTodayPlan(params: {
  studentProfileId: string;
  userId: string;
  tier: AITier;
  minutesAvailable: number;
}) {
  const { studentProfileId, userId, tier, minutesAvailable } = params;

  const summary = await buildWeakTopicsSummary(studentProfileId);
  if (!summary) return null;

  const items = await createStudyPlan(
    { userId, tier, feature: "study_plan" },
    { weakTopicsSummary: summary, minutesAvailable },
  );
  if (items.length === 0) return null;

  const topics = await prisma.knowledgeTopic.findMany({ where: { subject: { studentProfileId } } });
  const topicIdByName = new Map(topics.map((t) => [t.name.trim().toLowerCase(), t.id]));

  const forDate = todayDateOnly();
  const plan = await prisma.studyPlan.upsert({
    where: { studentProfileId_forDate: { studentProfileId, forDate } },
    create: { studentProfileId, forDate },
    update: { generatedAt: new Date() },
  });

  await prisma.studyPlanItem.deleteMany({ where: { studyPlanId: plan.id } });
  await prisma.studyPlanItem.createMany({
    data: items.map((item, index) => ({
      studyPlanId: plan.id,
      knowledgeTopicId: topicIdByName.get(item.topicName.trim().toLowerCase()) ?? null,
      title: item.title,
      reason: item.reason,
      minutes: item.minutes,
      orderIndex: index,
    })),
  });

  return getTodayPlan(studentProfileId);
}

export async function toggleStudyPlanItem(studentProfileId: string, itemId: string) {
  const item = await prisma.studyPlanItem.findFirst({
    where: { id: itemId, studyPlan: { studentProfileId } },
  });
  if (!item) throw new Error("Item no encontrado");
  return prisma.studyPlanItem.update({ where: { id: itemId }, data: { completed: !item.completed } });
}
