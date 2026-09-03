import "server-only";
import { prisma } from "@/lib/prisma/client";
import { sendTransactionalEmail } from "@/lib/email/resend";
import { buildLeaderboard } from "@/services/groups/studyGroupService";

// Se compara el ranking de hoy contra `lastKnownRank` guardado la última vez
// que corrió este cron — si el número subió (peor lugar), a alguien lo
// rebasaron. No hace falta ventana de dedup por tiempo como en los otros
// recordatorios: el aviso sólo se dispara cuando el rango realmente empeoró
// respecto al último cálculo, y lastKnownRank se actualiza siempre, así que
// es naturalmente una sola vez por cambio.
interface RankDrop {
  studentProfileId: string;
  email: string;
  displayName: string;
  groupName: string;
  newRank: number;
  totalMembers: number;
}

async function computeRankDrops(): Promise<RankDrop[]> {
  const groups = await prisma.studyGroup.findMany({
    include: {
      members: {
        include: { studentProfile: { select: { id: true, displayName: true, timezone: true, user: { select: { email: true } } } } },
      },
    },
  });

  const drops: RankDrop[] = [];

  for (const group of groups) {
    if (group.members.length < 2) continue;

    const viewerTimezone = group.members[0]?.studentProfile.timezone ?? "America/Mexico_City";
    const leaderboard = await buildLeaderboard(
      group.members.map((m) => m.studentProfile),
      group.members[0]!.studentProfileId,
      viewerTimezone,
    );

    const rankByProfileId = new Map(leaderboard.map((row, i) => [row.studentProfileId, i + 1]));

    for (const member of group.members) {
      const newRank = rankByProfileId.get(member.studentProfileId);
      if (!newRank) continue;

      if (member.lastKnownRank !== null && newRank > member.lastKnownRank) {
        drops.push({
          studentProfileId: member.studentProfileId,
          email: member.studentProfile.user.email,
          displayName: member.studentProfile.displayName,
          groupName: group.name,
          newRank,
          totalMembers: group.members.length,
        });
      }

      if (newRank !== member.lastKnownRank) {
        await prisma.studyGroupMember.update({ where: { id: member.id }, data: { lastKnownRank: newRank } });
      }
    }
  }

  return drops;
}

function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function buildEmailHtml(displayName: string, groupName: string, newRank: number, totalMembers: number): string {
  const firstName = escapeHtml(displayName.split(" ")[0] ?? displayName);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://heystudy.app";

  return `
    <div style="font-family: -apple-system, sans-serif; max-width: 480px; margin: 0 auto; color: #222;">
      <p>Hola ${firstName},</p>
      <p>
        En <strong>${escapeHtml(groupName)}</strong> te rebasaron en el ranking de la semana — ahora estás en el
        lugar ${newRank} de ${totalMembers}.
      </p>
      <p>
        <a href="${appUrl}/dashboard/grupos" style="display:inline-block;background:#7C6FE0;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:600;">
          Ver el ranking
        </a>
      </p>
    </div>
  `;
}

export interface GroupRankNotificationRunSummary {
  candidateCount: number;
  sentCount: number;
  failedCount: number;
}

// Entry point del cron diario (ver src/app/api/cron/group-rank-notifications).
export async function sendGroupRankNotifications(): Promise<GroupRankNotificationRunSummary> {
  const drops = await computeRankDrops();
  let sentCount = 0;
  let failedCount = 0;

  for (const drop of drops) {
    const { error } = await sendTransactionalEmail({
      to: drop.email,
      subject: `Te rebasaron en ${drop.groupName}`,
      html: buildEmailHtml(drop.displayName, drop.groupName, drop.newRank, drop.totalMembers),
      audience: "student",
    });

    if (error) {
      console.error("[group-rank-notification] fallo al mandar a", drop.studentProfileId, error);
      failedCount++;
      continue;
    }
    sentCount++;
  }

  return { candidateCount: drops.length, sentCount, failedCount };
}
