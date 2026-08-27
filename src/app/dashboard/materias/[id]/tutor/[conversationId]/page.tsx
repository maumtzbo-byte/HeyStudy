import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireStudentProfile } from "@/lib/auth/getCurrentUser";
import { getConversation } from "@/services/tutor/tutorService";
import { getPlanUsageSummary } from "@/services/usage/planLimits";
import { TutorChat } from "@/components/tutor/TutorChat";

export const metadata: Metadata = { title: "Tutor IA — HeyStudy" };

export default async function TutorConversationPage({
  params,
}: PageProps<"/dashboard/materias/[id]/tutor/[conversationId]">) {
  const { conversationId } = await params;
  const { user, studentProfile } = await requireStudentProfile();

  const [conversation, planUsage] = await Promise.all([
    getConversation(studentProfile.id, conversationId),
    getPlanUsageSummary(user.id),
  ]);
  if (!conversation) notFound();

  return (
    <TutorChat
      conversationId={conversation.id}
      subjectId={conversation.subjectId}
      subjectName={conversation.subjectName}
      mode={conversation.mode}
      initialMessages={conversation.messages}
      initialNotes={conversation.notes}
      canUseVoice={planUsage.plan === "PAID"}
    />
  );
}
