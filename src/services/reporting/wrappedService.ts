import "server-only";
import { prisma } from "@/lib/prisma/client";
import { longestConsecutiveDayStreak } from "@/services/reporting/streakService";

// Resumen "Wrapped" (sección 4.5): pieza celebratoria, no un reporte
// académico. Cada métrica de aquí sale de datos que sí existen — no hay
// snapshots históricos de mastery, así que "materia en la que más mejoró
// (inicial vs. final)" tal como lo pide el spec no es honesto de calcular
// todavía. En su lugar, "materia con más temas superados" usa la misma
// señal (errorCount alto + score alto ahora = tema que costó y se dominó)
// agregada por materia, que sí es un dato real.
//
// El periodo es "desde que usas HeyStudy", no un ciclo escolar: no existe
// ningún modelo de semestre/ciclo en el schema (el spec lo deja fuera de
// esta fase también — "avancé de grado" es sólo un marcado manual). Filtrar
// por ciclo habría requerido inventar esa estructura.

export interface WrappedSummary {
  longestStreakDays: number;
  totalStudySessions: number;
  totalMinutesStudied: number;
  hardestTopicMastered: { topicName: string; subjectName: string; errorCount: number } | null;
  mostImprovedSubject: { subjectName: string; topicsOvercome: number } | null;
  readinessAccuracy: { avgPredicted: number; avgActual: number; sampleSize: number } | null;
}

export async function getWrappedSummary(studentProfileId: string): Promise<WrappedSummary> {
  const [plansWithProgress, sessionCount, masteryWithErrors, readinessPairs] = await Promise.all([
    prisma.studyPlan.findMany({
      where: { studentProfileId, items: { some: { completed: true } } },
      select: { forDate: true, items: { where: { completed: true }, select: { minutes: true } } },
    }),
    prisma.studySession.count({ where: { studentProfileId } }),
    prisma.knowledgeMastery.findMany({
      where: { studentProfileId, errorCount: { gt: 0 }, score: { gte: 0.7 } },
      include: { knowledgeTopic: { include: { subject: true } } },
      orderBy: { errorCount: "desc" },
    }),
    prisma.grade.findMany({
      where: { studentProfileId, examId: { not: null } },
      include: { exam: { include: { readinessSnapshot: { select: { score: true } } } } },
    }),
  ]);

  const longestStreakDays = longestConsecutiveDayStreak(plansWithProgress.map((p) => p.forDate));
  const totalMinutesStudied = plansWithProgress.reduce(
    (sum, p) => sum + p.items.reduce((s, i) => s + i.minutes, 0),
    0,
  );

  const hardestTopicMastered = masteryWithErrors[0]
    ? {
        topicName: masteryWithErrors[0].knowledgeTopic.name,
        subjectName: masteryWithErrors[0].knowledgeTopic.subject.name,
        errorCount: masteryWithErrors[0].errorCount,
      }
    : null;

  const overcomeBySubject = new Map<string, number>();
  for (const m of masteryWithErrors) {
    const name = m.knowledgeTopic.subject.name;
    overcomeBySubject.set(name, (overcomeBySubject.get(name) ?? 0) + 1);
  }
  const mostImprovedEntry = [...overcomeBySubject.entries()].sort((a, b) => b[1] - a[1])[0];
  const mostImprovedSubject = mostImprovedEntry
    ? { subjectName: mostImprovedEntry[0], topicsOvercome: mostImprovedEntry[1] }
    : null;

  const withPrediction = readinessPairs.filter((g) => g.exam?.readinessSnapshot);
  const readinessAccuracy =
    withPrediction.length > 0
      ? {
          avgPredicted: Math.round(
            withPrediction.reduce((s, g) => s + (g.exam!.readinessSnapshot!.score ?? 0), 0) / withPrediction.length,
          ),
          avgActual: Math.round(
            withPrediction.reduce((s, g) => s + (g.score / g.maxScore) * 100, 0) / withPrediction.length,
          ),
          sampleSize: withPrediction.length,
        }
      : null;

  return {
    longestStreakDays,
    totalStudySessions: sessionCount,
    totalMinutesStudied,
    hardestTopicMastered,
    mostImprovedSubject,
    readinessAccuracy,
  };
}
