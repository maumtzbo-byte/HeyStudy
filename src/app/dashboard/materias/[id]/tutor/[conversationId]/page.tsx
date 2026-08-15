import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireStudentProfile } from "@/lib/auth/getCurrentUser";
import { getConversation } from "@/services/tutor/tutorService";
import { TutorChat } from "@/components/tutor/TutorChat";

export const metadata: Metadata = { title: "Tutor IA — HeyStudy" };

export default async function TutorConversationPage({
  params,
}: PageProps<"/dashboard/materias/[id]/tutor/[conversationId]">) {
  const { conversationId } = await params;
  const { studentProfile } = await requireStudentProfile();

  const conversation = await getConversation(studentProfile.id, conversationId);
  if (!conversation) notFound();

  return (
    <TutorChat
      conversationId={conversation.id}
      subjectName={conversation.subjectName}
      mode={conversation.mode}
      initialMessages={conversation.messages}
    />
  );
}
