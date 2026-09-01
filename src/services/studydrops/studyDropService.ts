import "server-only";
import { prisma } from "@/lib/prisma/client";
import { UserFacingError } from "@/lib/actions/result";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { assertSubjectOwnershipIfSet } from "@/lib/auth/ownership";
import { checkRateLimit } from "@/services/security/rateLimit";
import { formatDate } from "@/lib/format";
import { STUDY_DROPS_BUCKET } from "@/lib/constants/storage";
import type { StudyDropMediaType } from "@/generated/prisma/client";

const ALLOWED_TYPES: Record<string, StudyDropMediaType> = {
  "video/mp4": "VIDEO",
  "video/webm": "VIDEO",
  "video/quicktime": "VIDEO",
  "image/png": "IMAGEN",
  "image/jpeg": "IMAGEN",
  "image/webp": "IMAGEN",
};
const MAX_FILE_SIZE_BYTES = 60 * 1024 * 1024;
const MAX_VIDEO_SECONDS = 60;
// URL firmada larga (30 min) para que el feed no tenga que refirmar en cada
// scroll, a diferencia de los 5 min de materials (que sólo se abren una vez
// al click).
const FEED_SIGNED_URL_SECONDS = 60 * 30;

// Mismo sanitizador que materialService — el RLS del bucket ya impide que un
// usuario toque la carpeta de otro, esto es sólo profundidad de defensa.
function sanitizeFileName(name: string): string {
  const safe = name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-150);
  return safe || "archivo";
}

export async function getUploadUrl(params: {
  userId: string;
  fileName: string;
  contentType: string;
  fileSizeBytes: number;
}) {
  const { userId, fileName, contentType, fileSizeBytes } = params;

  const mediaType = ALLOWED_TYPES[contentType];
  if (!mediaType) throw new UserFacingError("Sólo se permiten video (MP4/WEBM/MOV) o imagen (PNG/JPG/WEBP).");
  if (fileSizeBytes > MAX_FILE_SIZE_BYTES) throw new UserFacingError("El archivo no puede pesar más de 60 MB.");

  const storagePath = `${userId}/${Date.now()}-${sanitizeFileName(fileName)}`;

  // Cliente autenticado por cookie: aquí sí basta la política dueño-only del
  // bucket, sólo se sube contenido propio (a diferencia de leer el feed de
  // alguien más, ver getFeed).
  const supabase = await createClient();
  const { data, error } = await supabase.storage.from(STUDY_DROPS_BUCKET).createSignedUploadUrl(storagePath);
  if (error || !data) throw new UserFacingError("No se pudo preparar la subida. Intenta de nuevo.");

  return { storagePath, signedUrl: data.signedUrl, token: data.token, mediaType };
}

// Reusado por getFeed (varios drops) y createStudyDrop (uno solo, recién
// creado) para no duplicar el formateo fecha/URL-firmada en dos lugares.
async function buildFeedItem(
  drop: {
    id: string;
    caption: string | null;
    mediaType: StudyDropMediaType;
    storagePath: string;
    createdAt: Date;
  },
  extra: {
    subjectName: string | null;
    subjectColor: string | null;
    authorName: string;
    isOwn: boolean;
    likeCount: number;
    likedByMe: boolean;
  },
  adminStorage: ReturnType<ReturnType<typeof createAdminClient>["storage"]["from"]>,
) {
  const { data } = await adminStorage.createSignedUrl(drop.storagePath, FEED_SIGNED_URL_SECONDS);
  return {
    id: drop.id,
    caption: drop.caption,
    mediaType: drop.mediaType,
    mediaUrl: data?.signedUrl ?? null,
    subjectName: extra.subjectName,
    subjectColor: extra.subjectColor,
    authorName: extra.authorName,
    isOwn: extra.isOwn,
    createdAtLabel: formatDate(drop.createdAt, { day: "numeric", month: "short" }),
    likeCount: extra.likeCount,
    likedByMe: extra.likedByMe,
  };
}

// authorName viene del caller (requireStudentProfile ya lo tiene a mano) en
// vez de volver a consultarlo — evita un round-trip extra sólo para armar
// el item que se muestra optimistamente tras publicar.
export async function createStudyDrop(
  studentProfileId: string,
  params: {
    authorName: string;
    subjectId: string | null;
    caption: string | null;
    mediaType: StudyDropMediaType;
    storagePath: string;
    durationSeconds: number | null;
    fileSizeKb: number | null;
  },
) {
  const { authorName, subjectId, caption, mediaType, storagePath, durationSeconds, fileSizeKb } = params;

  // Límite real, no sólo la sugerencia del cliente antes de subir (ver
  // StudyDropUploadForm) — un cliente modificado podría mandar cualquier
  // duración.
  if (mediaType === "VIDEO" && durationSeconds !== null && durationSeconds > MAX_VIDEO_SECONDS) {
    throw new UserFacingError(`El video no puede durar más de ${MAX_VIDEO_SECONDS} segundos.`);
  }

  const subject = await assertSubjectOwnershipIfSet(studentProfileId, subjectId);
  await checkRateLimit(`studydrop:post:${studentProfileId}`, 10, 60 * 60);

  const drop = await prisma.studyDrop.create({
    data: {
      studentProfileId,
      subjectId,
      caption: caption?.trim() || null,
      mediaType,
      storagePath,
      durationSeconds,
      fileSizeKb,
    },
  });

  const adminStorage = createAdminClient().storage.from(STUDY_DROPS_BUCKET);
  return buildFeedItem(
    drop,
    {
      subjectName: subject?.name ?? null,
      subjectColor: subject?.color ?? null,
      authorName,
      isOwn: true,
      likeCount: 0,
      likedByMe: false,
    },
    adminStorage,
  );
}

