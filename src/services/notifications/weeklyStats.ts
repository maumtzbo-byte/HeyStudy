import "server-only";
import { prisma } from "@/lib/prisma/client";

// Compartido entre weeklyReportService (al propio estudiante) y
// parentReportService (a un padre/tutor opcional) — mismos números, dos
// destinatarios y dos plantillas de correo distintas.
export interface WeeklyStats {
  minutesStudied: number;
  sessionsCompleted: number;
  topicsReviewed: number;
  upcomingExams: { title: string; subjectName: string; daysUntil: number }[];
}

export async function buildWeeklyStats(studentProfileId: string, windowStart: Date): Promise<WeeklyStats> {
  const [plans, sessionCount, upcomingExams] = await Promise.all([
    prisma.studyPlan.findMany({
      where: { studentProfileId, forDate: { gte: windowStart } },
      select: { items: { where: { completed: true }, select: { minutes: true, knowledgeTopicId: true } } },
    }),
    prisma.studySession.count({ where: { studentProfileId, completedAt: { gte: windowStart } } }),
    prisma.exam.findMany({
      where: { subject: { studentProfileId }, examDate: { gte: new Date() } },
      orderBy: { examDate: "asc" },
      take: 3,
      select: { title: true, examDate: true, subject: { select: { name: true } } },
    }),
  ]);

  const completedItems = plans.flatMap((p) => p.items);
  const minutesStudied = completedItems.reduce((sum, i) => sum + i.minutes, 0);
  const topicsReviewed = new Set(completedItems.map((i) => i.knowledgeTopicId).filter(Boolean)).size;

  const now = Date.now();
  return {
    minutesStudied,
    sessionsCompleted: sessionCount,
    topicsReviewed,
    upcomingExams: upcomingExams.map((e) => ({
      title: e.title,
      subjectName: e.subject.name,
      daysUntil: Math.ceil((e.examDate.getTime() - now) / (1000 * 60 * 60 * 24)),
    })),
  };
}
