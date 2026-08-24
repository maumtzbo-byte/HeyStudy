import "server-only";
import { prisma } from "@/lib/prisma/client";

const YOUTUBE_SEARCH_URL = "https://www.googleapis.com/youtube/v3/search";
// El free tier de la YouTube Data API es de 10,000 unidades/día y
// search.list cuesta 100 — sin cache, ~100 búsquedas agotarían el día
// completo. Cachear por tema (no por estudiante) 30 días es seguro: el
// mejor video explicando "Ecuaciones cuadráticas" no cambia entre
// estudiantes ni de un día para otro.
const CACHE_DAYS = 30;
const MAX_VIDEOS_PER_TOPIC = 2;

export interface VideoRecommendation {
  youtubeVideoId: string;
  title: string;
  channelTitle: string;
  thumbnailUrl: string;
  url: string;
}

function toView(row: {
  youtubeVideoId: string;
  title: string;
  channelTitle: string;
  thumbnailUrl: string;
}): VideoRecommendation {
  return { ...row, url: `https://www.youtube.com/watch?v=${row.youtubeVideoId}` };
}

interface YouTubeSearchItem {
  id?: { videoId?: string };
  snippet?: {
    title?: string;
    channelTitle?: string;
    thumbnails?: { medium?: { url?: string }; default?: { url?: string } };
  };
}

export async function getVideoRecommendationsForTopic(params: {
  knowledgeTopicId: string;
  topicName: string;
  subjectName: string;
}): Promise<VideoRecommendation[]> {
  const { knowledgeTopicId, topicName, subjectName } = params;

  const cacheCutoff = new Date(Date.now() - CACHE_DAYS * 24 * 60 * 60 * 1000);
  const cached = await prisma.recommendedVideo.findMany({
    where: { knowledgeTopicId, fetchedAt: { gte: cacheCutoff } },
    orderBy: { fetchedAt: "desc" },
    take: MAX_VIDEOS_PER_TOPIC,
  });
  if (cached.length > 0) return cached.map(toView);

  const apiKey = process.env.YOUTUBE_API_KEY;
  // Sin key configurada la app sigue funcionando normal, sólo sin videos
  // (mismo criterio que el resto de las integraciones opcionales).
  if (!apiKey) return [];

  const url = new URL(YOUTUBE_SEARCH_URL);
  url.searchParams.set("part", "snippet");
  url.searchParams.set("q", `${topicName} ${subjectName} explicación`);
  url.searchParams.set("type", "video");
  url.searchParams.set("maxResults", String(MAX_VIDEOS_PER_TOPIC));
  url.searchParams.set("relevanceLanguage", "es");
  url.searchParams.set("regionCode", "MX");
  // safeSearch=strict porque el público incluye menores de edad.
  url.searchParams.set("safeSearch", "strict");
  url.searchParams.set("videoEmbeddable", "true");
  url.searchParams.set("order", "relevance");
  url.searchParams.set("key", apiKey);

  let items: YouTubeSearchItem[];
  try {
    const res = await fetch(url.toString());
    if (!res.ok) return [];
    const data = (await res.json()) as { items?: YouTubeSearchItem[] };
    items = data.items ?? [];
  } catch {
    // Un video recomendado es una mejora, no algo crítico: si YouTube falla
    // o no hay red, el plan de estudio se sigue mostrando sin videos.
    return [];
  }

  const rows = items
    .filter((item): item is YouTubeSearchItem & { id: { videoId: string } } => Boolean(item.id?.videoId))
    .map((item) => ({
      knowledgeTopicId,
      youtubeVideoId: item.id.videoId,
      title: item.snippet?.title ?? topicName,
      channelTitle: item.snippet?.channelTitle ?? "",
      thumbnailUrl: item.snippet?.thumbnails?.medium?.url ?? item.snippet?.thumbnails?.default?.url ?? "",
    }));
  if (rows.length === 0) return [];

  await prisma.$transaction(
    rows.map((row) =>
      prisma.recommendedVideo.upsert({
        where: {
          knowledgeTopicId_youtubeVideoId: {
            knowledgeTopicId: row.knowledgeTopicId,
            youtubeVideoId: row.youtubeVideoId,
          },
        },
        create: row,
        update: {
          title: row.title,
          channelTitle: row.channelTitle,
          thumbnailUrl: row.thumbnailUrl,
          fetchedAt: new Date(),
        },
      }),
    ),
  );

  return rows.map(toView);
}
