import "server-only";
import { prisma } from "@/lib/prisma/client";
import { UserFacingError } from "@/lib/actions/result";
import { checkRateLimit } from "@/services/security/rateLimit";

const USERNAME_REGEX = /^[a-z0-9_]{3,20}$/;

function normalizeUsername(raw: string): string {
  return raw.trim().toLowerCase();
}

export async function updateUsername(studentProfileId: string, rawUsername: string) {
  const username = normalizeUsername(rawUsername);
  if (!USERNAME_REGEX.test(username)) {
    throw new UserFacingError("El usuario debe tener 3-20 caracteres: letras, números o guion bajo.");
  }

  try {
    await prisma.studentProfile.update({ where: { id: studentProfileId }, data: { username } });
  } catch (err) {
    const isUniqueViolation =
      typeof err === "object" && err !== null && (err as { code?: string }).code === "P2002";
    if (isUniqueViolation) throw new UserFacingError("Ese nombre de usuario ya está en uso.");
    throw err;
  }
}

// Se agrega por @username exacto, nunca por búsqueda libre de nombre o
// correo — mismo criterio que StudyGroup (buscar por identidad real
// permitiría averiguar quién tiene cuenta en HeyStudy).
export async function sendFriendRequest(studentProfileId: string, rawUsername: string) {
  const username = normalizeUsername(rawUsername.replace(/^@/, ""));
  if (!username) throw new UserFacingError("Escribe un nombre de usuario.");

  // Rechazar una solicitud BORRA la fila (ver respondToFriendRequest), así
  // que no queda constancia de que alguien ya dijo que no: sin límite, la
  // misma persona puede reenviar para siempre. El tope también acota el
  // sondeo de qué @usuarios existen.
  //
  // El mensaje distinto de "no encontramos a nadie con ese usuario" se
  // queda a propósito: el @username es un handle público opt-in, se
  // comparte justamente para que te agreguen, y esconder el error sólo
  // empeora la experiencia sin cerrar nada real.
  await checkRateLimit(
    `friend-request:${studentProfileId}`,
    20,
    60 * 60,
    "Mandaste muchas solicitudes seguidas. Espera un rato antes de mandar otra.",
  );

  const target = await prisma.studentProfile.findUnique({ where: { username }, select: { id: true } });
  if (!target) throw new UserFacingError("No encontramos a nadie con ese usuario.");
  if (target.id === studentProfileId) throw new UserFacingError("Ese eres tú.");

  const existing = await prisma.friendship.findFirst({
    where: {
      OR: [
        { requesterId: studentProfileId, addresseeId: target.id },
        { requesterId: target.id, addresseeId: studentProfileId },
      ],
    },
  });
  if (existing) {
    throw new UserFacingError(
      existing.status === "ACCEPTED" ? "Ya son amigos." : "Ya hay una solicitud pendiente con esta persona.",
    );
  }

  await prisma.friendship.create({ data: { requesterId: studentProfileId, addresseeId: target.id } });
}

export async function respondToFriendRequest(studentProfileId: string, friendshipId: string, accept: boolean) {
  const friendship = await prisma.friendship.findUnique({ where: { id: friendshipId } });
  if (!friendship || friendship.addresseeId !== studentProfileId || friendship.status !== "PENDING") {
    throw new UserFacingError("No encontramos esa solicitud.");
  }

  if (accept) {
    await prisma.friendship.update({ where: { id: friendshipId }, data: { status: "ACCEPTED", respondedAt: new Date() } });
  } else {
    await prisma.friendship.delete({ where: { id: friendshipId } });
  }
}

export async function removeFriendship(studentProfileId: string, friendshipId: string) {
  const { count } = await prisma.friendship.deleteMany({
    where: { id: friendshipId, OR: [{ requesterId: studentProfileId }, { addresseeId: studentProfileId }] },
  });
  if (count === 0) throw new UserFacingError("No encontramos esa conexión.");
}

export async function listFriends(studentProfileId: string) {
  const friendships = await prisma.friendship.findMany({
    where: {
      status: "ACCEPTED",
      OR: [{ requesterId: studentProfileId }, { addresseeId: studentProfileId }],
    },
    orderBy: { respondedAt: "desc" },
    include: {
      requester: { select: { id: true, displayName: true, username: true } },
      addressee: { select: { id: true, displayName: true, username: true } },
    },
  });

  return friendships.map((f) => {
    const friend = f.requesterId === studentProfileId ? f.addressee : f.requester;
    return { friendshipId: f.id, studentProfileId: friend.id, displayName: friend.displayName, username: friend.username };
  });
}

export async function listPendingRequests(studentProfileId: string) {
  const [received, sent] = await Promise.all([
    prisma.friendship.findMany({
      where: { addresseeId: studentProfileId, status: "PENDING" },
      orderBy: { createdAt: "desc" },
      include: { requester: { select: { displayName: true, username: true } } },
    }),
    prisma.friendship.findMany({
      where: { requesterId: studentProfileId, status: "PENDING" },
      orderBy: { createdAt: "desc" },
      include: { addressee: { select: { displayName: true, username: true } } },
    }),
  ]);

  return {
    received: received.map((f) => ({ friendshipId: f.id, displayName: f.requester.displayName, username: f.requester.username })),
    sent: sent.map((f) => ({ friendshipId: f.id, displayName: f.addressee.displayName, username: f.addressee.username })),
  };
}
