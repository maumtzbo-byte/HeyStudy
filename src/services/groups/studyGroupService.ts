import "server-only";
import { randomInt } from "node:crypto";
import { prisma } from "@/lib/prisma/client";
import { UserFacingError } from "@/lib/actions/result";
import { todayInTimezone } from "@/lib/utils/dates";

// Sin 0/O ni 1/I/L: los códigos se dictan en voz alta y se escriben a mano.
const CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const CODE_LENGTH = 6;
const MAX_GROUPS_PER_STUDENT = 10;
const MAX_MEMBERS_PER_GROUP = 50;
const LEADERBOARD_DAYS = 7;

function generateJoinCode(): string {
  let code = "";
  for (let i = 0; i < CODE_LENGTH; i++) {
    code += CODE_ALPHABET[randomInt(CODE_ALPHABET.length)];
  }
  return code;
}

// El código es único a nivel base de datos; si dos grupos lo generan igual al
// mismo tiempo, el insert falla y se reintenta en vez de dar un error raro.
async function createGroupWithUniqueCode(name: string, ownerId: string) {
  for (let attempt = 0; attempt < 5; attempt++) {
    const joinCode = generateJoinCode();
    try {
      return await prisma.$transaction(async (tx) => {
        const group = await tx.studyGroup.create({ data: { name, joinCode, ownerId } });
        await tx.studyGroupMember.create({
          data: { studyGroupId: group.id, studentProfileId: ownerId, role: "OWNER" },
        });
        return group;
      });
    } catch (err) {
      const isUniqueViolation =
        typeof err === "object" && err !== null && (err as { code?: string }).code === "P2002";
      if (!isUniqueViolation) throw err;
    }
  }
  throw new UserFacingError("No pudimos generar un código de grupo. Vuelve a intentarlo.");
}

export async function createStudyGroup(studentProfileId: string, rawName: string) {
  const name = rawName.trim();
  if (name.length < 2) throw new UserFacingError("Ponle un nombre de al menos 2 caracteres.");
  if (name.length > 50) throw new UserFacingError("El nombre no puede pasar de 50 caracteres.");

  const owned = await prisma.studyGroupMember.count({ where: { studentProfileId } });
  if (owned >= MAX_GROUPS_PER_STUDENT) {
    throw new UserFacingError(`Puedes estar en hasta ${MAX_GROUPS_PER_STUDENT} grupos.`);
  }

  const group = await createGroupWithUniqueCode(name, studentProfileId);
  return group.id;
}

export async function joinStudyGroup(studentProfileId: string, rawCode: string) {
  const joinCode = rawCode.trim().toUpperCase();
  if (!joinCode) throw new UserFacingError("Escribe el código del grupo.");

  const group = await prisma.studyGroup.findUnique({
    where: { joinCode },
    include: { _count: { select: { members: true } } },
  });
  if (!group) throw new UserFacingError("No encontramos un grupo con ese código.");

  const already = await prisma.studyGroupMember.findUnique({
    where: { studyGroupId_studentProfileId: { studyGroupId: group.id, studentProfileId } },
  });
  if (already) return group.id;

  if (group._count.members >= MAX_MEMBERS_PER_GROUP) {
    throw new UserFacingError("Este grupo ya está lleno.");
  }

  await prisma.studyGroupMember.create({ data: { studyGroupId: group.id, studentProfileId } });
  return group.id;
}

export async function leaveStudyGroup(studentProfileId: string, groupId: string) {
  const membership = await prisma.studyGroupMember.findUnique({
    where: { studyGroupId_studentProfileId: { studyGroupId: groupId, studentProfileId } },
  });
  if (!membership) throw new UserFacingError("No perteneces a este grupo.");

  // Si se va quien lo creó, el grupo entero se borra (junto con lo compartido)
  // en vez de quedar huérfano.
  if (membership.role === "OWNER") {
    await prisma.studyGroup.delete({ where: { id: groupId } });
    return;
  }

  await prisma.studyGroupMember.delete({ where: { id: membership.id } });
  // Lo que ya había compartido deja de estar visible para el grupo.
  await prisma.sharedStudyPlan.deleteMany({ where: { studyGroupId: groupId, sharedById: studentProfileId } });
}

export async function listMyGroups(studentProfileId: string) {
  const memberships = await prisma.studyGroupMember.findMany({
    where: { studentProfileId },
    orderBy: { joinedAt: "asc" },
    include: {
      studyGroup: {
        include: { _count: { select: { members: true, sharedPlans: true } } },
      },
    },
  });

  return memberships.map((m) => ({
    id: m.studyGroup.id,
    name: m.studyGroup.name,
    joinCode: m.studyGroup.joinCode,
    role: m.role,
    memberCount: m.studyGroup._count.members,
    sharedPlanCount: m.studyGroup._count.sharedPlans,
  }));
}

// Toda lectura de un grupo pasa por aquí: si no eres miembro, no existe.
async function assertMembership(studentProfileId: string, groupId: string) {
  const membership = await prisma.studyGroupMember.findUnique({
    where: { studyGroupId_studentProfileId: { studyGroupId: groupId, studentProfileId } },
  });
  if (!membership) throw new UserFacingError("Grupo no encontrado.");
  return membership;
}

export interface LeaderboardRow {
  studentProfileId: string;
  displayName: string;
  minutesCompleted: number;
  completionRate: number; // 0-1
  activeDays: number;
  isMe: boolean;
}

