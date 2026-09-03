import "server-only";
import { prisma } from "@/lib/prisma/client";
import { UserFacingError } from "@/lib/actions/result";
import { tutorResponse, moderateTutorMessage, summarizeTutorConversation } from "@/services/ai/AIProvider";
import { MODE_TO_DB, MODE_FROM_DB, stripPromptDelimiters } from "@/services/tutor/customTutorService";
import { assertSubjectOwnership } from "@/lib/auth/ownership";
import { claimTutorMessage } from "@/services/usage/aiQuotas";
import type { AITier } from "@/services/ai/models";
import type { TutorMode } from "@/services/ai/types";

// Sin esto, un solo mensaje gigante o mal formado dispara un costo de
// tokens desproporcionado — la salida ya tiene max_tokens en AIProvider,
// pero nada topaba la entrada (sección 8.5).
const MAX_MESSAGE_LENGTH = 4000;

// Respuestas fijas, no generadas por IA: para algo tan sensible como una
// señal de autolesión, un texto revisado y consistente es más seguro que
// dejar que el modelo lo redacte distinto cada vez. Sirven también como la
// respuesta de "unsafe" (fuera del propósito académico), para no gastar una
// llamada completa al tutor en algo que ya sabemos que se va a rechazar.
const SELF_HARM_RESPONSE =
  "Lo que compartes suena difícil, y quiero que sepas que no estás solo/a con esto. " +
  "No soy la persona indicada para acompañarte en esto — hablarlo con alguien de confianza " +
  "(un familiar, un profesor, un psicólogo) o con una línea de ayuda puede hacer una " +
  "diferencia real:\n\n" +
  "• Línea de la Vida (México): 800 911 2000 — gratis, 24/7\n" +
  "• SAPTEL: 55 5259 8121\n\n" +
  "Aquí sigo para ayudarte con lo académico cuando quieras retomarlo.";

const UNSAFE_RESPONSE =
  "Soy un tutor académico de HeyStudy y no puedo ayudarte con eso. Si tienes una duda de " +
  "alguna materia, dime el tema y seguimos con gusto.";

async function assertConversationOwnership(studentProfileId: string, conversationId: string) {
  const conversation = await prisma.tutorConversation.findFirst({
    where: { id: conversationId, studentProfileId },
    include: { subject: true, customTutor: true },
  });
  if (!conversation) throw new UserFacingError("Conversación no encontrada");
  return conversation;
}

// Resume el dominio del estudiante en los temas de esta materia, para darle
// al tutor contexto de qué tan fuerte o débil está el estudiante ahí.
async function buildMasterySummaryForSubject(studentProfileId: string, subjectId: string): Promise<string> {
  // select en vez de include: esto corre en cada mensaje del chat, y de
  // KnowledgeTopic sólo se usa el nombre — no hace falta traer description,
  // parentId, createdAt, etc. en cada turno.
  const masteryRows = await prisma.knowledgeMastery.findMany({
    where: { studentProfileId, knowledgeTopic: { subjectId } },
    select: { score: true, knowledgeTopic: { select: { name: true } } },
  });

  if (masteryRows.length === 0) return "Sin datos de dominio todavía para esta materia.";

  return masteryRows
    .sort((a, b) => a.score - b.score)
    .map((m) => `- ${m.knowledgeTopic.name}: dominio actual ${Math.round(m.score * 100)}%`)
    .join("\n");
}

export async function listConversations(studentProfileId: string, subjectId: string) {
  const conversations = await prisma.tutorConversation.findMany({
    where: { studentProfileId, subjectId },
    orderBy: { updatedAt: "desc" },
    include: {
      _count: { select: { messages: true } },
      customTutor: { select: { name: true, emoji: true } },
    },
  });

  return conversations.map((c) => ({
    id: c.id,
    mode: MODE_FROM_DB[c.mode],
    title: c.title,
    messageCount: c._count.messages,
    updatedAt: c.updatedAt,
    tutorName: c.customTutor?.name ?? null,
    tutorEmoji: c.customTutor?.emoji ?? null,
  }));
}

