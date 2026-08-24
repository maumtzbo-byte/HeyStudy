import "server-only";
import { prisma } from "@/lib/prisma/client";
import { resend, REPORT_FROM } from "@/lib/email/resend";
import { buildWeeklyStats, type WeeklyStats as WeeklyStatsBase } from "@/services/notifications/weeklyStats";

// El cron corre semanalmente; tolera unos días de jitter sin duplicar el
// envío (mismo criterio que reviewReminderService).
const MIN_DAYS_BETWEEN_REPORTS = 6;
const WINDOW_DAYS = 7;

export interface WeeklyStats extends WeeklyStatsBase {
  studentProfileId: string;
  email: string;
  displayName: string;
}

async function getStudentsForWeeklyReport(): Promise<WeeklyStats[]> {
  const cutoff = new Date(Date.now() - MIN_DAYS_BETWEEN_REPORTS * 24 * 60 * 60 * 1000);
  const windowStart = new Date(Date.now() - WINDOW_DAYS * 24 * 60 * 60 * 1000);

  const students = await prisma.studentProfile.findMany({
    where: {
      weeklyReportEnabled: true,
      OR: [{ lastWeeklyReportSentAt: null }, { lastWeeklyReportSentAt: { lt: cutoff } }],
    },
    select: { id: true, displayName: true, user: { select: { email: true } } },
  });

  return Promise.all(
    students.map(async (s) => ({
      studentProfileId: s.id,
      email: s.user.email,
      displayName: s.displayName,
      ...(await buildWeeklyStats(s.id, windowStart)),
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

function buildEmailHtml(stats: WeeklyStats): string {
  const firstName = escapeHtml(stats.displayName.split(" ")[0] ?? stats.displayName);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://heystudy.app";

  const examsHtml = stats.upcomingExams.length
    ? `<ul>${stats.upcomingExams
        .map((e) => `<li>${escapeHtml(e.title)} (${escapeHtml(e.subjectName)}) — en ${e.daysUntil} día${e.daysUntil === 1 ? "" : "s"}</li>`)
        .join("")}</ul>`
    : "";

  return `
    <div style="font-family: -apple-system, sans-serif; max-width: 480px; margin: 0 auto; color: #222;">
      <p>Hola ${firstName},</p>
      <p>Así te fue esta semana en HeyStudy:</p>
      <ul>
        <li>${formatMinutes(stats.minutesStudied)} estudiados</li>
        <li>${stats.sessionsCompleted} sesión${stats.sessionsCompleted === 1 ? "" : "es"} de diagnóstico/práctica</li>
        <li>${stats.topicsReviewed} tema${stats.topicsReviewed === 1 ? "" : "s"} repasado${stats.topicsReviewed === 1 ? "" : "s"}</li>
      </ul>
      ${stats.upcomingExams.length ? `<p>Próximos exámenes:</p>${examsHtml}` : ""}
      <p>
        <a href="${appUrl}/dashboard" style="display:inline-block;background:#7C6FE0;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:600;">
          Ver mi plan de hoy
        </a>
      </p>
      <p style="font-size:12px;color:#888;margin-top:24px;">
        ¿No quieres este resumen semanal? Apágalo desde tu perfil en HeyStudy.
      </p>
    </div>
  `;
}

export interface WeeklyReportRunSummary {
  candidateCount: number;
  sentCount: number;
  failedCount: number;
}

// Entry point del cron semanal (ver src/app/api/cron/weekly-report).
export async function sendWeeklyReports(): Promise<WeeklyReportRunSummary> {
  const students = await getStudentsForWeeklyReport();
  let sentCount = 0;
  let failedCount = 0;

  for (const stats of students) {
    // Nada que contar todavía (cuenta recién creada, o semana totalmente
    // inactiva): mandar un correo vacío no aporta y se siente a spam.
    if (stats.minutesStudied === 0 && stats.sessionsCompleted === 0 && stats.upcomingExams.length === 0) continue;

    const { error } = await resend.emails.send({
      from: REPORT_FROM,
      to: stats.email,
      subject: "Tu semana en HeyStudy",
      html: buildEmailHtml(stats),
    });

    if (error) {
      console.error("[weekly-report] fallo al mandar a", stats.studentProfileId, error);
      failedCount++;
      continue;
    }

    await prisma.studentProfile.update({
      where: { id: stats.studentProfileId },
      data: { lastWeeklyReportSentAt: new Date() },
    });
    sentCount++;
  }

  return { candidateCount: students.length, sentCount, failedCount };
}
