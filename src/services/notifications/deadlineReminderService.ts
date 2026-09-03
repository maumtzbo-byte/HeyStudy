import "server-only";
import { prisma } from "@/lib/prisma/client";
import { sendTransactionalEmail } from "@/lib/email/resend";
import { todayInTimezone } from "@/lib/utils/dates";

// Cron diario; tolera jitter sin duplicar el correo el mismo día (mismo
// criterio que reviewReminderService).
const MIN_HOURS_BETWEEN_REMINDERS = 20;
// Avisa lo que vence mañana o pasado — con más anticipación deja de sentirse
// urgente y el estudiante lo ignora.
const LOOKAHEAD_DAYS = 2;

interface DueItem {
  title: string;
  subjectName: string;
  kind: "Tarea" | "Examen";
  daysUntil: number;
}

interface StudentDueItems {
  studentProfileId: string;
  email: string;
  displayName: string;
  items: DueItem[];
}

async function getStudentsWithUpcomingDeadlines(): Promise<StudentDueItems[]> {
  const cutoff = new Date(Date.now() - MIN_HOURS_BETWEEN_REMINDERS * 60 * 60 * 1000);

  const students = await prisma.studentProfile.findMany({
    where: {
      deadlineRemindersEnabled: true,
      OR: [{ lastDeadlineReminderSentAt: null }, { lastDeadlineReminderSentAt: { lt: cutoff } }],
    },
    select: { id: true, displayName: true, timezone: true, user: { select: { email: true } } },
  });

  const results: StudentDueItems[] = [];
  for (const student of students) {
    const today = todayInTimezone(student.timezone);
    const limit = new Date(today.getTime() + LOOKAHEAD_DAYS * 24 * 60 * 60 * 1000);

    const [assignments, exams] = await Promise.all([
      prisma.assignment.findMany({
        where: {
          subject: { studentProfileId: student.id },
          status: { not: "COMPLETADA" },
          dueDate: { gte: today, lte: limit },
        },
        include: { subject: { select: { name: true } } },
      }),
      prisma.exam.findMany({
        where: { subject: { studentProfileId: student.id }, examDate: { gte: today, lte: limit } },
        include: { subject: { select: { name: true } } },
      }),
    ]);

    if (assignments.length === 0 && exams.length === 0) continue;

    const items: DueItem[] = [
      ...assignments.map((a) => ({
        title: a.title,
        subjectName: a.subject.name,
        kind: "Tarea" as const,
        daysUntil: Math.ceil((a.dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)),
      })),
      ...exams.map((e) => ({
        title: e.title,
        subjectName: e.subject.name,
        kind: "Examen" as const,
        daysUntil: Math.ceil((e.examDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)),
      })),
    ].sort((a, b) => a.daysUntil - b.daysUntil);

    results.push({ studentProfileId: student.id, email: student.user.email, displayName: student.displayName, items });
  }

  return results;
}

function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function dayLabel(daysUntil: number): string {
  if (daysUntil <= 0) return "hoy";
  if (daysUntil === 1) return "mañana";
  return `en ${daysUntil} días`;
}

function buildEmailHtml(displayName: string, items: DueItem[]): string {
  const firstName = escapeHtml(displayName.split(" ")[0] ?? displayName);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://heystudy.app";
  const itemsHtml = items
    .map((i) => `<li>${escapeHtml(i.kind)}: ${escapeHtml(i.title)} (${escapeHtml(i.subjectName)}) — ${dayLabel(i.daysUntil)}</li>`)
    .join("");

  return `
    <div style="font-family: -apple-system, sans-serif; max-width: 480px; margin: 0 auto; color: #222;">
      <p>Hola ${firstName},</p>
      <p>Tienes ${items.length} pendiente${items.length === 1 ? "" : "s"} por vencer:</p>
      <ul>${itemsHtml}</ul>
      <p>
        <a href="${appUrl}/dashboard" style="display:inline-block;background:#7C6FE0;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:600;">
          Ver mi plan
        </a>
      </p>
    </div>
  `;
}

export interface DeadlineReminderRunSummary {
  candidateCount: number;
  sentCount: number;
  failedCount: number;
}

// Entry point del cron diario (ver src/app/api/cron/deadline-reminders).
export async function sendDeadlineReminders(): Promise<DeadlineReminderRunSummary> {
  const groups = await getStudentsWithUpcomingDeadlines();
  let sentCount = 0;
  let failedCount = 0;

  for (const group of groups) {
    const { error } = await sendTransactionalEmail({
      to: group.email,
      subject: `Tienes ${group.items.length} pendiente${group.items.length === 1 ? "" : "s"} por vencer`,
      html: buildEmailHtml(group.displayName, group.items),
      audience: "student",
    });

    if (error) {
      console.error("[deadline-reminder] fallo al mandar a", group.studentProfileId, error);
      failedCount++;
      continue;
    }

    await prisma.studentProfile.update({
      where: { id: group.studentProfileId },
      data: { lastDeadlineReminderSentAt: new Date() },
    });
    sentCount++;
  }

  return { candidateCount: groups.length, sentCount, failedCount };
}