// Ranking de los últimos 7 días. Solo agrega actividad del plan (minutos
// completados, % de avance, días activos). Nunca toca mastery, diagnósticos,
// patrones de error ni calificaciones — eso no sale del dueño ni en el grupo.
async function buildLeaderboard(
  memberProfiles: { id: string; displayName: string; timezone: string }[],
  viewerProfileId: string,
  viewerTimezone: string,
): Promise<LeaderboardRow[]> {
  const today = todayInTimezone(viewerTimezone);
  const since = new Date(today);
  since.setUTCDate(since.getUTCDate() - (LEADERBOARD_DAYS - 1));

  const plans = await prisma.studyPlan.findMany({
    where: {
      studentProfileId: { in: memberProfiles.map((p) => p.id) },
      forDate: { gte: since, lte: today },
    },
    select: {
      studentProfileId: true,
      forDate: true,
      items: { select: { minutes: true, completed: true } },
    },
  });

  const stats = new Map<string, { minutes: number; done: number; total: number; days: Set<string> }>();
  for (const profile of memberProfiles) {
    stats.set(profile.id, { minutes: 0, done: 0, total: 0, days: new Set() });
  }

  for (const plan of plans) {
    const entry = stats.get(plan.studentProfileId);
    if (!entry) continue;
    for (const item of plan.items) {
      entry.total += 1;
      if (item.completed) {
        entry.done += 1;
        entry.minutes += item.minutes;
        entry.days.add(plan.forDate.toISOString().slice(0, 10));
      }
    }
  }

  return memberProfiles
    .map((profile) => {
      const entry = stats.get(profile.id)!;
      return {
        studentProfileId: profile.id,
        displayName: profile.displayName,
        minutesCompleted: entry.minutes,
        completionRate: entry.total === 0 ? 0 : entry.done / entry.total,
        activeDays: entry.days.size,
        isMe: profile.id === viewerProfileId,
      };
    })
    .sort(
      (a, b) =>
        b.minutesCompleted - a.minutesCompleted ||
        b.completionRate - a.completionRate ||
        a.displayName.localeCompare(b.displayName),
    );
}

export async function getStudyGroupDetail(studentProfileId: string, groupId: string) {
  const membership = await assertMembership(studentProfileId, groupId);

  const group = await prisma.studyGroup.findUnique({
    where: { id: groupId },
    include: {
      members: {
        include: { studentProfile: { select: { id: true, displayName: true, timezone: true } } },
        orderBy: { joinedAt: "asc" },
      },
    },
  });
  if (!group) throw new UserFacingError("Grupo no encontrado.");

  const viewer = group.members.find((m) => m.studentProfileId === studentProfileId);
  const viewerTimezone = viewer?.studentProfile.timezone ?? "America/Mexico_City";

  const leaderboard = await buildLeaderboard(
    group.members.map((m) => m.studentProfile),
    studentProfileId,
    viewerTimezone,
  );

  // Solo planes que alguien decidió compartir explícitamente con este grupo.
  const shared = await prisma.sharedStudyPlan.findMany({
    where: { studyGroupId: groupId },
    orderBy: { sharedAt: "desc" },
    take: 30,
    include: {
      sharedBy: { select: { id: true, displayName: true } },
      studyPlan: {
        select: {
          id: true,
          forDate: true,
          items: {
            orderBy: { orderIndex: "asc" },
            select: { id: true, title: true, minutes: true, completed: true },
          },
        },
      },
    },
  });

  const today = todayInTimezone(viewerTimezone);
  const myTodayPlan = await prisma.studyPlan.findUnique({
    where: { studentProfileId_forDate: { studentProfileId, forDate: today } },
    select: { id: true },
  });
  const myTodayPlanShared = myTodayPlan
    ? (await prisma.sharedStudyPlan.findUnique({
        where: { studyPlanId_studyGroupId: { studyPlanId: myTodayPlan.id, studyGroupId: groupId } },
      })) !== null
    : false;

  return {
    id: group.id,
    name: group.name,
    joinCode: group.joinCode,
    myRole: membership.role,
    memberCount: group.members.length,
    leaderboard,
    // Se expone el título y los minutos del plan, no el porqué: la razón de
    // cada item ("tu dominio bajó 18%") es diagnóstico, y eso no se comparte.
    sharedPlans: shared.map((s) => ({
      id: s.id,
      sharedByName: s.sharedBy.displayName,
      isMine: s.sharedById === studentProfileId,
      forDate: s.studyPlan.forDate,
      items: s.studyPlan.items,
      totalMinutes: s.studyPlan.items.reduce((sum, i) => sum + i.minutes, 0),
      completedCount: s.studyPlan.items.filter((i) => i.completed).length,
    })),
    myTodayPlanId: myTodayPlan?.id ?? null,
    myTodayPlanShared,
  };
}

export async function shareTodayPlanWithGroup(studentProfileId: string, groupId: string) {
  await assertMembership(studentProfileId, groupId);

  const profile = await prisma.studentProfile.findUnique({
    where: { id: studentProfileId },
    select: { timezone: true },
  });
  const forDate = todayInTimezone(profile?.timezone);

  const plan = await prisma.studyPlan.findUnique({
    where: { studentProfileId_forDate: { studentProfileId, forDate } },
    select: { id: true },
  });
  if (!plan) throw new UserFacingError("Todavía no tienes plan de hoy que compartir.");

  await prisma.sharedStudyPlan.upsert({
    where: { studyPlanId_studyGroupId: { studyPlanId: plan.id, studyGroupId: groupId } },
    create: { studyPlanId: plan.id, studyGroupId: groupId, sharedById: studentProfileId },
    update: {},
  });
}

export async function unsharePlanFromGroup(studentProfileId: string, sharedPlanId: string) {
  // Solo quien compartió puede dejar de compartir.
  const { count } = await prisma.sharedStudyPlan.deleteMany({
    where: { id: sharedPlanId, sharedById: studentProfileId },
  });
  if (count === 0) throw new UserFacingError("No encontramos ese plan compartido.");
}