export async function deleteStudyDrop(studentProfileId: string, studyDropId: string) {
  const drop = await prisma.studyDrop.findFirst({ where: { id: studyDropId, studentProfileId } });
  if (!drop) throw new UserFacingError("No encontramos ese drop.");

  const supabase = await createClient();
  await supabase.storage.from(STUDY_DROPS_BUCKET).remove([drop.storagePath]);

  return prisma.studyDrop.delete({ where: { id: studyDropId } });
}

// Conjunto real de visibilidad: amigos aceptados + compañeros de cualquier
// grupo de estudio en común (sin incluir al propio estudiante). Reusado por
// el feed y por toggleLike — nadie puede dar like a un drop que no podría
// ver en su feed.
export async function getFriendsAndGroupmateIds(studentProfileId: string): Promise<string[]> {
  const [friendships, memberships] = await Promise.all([
    prisma.friendship.findMany({
      where: { status: "ACCEPTED", OR: [{ requesterId: studentProfileId }, { addresseeId: studentProfileId }] },
      select: { requesterId: true, addresseeId: true },
    }),
    prisma.studyGroupMember.findMany({ where: { studentProfileId }, select: { studyGroupId: true } }),
  ]);

  const friendIds = friendships.map((f) => (f.requesterId === studentProfileId ? f.addresseeId : f.requesterId));

  const groupIds = memberships.map((m) => m.studyGroupId);
  const groupmateIds =
    groupIds.length === 0
      ? []
      : (
          await prisma.studyGroupMember.findMany({
            where: { studyGroupId: { in: groupIds } },
            select: { studentProfileId: true },
          })
        ).map((m) => m.studentProfileId);

  return Array.from(new Set([...friendIds, ...groupmateIds]));
}

export async function getFeed(studentProfileId: string, params: { cursor?: string; limit?: number } = {}) {
  const { cursor, limit = 10 } = params;
  const visibleIds = await getFriendsAndGroupmateIds(studentProfileId);

  const drops = await prisma.studyDrop.findMany({
    where: { studentProfileId: { in: [studentProfileId, ...visibleIds] } },
    orderBy: { createdAt: "desc" },
    take: limit + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    include: {
      studentProfile: { select: { displayName: true } },
      subject: { select: { name: true, color: true } },
      _count: { select: { likes: true } },
      likes: { where: { studentProfileId }, select: { id: true } },
    },
  });

  const hasMore = drops.length > limit;
  const page = hasMore ? drops.slice(0, limit) : drops;

  // URL firmada del lado del servidor con el cliente admin: a diferencia de
  // materials (donde sólo el dueño ve su propio archivo), aquí un amigo
  // necesita ver el video de otra persona — la visibilidad real ya se
  // validó arriba con getFriendsAndGroupmateIds, así que esto sólo resuelve
  // el path a una URL, no vuelve a decidir quién puede ver qué.
  const adminStorage = createAdminClient().storage.from(STUDY_DROPS_BUCKET);
  const items = await Promise.all(
    page.map((drop) =>
      buildFeedItem(
        drop,
        {
          subjectName: drop.subject?.name ?? null,
          subjectColor: drop.subject?.color ?? null,
          authorName: drop.studentProfile.displayName,
          isOwn: drop.studentProfileId === studentProfileId,
          likeCount: drop._count.likes,
          likedByMe: drop.likes.length > 0,
        },
        adminStorage,
      ),
    ),
  );

  return { items, nextCursor: hasMore ? (page[page.length - 1]?.id ?? null) : null };
}

export async function toggleLike(studentProfileId: string, studyDropId: string) {
  const visibleIds = await getFriendsAndGroupmateIds(studentProfileId);
  const drop = await prisma.studyDrop.findFirst({
    where: { id: studyDropId, studentProfileId: { in: [studentProfileId, ...visibleIds] } },
    select: { id: true },
  });
  if (!drop) throw new UserFacingError("No encontramos ese drop.");

  await checkRateLimit(`studydrop:like:${studentProfileId}`, 60, 60);

  const existing = await prisma.studyDropLike.findUnique({
    where: { studyDropId_studentProfileId: { studyDropId, studentProfileId } },
  });

  if (existing) {
    await prisma.studyDropLike.delete({ where: { id: existing.id } });
    return { liked: false };
  }
  await prisma.studyDropLike.create({ data: { studyDropId, studentProfileId } });
  return { liked: true };
}
