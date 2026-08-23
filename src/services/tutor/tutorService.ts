import "server-only";
import { prisma } from "@/lib/prisma/client";
import { UserFacingError } from "@/lib/actions/result";
import { tutorResponse } from "@/services/ai/AIProvider";
import { MODE_TO_DB, MODE_FROM_DB } from "@/services/tutor/customTutorService";
import type { AITier } from "@/services/ai/models";
import type { TutorMode } from "@/services/ai/types";

// Sin esto, un solo mensaje gigante o mal formado dispara un costo de
// tokens desproporcionado — la salida ya tiene max_tokens en AIProvider,
// pero nada topaba la entrada (sección 8.5).
const MAX_MESSAGE_LENGTH = 4000;

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
  const masteryRows = await prisma.knowledgeMastery.findMany({
    where: { studentProfileId, knowledgeTopic: { subjectId } },
    include: { knowledgeTopic: true },
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

  const subject = await prisma.subject.findFirst({ where: { id: subjectId, studentProfileId } });
  if (!subject) throw new UserFacingError("Materia no encontrada");

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

  const priorMessages = await prisma.tutorChatMessage.findMany({
    where: { tutorConversationId: conversationId },
    orderBy: { createdAt: "asc" },
  });

  await prisma.tutorChatMessage.create({
    data: { tutorConversationId: conversationId, role: "USER", content },
  });

  const masterySummary = await buildMasterySummaryForSubject(studentProfileId, conversation.subjectId);

  const reply = await tutorResponse(
    { userId, tier, feature: "tutor_chat" },
    {
      mode: MODE_FROM_DB[conversation.mode],
      subjectContext: conversation.subject.name,
      masterySummary,
      persona: conversation.customTutor
        ? { name: conversation.customTutor.name, instructions: conversation.customTutor.instructions }
        : null,
      history: [
        ...priorMessages.map((m) => ({
          role: m.role === "USER" ? ("user" as const) : ("assistant" as const),
          content: m.content,
        })),
        { role: "user" as const, content },
      ],
    },
  );

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
