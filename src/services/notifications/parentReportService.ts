import "server-only";
import { prisma } from "@/lib/prisma/client";
import { resend, REPORT_FROM } from "@/lib/email/resend";
import { buildWeeklyStats, type WeeklyStats } from "@/services/notifications/weeklyStats";

const MIN_DAYS_BETWEEN_REPORTS = 6;
const WINDOW_DAYS = 7;

interface ParentReportCandidate {
  studentProfileId: string;
  studentDisplayName: string;
  parentEmail: string;
  stats: WeeklyStats;
}

async function getParentReportCandidates(): Promise<ParentReportCandidate[]> {
  const cutoff = new Date(Date.now() - MIN_DAYS_BETWEEN_REPORTS * 24 * 60 * 60 * 1000);
  const windowStart = new Date(Date.now() - WINDOW_DAYS * 24 * 60 * 60 * 1000);

  const students = await prisma.studentProfile.findMany({
    where: {
      parentReportEnabled: true,
      parentEmail: { not: null },
      OR: [{ lastParentReportSentAt: null }, { lastParentReportSentAt: { lt: cutoff } }],
    },
    select: { id: true, displayName: true, parentEmail: true },
  });

  return Promise.all(
    students.map(async (s) => ({
      studentProfileId: s.id,
      studentDisplayName: s.displayName,
      parentEmail: s.parentEmail as string,
      stats: await buildWeeklyStats(s.id, windowStart),
    })),
  );
}

function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest === 0 ? `${hours} h` : `${hours} h ${rest} min`;
}

// Deliberadamente NO incluye calificaciones, mastery por tema ni nada del
// tutor — mismo límite que el resto de la app: esos datos no salen del
// dueño. El padre/tutor sólo ve que hubo actividad, cuánta, y qué se
// acerca, igual que vería en la libreta de tareas.
function buildEmailHtml(studentName: string, stats: WeeklyStats): string {
  const firstName = escapeHtml(studentName.split(" ")[0] ?? studentName);
  const examsHtml = stats.upcomingExams.length
    ? `<ul>${stats.upcomingExams
        .map((e) => `<li>${escapeHtml(e.title)} (${escapeHtml(e.subjectName)}) — en ${e.daysUntil} día${e.daysUntil === 1 ? "" : "s"}</li>`)
        .join("")}</ul>`
    : "";

  return `
    <div style="font-family: -apple-system, sans-serif; max-width: 480px; margin: 0 auto; color: #222;">
      <p>Hola,</p>
      <p>Este es el resumen semanal de ${escapeHtml(studentName)} en HeyStudy:</p>
      <ul>
        <li>${formatMinutes(stats.minutesStudied)} estudiados</li>
        <li>${stats.sessionsCompleted} sesión${stats.sessionsCompleted === 1 ? "" : "es"} de diagnóstico/práctica</li>
        <li>${stats.topicsReviewed} tema${stats.topicsReviewed === 1 ? "" : "s"} repasado${stats.topicsReviewed === 1 ? "" : "s"}</li>
      </ul>
      ${stats.upcomingExams.length ? `<p>Próximos exámenes:</p>${examsHtml}` : ""}
      <p style="font-size:12px;color:#888;margin-top:24px;">
        ${firstName} activó este resumen desde su cuenta de HeyStudy y puede desactivarlo cuando quiera.
        No incluye calificaciones ni el detalle de lo que estudia.
      </p>
    </div>
  `;
}

export interface ParentReportRunSummary {
  candidateCount: number;
  sentCount: number;
  failedCount: number;
}

// Entry point del cron semanal (ver src/app/api/cron/parent-report).
export async function sendParentReports(): Promise<ParentReportRunSummary> {
  const candidates = await getParentReportCandidates();
  let sentCount = 0;
  let failedCount = 0;

  for (const candidate of candidates) {
    if (candidate.stats.minutesStudied === 0 && candidate.stats.sessionsCompleted === 0 && candidate.stats.upcomingExams.length === 0) {
      continue;
    }

    const { error } = await resend.emails.send({
      from: REPORT_FROM,
      to: candidate.parentEmail,
      subject: `Resumen semanal de ${candidate.studentDisplayName} en HeyStudy`,
      html: buildEmailHtml(candidate.studentDisplayName, candidate.stats),
    });

    if (error) {
      console.error("[parent-report] fallo al mandar a", candidate.studentProfileId, error);
      failedCount++;
      continue;
    }

    await prisma.studentProfile.update({
      where: { id: candidate.studentProfileId },
      data: { lastParentReportSentAt: new Date() },
    });
    sentCount++;
  }

  return { candidateCount: candidates.length, sentCount, failedCount };
}