export async function getConversation(studentProfileId: string, conversationId: string) {
  const conversation = await prisma.tutorConversation.findFirst({
    where: { id: conversationId, studentProfileId },
    include: {
      subject: true,
      customTutor: { select: { name: true, emoji: true } },
      messages: { orderBy: { createdAt: "asc" } },
    },
  });
  if (!conversation) return null;

  return {
    id: conversation.id,
    mode: MODE_FROM_DB[conversation.mode],
    subjectId: conversation.subjectId,
    subjectName: conversation.subject.name,
    tutorName: conversation.customTutor?.name ?? null,
    tutorEmoji: conversation.customTutor?.emoji ?? null,
    notes: conversation.notes,
    messages: conversation.messages.map((m) => ({
      id: m.id,
      role: m.role === "USER" ? ("user" as const) : ("assistant" as const),
      content: m.content,
    })),
  };
}

export async function startConversation(params: {
  studentProfileId: string;
  subjectId: string;
  mode: TutorMode;
  customTutorId?: string | null;
}) {
  const { studentProfileId, subjectId, mode, customTutorId } = params;

  await assertSubjectOwnership(studentProfileId, subjectId);

  // El tutor tiene que ser del estudiante y aplicar a esta materia (general o
  // atado justo a ella).
  let resolvedTutorId: string | null = null;
  let resolvedMode = mode;
  if (customTutorId) {
    const tutor = await prisma.customTutor.findFirst({
      where: { id: customTutorId, studentProfileId, OR: [{ subjectId: null }, { subjectId }] },
    });
    if (!tutor) throw new UserFacingError("Tutor no encontrado");
    resolvedTutorId = tutor.id;
    resolvedMode = MODE_FROM_DB[tutor.baseMode];
  }

  const conversation = await prisma.tutorConversation.create({
    data: {
      studentProfileId,
      subjectId,
      mode: MODE_TO_DB[resolvedMode],
      customTutorId: resolvedTutorId,
    },
  });

  return conversation.id;
}

export async function sendMessage(params: {
  studentProfileId: string;
  userId: string;
  tier: AITier;
  conversationId: string;
  content: string;
}) {
  const { studentProfileId, userId, tier, conversationId, content } = params;

  if (content.length > MAX_MESSAGE_LENGTH) {
    throw new UserFacingError(`Tu mensaje no puede pasar de ${MAX_MESSAGE_LENGTH} caracteres.`);
  }

  const conversation = await assertConversationOwnership(studentProfileId, conversationId);

  // Cuota mensual antes de escribir nada ni llamar a la IA: el chat del
  // tutor no tenía ningún tope en ningún plan, y es de las operaciones más
  // caras del producto (cada turno reenvía toda la conversación).
  await claimTutorMessage(userId, tier);

  const priorMessages = await prisma.tutorChatMessage.findMany({
    where: { tutorConversationId: conversationId },
    orderBy: { createdAt: "asc" },
  });

  await prisma.tutorChatMessage.create({
    data: { tutorConversationId: conversationId, role: "USER", content },
  });

  // El público incluye menores y el chat es texto libre: se clasifica antes
  // de gastar una llamada completa al tutor. Si el chequeo mismo falla (red,
  // API caída), no se bloquea el tutor entero por eso — el modelo del tutor
  // ya trae su propia instrucción de seguridad como segunda capa (ver
  // buildTutorSystemPrompt), así que fallar "safe" aquí no deja el chat sin
  // ninguna protección.
  const moderation = await moderateTutorMessage({ userId, tier: "free", feature: "tutor_moderation" }, content).catch(
    (err) => {
      console.error("[tutor moderation]", err);
      return "safe" as const;
    },
  );

  let reply: string;
  if (moderation === "self_harm") {
    reply = SELF_HARM_RESPONSE;
  } else if (moderation === "unsafe") {
    reply = UNSAFE_RESPONSE;
  } else {
    const [masterySummary, studentProfile] = await Promise.all([
      buildMasterySummaryForSubject(studentProfileId, conversation.subjectId),
      prisma.studentProfile.findUnique({ where: { id: studentProfileId }, select: { learningStyleNotes: true } }),
    ]);

    reply = await tutorResponse(
      { userId, tier, feature: "tutor_chat" },
      {
        mode: MODE_FROM_DB[conversation.mode],
        subjectContext: conversation.subject.name,
        masterySummary,
        persona: conversation.customTutor
          ? { name: conversation.customTutor.name, instructions: conversation.customTutor.instructions }
          : null,
        learningStyleNotes: studentProfile?.learningStyleNotes ?? null,
        history: [
          ...priorMessages.map((m) => ({
            role: m.role === "USER" ? ("user" as const) : ("assistant" as const),
            content: m.content,
          })),
          { role: "user" as const, content },
        ],
      },
    );
  }

  await prisma.tutorChatMessage.create({
    data: { tutorConversationId: conversationId, role: "ASSISTANT", content: reply },
  });

  const title = conversation.title ?? content.slice(0, 60);
  await prisma.tutorConversation.update({
    where: { id: conversationId },
    data: { updatedAt: new Date(), title },
  });

  return reply;
}

