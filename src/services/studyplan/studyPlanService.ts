import "server-only";
import { prisma } from "@/lib/prisma/client";
import { createStudyPlan } from "@/services/ai/AIProvider";
import { todayInTimezone } from "@/lib/utils/dates";
import type { AITier } from "@/services/ai/models";

// El día del plan se resuelve en la zona horaria del estudiante, no en la del
// servidor (ver todayInTimezone).
async function planDateFor(studentProfileId: string): Promise<Date> {
  const profile = await prisma.studentProfile.findUnique({
    where: { id: studentProfileId },
    select: { timezone: true },
  });
  return todayInTimezone(profile?.timezone);
}

// Temas cuyo nextReview ya venció — lo que el estudiante está a punto de
// olvidar (sección 4.6). Es una query, no una llamada a IA: barata de
// correr en cada generación de plan.
async function getOverdueReviewTopics(studentProfileId: string) {
  return prisma.knowledgeMastery.findMany({
    where: { studentProfileId, nextReview: { lte: new Date() } },
    include: { knowledgeTopic: { include: { subject: true } } },
    orderBy: { nextReview: "asc" },
  });
}

// Junta las debilidades más urgentes del estudiante: mastery bajo, ponderado
// más si el tema está cubierto por un examen próximo (spec: "vinculado a la
// debilidad detectada más urgente").
async function buildWeakTopicsSummary(
  studentProfileId: string,
  overdueTopicIds: Set<string>,
): Promise<string | null> {
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
      // Marcado para que la IA lo priorice, pero no es lo que garantiza que
      // aparezca — eso lo hace ensureOverdueReviewsInPlan más abajo.
      const reviewNote = overdueTopicIds.has(s.topic.id) ? " — repaso vencido, a punto de olvidarse" : "";
      return `- ${s.topic.name} (materia: ${s.topic.subject.name}): dominio actual ${Math.round(s.score * 100)}%${examNote}${reviewNote}`;
    })
    .join("\n");
}

// El resumen de arriba sólo sugiere a la IA que priorice los repasos
// vencidos — nada garantiza que los incluya. Esto sí lo garantiza: cualquier
// tema vencido que la IA no haya cubierto se agrega como item aparte. Tope
// de 3 para no inflar el plan cuando hay muchos repasos acumulados.
const MAX_INJECTED_REVIEWS = 3;
const REVIEW_ITEM_MINUTES = 10;

function ensureOverdueReviewsInPlan(
  items: { title: string; reason: string; minutes: number; topicName: string; knowledgeTopicId: string | null }[],
  overdueTopics: Awaited<ReturnType<typeof getOverdueReviewTopics>>,
) {
  const coveredTopicIds = new Set(items.map((i) => i.knowledgeTopicId).filter((id): id is string => id !== null));

  const missing = overdueTopics
    .filter((m) => !coveredTopicIds.has(m.knowledgeTopicId))
    .slice(0, MAX_INJECTED_REVIEWS);

  const injected = missing.map((m) => ({
    title: `Repaso: ${m.knowledgeTopic.name}`,
    reason: "Ya casi se te olvida — te toca repasarlo hoy para que no se pierda.",
    minutes: REVIEW_ITEM_MINUTES,
    topicName: m.knowledgeTopic.name,
    knowledgeTopicId: m.knowledgeTopicId,
  }));

  return [...items, ...injected];
}

export async function getTodayPlan(studentProfileId: string) {
  const forDate = await planDateFor(studentProfileId);
  return prisma.studyPlan.findUnique({
    where: { studentProfileId_forDate: { studentProfileId, forDate } },
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

  const overdueTopics = await getOverdueReviewTopics(studentProfileId);
  const overdueTopicIds = new Set(overdueTopics.map((m) => m.knowledgeTopicId));

  const summary = await buildWeakTopicsSummary(studentProfileId, overdueTopicIds);
  if (!summary) return null;

  const generated = await createStudyPlan(
    { userId, tier, feature: "study_plan" },
    { weakTopicsSummary: summary, minutesAvailable },
  );
  if (generated.length === 0) return null;

  const topics = await prisma.knowledgeTopic.findMany({ where: { subject: { studentProfileId } } });
  const topicIdByName = new Map(topics.map((t) => [t.name.trim().toLowerCase(), t.id]));

  const resolved = generated.map((item) => ({
    ...item,
    knowledgeTopicId: topicIdByName.get(item.topicName.trim().toLowerCase()) ?? null,
  }));
  const items = ensureOverdueReviewsInPlan(resolved, overdueTopics);

  const forDate = await planDateFor(studentProfileId);
  const plan = await prisma.studyPlan.upsert({
    where: { studentProfileId_forDate: { studentProfileId, forDate } },
    create: { studentProfileId, forDate },
    update: { generatedAt: new Date() },
  });

  await prisma.studyPlanItem.deleteMany({ where: { studyPlanId: plan.id } });
  await prisma.studyPlanItem.createMany({
    data: items.map((item, index) => ({
      studyPlanId: plan.id,
      knowledgeTopicId: item.knowledgeTopicId,
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
