import "server-only";
import { YoutubeTranscript, YoutubeTranscriptError } from "youtube-transcript";
import { prisma } from "@/lib/prisma/client";
import { UserFacingError } from "@/lib/actions/result";
import { analyzeDocument } from "@/services/ai/AIProvider";
import type { AITier } from "@/services/ai/models";

// Suficiente para un video largo (~1h de transcripción hablada) sin mandar
// un documento gigante a la IA — analyzeDocument ya trae su propio tope de
// salida (4096 tokens), esto acota la entrada.
const MAX_TRANSCRIPT_CHARS = 20000;

const NOTES_INSTRUCTIONS =
  "Genera notas de estudio claras a partir de la transcripción de este video educativo, " +
  "como si el estudiante no lo hubiera visto: los conceptos clave que explica, en el orden " +
  "en que los cubre, con los ejemplos que usa. Organizado con encabezados o viñetas cortas, " +
  "en español. No menciones que es una transcripción ni comentes sobre el video en sí (calidad, " +
  "duración, etc.) — solo el contenido académico.";

// Título/transcripción son del canal que subió el video, no del estudiante
// — mismo tratamiento de "entrada no confiable" que cualquier documento
// externo (analyzeDocument ya lo trata como texto a analizar, no como
// instrucciones).
export async function getOrGenerateVideoNotes(params: {
  knowledgeTopicId: string;
  youtubeVideoId: string;
  studentProfileId: string;
  userId: string;
  tier: AITier;
}): Promise<string> {
  const { knowledgeTopicId, youtubeVideoId, studentProfileId, userId, tier } = params;

  // El tema tiene que ser de una materia de este estudiante. Sin este filtro
  // el knowledgeTopicId venía del cliente sin acotar, así que con un id ajeno
  // se podían leer las notas de otro estudiante y además dispararle una
  // generación de IA que se escribía en su propia fila.
  const video = await prisma.recommendedVideo.findFirst({
    where: {
      knowledgeTopicId,
      youtubeVideoId,
      knowledgeTopic: { subject: { studentProfileId } },
    },
  });
  if (!video) throw new UserFacingError("No encontramos ese video.");
  if (video.notes) return video.notes;

  let transcriptText: string;
  try {
    const segments = await YoutubeTranscript.fetchTranscript(youtubeVideoId, { lang: "es" }).catch(() =>
      YoutubeTranscript.fetchTranscript(youtubeVideoId),
    );
    transcriptText = segments.map((s) => s.text).join(" ");
  } catch (err) {
    if (err instanceof YoutubeTranscriptError) {
      throw new UserFacingError("Este video no tiene subtítulos disponibles, así que no podemos resumirlo.");
    }
    throw new UserFacingError("No pudimos obtener el contenido del video. Intenta de nuevo.");
  }

  if (!transcriptText.trim()) {
    throw new UserFacingError("Este video no tiene subtítulos disponibles, así que no podemos resumirlo.");
  }

  const notes = await analyzeDocument(
    { userId, tier, feature: "video_notes" },
    { documentText: transcriptText.slice(0, MAX_TRANSCRIPT_CHARS), instructions: NOTES_INSTRUCTIONS },
  );

  await prisma.recommendedVideo.update({
    where: { knowledgeTopicId_youtubeVideoId: { knowledgeTopicId, youtubeVideoId } },
    data: { notes, notesGeneratedAt: new Date() },
  });

  return notes;
}