// Libreta de notas + actualización del perfil de estilo de aprendizaje + un
// tema sugerido para practicar, todo de una sola llamada a IA sobre la
// conversación completa (ver summarizeTutorConversation). El estudiante lo
// dispara a mano ("Generar mis notas"), no corre solo.
export async function generateWrapUp(params: {
  studentProfileId: string;
  userId: string;
  tier: AITier;
  conversationId: string;
}) {
  const { studentProfileId, userId, tier, conversationId } = params;

  const conversation = await assertConversationOwnership(studentProfileId, conversationId);

  const [messages, studentProfile, topics] = await Promise.all([
    prisma.tutorChatMessage.findMany({
      where: { tutorConversationId: conversationId },
      orderBy: { createdAt: "asc" },
    }),
    prisma.studentProfile.findUnique({ where: { id: studentProfileId }, select: { learningStyleNotes: true } }),
    prisma.knowledgeTopic.findMany({
      where: { subjectId: conversation.subjectId },
      select: { id: true, name: true },
    }),
  ]);

  if (messages.length === 0) throw new UserFacingError("Todavía no hay nada que resumir.");

  const wrapUp = await summarizeTutorConversation(
    { userId, tier, feature: "tutor_wrap_up" },
    {
      history: messages.map((m) => ({
        role: m.role === "USER" ? ("user" as const) : ("assistant" as const),
        content: m.content,
      })),
      subjectName: conversation.subject.name,
      existingLearningNotes: studentProfile?.learningStyleNotes ?? null,
      topics,
    },
  );

  await prisma.tutorConversation.update({
    where: { id: conversationId },
    data: { notes: wrapUp.notes, notesGeneratedAt: new Date() },
  });

  if (wrapUp.learningStyleUpdate) {
    await prisma.studentProfile.update({
      where: { id: studentProfileId },
      // Se escapa igual que las instrucciones de un tutor personalizado, y
      // aquí importa más: este texto lo redacta la IA a partir del chat del
      // propio estudiante y luego se reinyecta en el system prompt de TODAS
      // sus conversaciones futuras, así que una etiqueta de cierre metida
      // por el chat quedaría persistida.
      data: { learningStyleNotes: stripPromptDelimiters(wrapUp.learningStyleUpdate) },
    });
  }

  const suggestedTopic = wrapUp.suggestedTopicId ? (topics.find((t) => t.id === wrapUp.suggestedTopicId) ?? null) : null;

  return {
    notes: wrapUp.notes,
    suggestedTopic: suggestedTopic ? { id: suggestedTopic.id, name: suggestedTopic.name } : null,
  };
}
