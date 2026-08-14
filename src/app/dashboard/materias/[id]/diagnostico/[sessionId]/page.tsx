import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireStudentProfile } from "@/lib/auth/getCurrentUser";
import { getSessionWithProgress } from "@/services/knowledge/diagnosisService";
import { DiagnosticSession } from "@/components/knowledge/DiagnosticSession";

export const metadata: Metadata = { title: "Diagnóstico — HeyStudy" };

export default async function DiagnosticSessionPage({
  params,
}: PageProps<"/dashboard/materias/[id]/diagnostico/[sessionId]">) {
  const { id: subjectId, sessionId } = await params;
  const { studentProfile } = await requireStudentProfile();

  const session = await getSessionWithProgress(studentProfile.id, sessionId);
  if (!session) notFound();

  const questions = session.questions.map((q) => ({
    id: q.id,
    prompt: q.prompt,
    difficulty: q.difficulty,
    topicName: q.knowledgeTopic.name,
    answered: Boolean(q.answer),
  }));

  return (
    <DiagnosticSession
      subjectId={subjectId}
      sessionId={session.id}
      questions={questions}
      alreadyCompleted={Boolean(session.completedAt)}
    />
  );
}
