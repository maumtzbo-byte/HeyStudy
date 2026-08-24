import "server-only";
import { UserFacingError } from "@/lib/actions/result";
import { prisma } from "@/lib/prisma/client";
import { todayInTimezone } from "@/lib/utils/dates";

async function getExamOrThrow(studentProfileId: string, examId: string) {
  const exam = await prisma.exam.findFirst({
    where: { id: examId, subject: { studentProfileId } },
    include: { subject: true, topics: { include: { knowledgeTopic: true } } },
  });
  if (!exam) throw new UserFacingError("Examen no encontrado");
  return exam;
}

export async function getExamTopicSetup(studentProfileId: string, examId: string) {
  const exam = await getExamOrThrow(studentProfileId, examId);
  const subjectTopics = await prisma.knowledgeTopic.findMany({
    where: { subjectId: exam.subjectId },
    orderBy: { createdAt: "asc" },
  });
  const linkedTopicIds = new Set(exam.topics.map((t) => t.knowledgeTopicId));
  return { exam, subjectTopics, linkedTopicIds };
}

export async function setExamTopics(studentProfileId: string, examId: string, topicIds: string[]) {
  const exam = await getExamOrThrow(studentProfileId, examId);
  const validTopics = await prisma.knowledgeTopic.findMany({
    where: { id: { in: topicIds }, subjectId: exam.subjectId },
  });

  await prisma.$transaction([
    prisma.examTopic.deleteMany({ where: { examId } }),
    prisma.examTopic.createMany({
      data: validTopics.map((topic) => ({ examId, knowledgeTopicId: topic.id, weight: 1 })),
    }),
  ]);
}

export type ReadinessStatus = "sin_temas" | "en_riesgo" | "en_progreso" | "listo";

export interface ExamReadiness {
  examId: string;
  examTitle: string;
  subjectName: string;
  daysUntilExam: number;
  score: number | null;
  status: ReadinessStatus;
  breakdown: Array<{
    topicId: string;
    topicName: string;
    masteryPercent: number;
    hasEvidence: boolean;
    contributionPercent: number;
  }>;
}

export async function calculateExamReadiness(studentProfileId: string, examId: string): Promise<ExamReadiness> {
  const exam = await getExamOrThrow(studentProfileId, examId);
  // examDate es medianoche UTC del día calendario elegido; comparar contra
  // Date.now() (instante absoluto) desincronizaba daysUntilExam desde media
  // tarde en México (UTC-6) — el mismo bug que listUpcomingExams.
  const profile = await prisma.studentProfile.findUnique({
    where: { id: studentProfileId },
    select: { timezone: true },
  });
  const today = todayInTimezone(profile?.timezone);
  const daysUntilExam = Math.ceil((exam.examDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (exam.topics.length === 0) {
    return {
      examId: exam.id,
      examTitle: exam.title,
      subjectName: exam.subject.name,
      daysUntilExam,
      score: null,
      status: "sin_temas",
      breakdown: [],
    };
  }

  const masteryRows = await prisma.knowledgeMastery.findMany({
    where: { studentProfileId, knowledgeTopicId: { in: exam.topics.map((t) => t.knowledgeTopicId) } },
  });
  const masteryByTopic = new Map(masteryRows.map((m) => [m.knowledgeTopicId, m]));

  const totalWeight = exam.topics.reduce((sum, t) => sum + t.weight, 0) || 1;

  const breakdown = exam.topics
    .map((t) => {
      const mastery = masteryByTopic.get(t.knowledgeTopicId);
      return {
        topicId: t.knowledgeTopicId,
        topicName: t.knowledgeTopic.name,
        masteryPercent: Math.round((mastery?.score ?? 0) * 100),
        hasEvidence: (mastery?.confidence ?? 0) > 0,
        contributionPercent: Math.round((t.weight / totalWeight) * 100),
        weight: t.weight,
      };
    })
    .sort((a, b) => a.masteryPercent - b.masteryPercent);

  const weightedScore = exam.topics.reduce((sum, t) => {
    const mastery = masteryByTopic.get(t.knowledgeTopicId);
    return sum + (mastery?.score ?? 0) * t.weight;
  }, 0);
  const score = Math.round((weightedScore / totalWeight) * 100);

  let status: ReadinessStatus;
  if (score >= 75) status = "listo";
  else if (score >= 45 || daysUntilExam > 7) status = "en_progreso";
  else status = "en_riesgo";

  // "La predicción" para la sección 4.5: se congela en cuanto pasa la fecha
  // del examen, para no comparar la calificación real contra un mastery que
  // ya se movió por estudio posterior. Antes de esa fecha se refresca en
  // cada lectura — no cuesta una llamada a IA, es sólo un upsert.
  if (daysUntilExam >= 0) {
    await prisma.readinessSnapshot.upsert({
      where: { examId: exam.id },
      create: { examId: exam.id, score },
      update: { score, capturedAt: new Date() },
    });
  }

  return {
    examId: exam.id,
    examTitle: exam.title,
    subjectName: exam.subject.name,
    daysUntilExam,
    score,
    status,
    breakdown,
  };
}
