import "server-only";
import { prisma } from "@/lib/prisma/client";
import { tutorResponse } from "@/services/ai/AIProvider";
import type { AITier } from "@/services/ai/models";
import type { TutorMode } from "@/services/ai/types";
import type { TutorConversationMode as DbTutorMode } from "@/generated/prisma/client";

const MODE_TO_DB: Record<TutorMode, DbTutorMode> = {
  socratico: "SOCRATICO",
  explicar: "EXPLICAR",
  pista: "PISTA",
  practica: "PRACTICA",
};

const MODE_FROM_DB: Record<DbTutorMode, TutorMode> = {
  SOCRATICO: "socratico",
  EXPLICAR: "explicar",
  PISTA: "pista",
  PRACTICA: "practica",
};

async function assertConversationOwnership(studentProfileId: string, conversationId: string) {
  const conversation = await prisma.tutorConversation.findFirst({
    where: { id: conversationId, studentProfileId },
    include: { subject: true },
  });
  if (!conversation) throw new Error("Conversación no encontrada");
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
    include: { _count: { select: { messages: true } } },
  });

  return conversations.map((c) => ({
    id: c.id,
    mode: MODE_FROM_DB[c.mode],
    title: c.title,
    messageCount: c._count.messages,
    updatedAt: c.updatedAt,
  }));
}

export async function getConversation(studentProfileId: string, conversationId: string) {
  const conversation = await prisma.tutorConversation.findFirst({
    where: { id: conversationId, studentProfileId },
    include: {
      subject: true,
      messages: { orderBy: { createdAt: "asc" } },
    },
  });
  if (!conversation) return null;

  return {
    id: conversation.id,
    mode: MODE_FROM_DB[conversation.mode],
    subjectId: conversation.subjectId,
    subjectName: conversation.subject.name,
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
}) {
  const { studentProfileId, subjectId, mode } = params;

  const subject = await prisma.subject.findFirst({ where: { id: subjectId, studentProfileId } });
  if (!subject) throw new Error("Materia no encontrada");

  const conversation = await prisma.tutorConversation.create({
    data: { studentProfileId, subjectId, mode: MODE_TO_DB[mode] },
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
