import "server-only";
import { prisma } from "@/lib/prisma/client";
import { sendTransactionalEmail } from "@/lib/email/resend";

// Tolera que el cron diario tenga jitter (no siempre dispara a la misma
// hora exacta) sin mandar el recordatorio dos veces el mismo día.
const MIN_HOURS_BETWEEN_REMINDERS = 20;
const MAX_TOPICS_LISTED = 5;

interface OverdueGroup {
  studentProfileId: string;
  email: string;
  displayName: string;
  topics: string[];
}

async function getStudentsWithOverdueReviews(): Promise<OverdueGroup[]> {
  const cutoff = new Date(Date.now() - MIN_HOURS_BETWEEN_REMINDERS * 60 * 60 * 1000);

  const rows = await prisma.knowledgeMastery.findMany({
    where: {
      nextReview: { lte: new Date() },
      studentProfile: {
        reviewRemindersEnabled: true,
        OR: [{ lastReviewReminderSentAt: null }, { lastReviewReminderSentAt: { lt: cutoff } }],
      },
    },
    select: {
      studentProfileId: true,
      knowledgeTopic: { select: { name: true, subject: { select: { name: true } } } },
      studentProfile: { select: { displayName: true, user: { select: { email: true } } } },
    },
  });

  const byStudent = new Map<string, OverdueGroup>();
  for (const row of rows) {
    const topicLabel = `${row.knowledgeTopic.subject.name}: ${row.knowledgeTopic.name}`;
    const existing = byStudent.get(row.studentProfileId);
    if (existing) {
      existing.topics.push(topicLabel);
    } else {
      byStudent.set(row.studentProfileId, {
        studentProfileId: row.studentProfileId,
        email: row.studentProfile.user.email,
        displayName: row.studentProfile.displayName,
        topics: [topicLabel],
      });
    }
  }
  return [...byStudent.values()];
}

function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function buildEmailHtml(displayName: string, topics: string[]): string {
  const firstName = escapeHtml(displayName.split(" ")[0] ?? displayName);
  const shown = topics.slice(0, MAX_TOPICS_LISTED);
  const topicListHtml = shown.map((t) => `<li>${escapeHtml(t)}</li>`).join("");
  const moreHtml =
    topics.length > MAX_TOPICS_LISTED
      ? `<p style="color:#666;font-size:14px;">y ${topics.length - MAX_TOPICS_LISTED} más...</p>`
      : "";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://heystudy.app";

  return `
    <div style="font-family: -apple-system, sans-serif; max-width: 480px; margin: 0 auto; color: #222;">
      <p>Hola ${firstName},</p>
      <p>Tienes ${topics.length} tema${topics.length === 1 ? "" : "s"} listo${topics.length === 1 ? "" : "s"} para repasar hoy. Si esperas más, te va a costar más volver a aprenderlo:</p>
      <ul>${topicListHtml}</ul>
      ${moreHtml}
      <p>
        <a href="${appUrl}/dashboard" style="display:inline-block;background:#7C6FE0;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:600;">
          Repasar ahora
        </a>
      </p>
    </div>
  `;
}

export interface ReviewReminderRunSummary {
  candidateCount: number;
  sentCount: number;
  failedCount: number;
}

// Entry point del cron diario (ver src/app/api/cron/review-reminders).
// No lanza por un fallo individual de envío — un correo que rebota no debe
// tumbar el resto de la corrida.
export async function sendReviewReminders(): Promise<ReviewReminderRunSummary> {
  const groups = await getStudentsWithOverdueReviews();
  let sentCount = 0;
  let failedCount = 0;

  for (const group of groups) {
    const topicCount = group.topics.length;
    const { error } = await sendTransactionalEmail({
      to: group.email,
      subject: `Tienes ${topicCount} repaso${topicCount === 1 ? "" : "s"} pendiente${topicCount === 1 ? "" : "s"}`,
      html: buildEmailHtml(group.displayName, group.topics),
      audience: "student",
    });

    if (error) {
      console.error("[review-reminder] fallo al mandar a", group.studentProfileId, error);
      failedCount++;
      continue;
    }

    await prisma.studentProfile.update({
      where: { id: group.studentProfileId },
      data: { lastReviewReminderSentAt: new Date() },
    });
    sentCount++;
  }

  return { candidateCount: groups.length, sentCount, failedCount };
}
