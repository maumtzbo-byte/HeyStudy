import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { requireStudentProfile } from "@/lib/auth/getCurrentUser";
import { getSubjectSummary } from "@/services/subjects/subjectService";
import { listConversations } from "@/services/tutor/tutorService";
import { listTutorsForSubject } from "@/services/tutor/customTutorService";
import { Card, CardDescription, CardTitle } from "@/components/ui/Card";
import { StartTutorForm } from "@/components/tutor/StartTutorForm";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = { title: "Tutor IA — HeyStudy" };

export default async function TutorIndexPage({ params }: PageProps<"/dashboard/materias/[id]/tutor">) {
  const { id } = await params;
  const { studentProfile } = await requireStudentProfile();
  const subject = await getSubjectSummary(studentProfile.id, id);
  if (!subject) notFound();

  const [conversations, tutors] = await Promise.all([
    listConversations(studentProfile.id, id),
    listTutorsForSubject(studentProfile.id, id),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">Tutor IA</h1>
        <p className="text-muted">{subject.name} — pregunta lo que no entiendas, en el modo que prefieras.</p>
      </div>

      <Card className="flex flex-col gap-4">
        <CardTitle>Nueva conversación</CardTitle>
        <StartTutorForm subjectId={subject.id} tutors={tutors} />
      </Card>

      {conversations.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold text-foreground">Conversaciones anteriores</h2>
          <div className="flex flex-col divide-y divide-border overflow-hidden rounded-xl border border-border bg-surface">
            {conversations.map((c) => (
              <Link
                key={c.id}
                href={`/dashboard/materias/${subject.id}/tutor/${c.id}`}
                className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-border/20"
              >
                <div className="flex items-center gap-3">
                  {c.tutorEmoji ? (
                    <span aria-hidden className="w-4 shrink-0 text-center text-sm">
                      {c.tutorEmoji}
                    </span>
                  ) : (
                    <MessageCircle className="h-4 w-4 shrink-0 text-muted" />
                  )}
                  <div>
                    <p className="text-sm font-medium text-foreground">{c.title ?? "Conversación sin título"}</p>
                    <p className="text-xs text-muted">
                      {c.tutorName ? `${c.tutorName} · ` : ""}
                      {c.messageCount} mensaje{c.messageCount === 1 ? "" : "s"} ·{" "}
                      {formatDate(c.updatedAt, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {conversations.length === 0 && (
        <Card className="text-center">
          <CardDescription>Todavía no tienes conversaciones con el tutor en {subject.name}.</CardDescription>
        </Card>
      )}
    </div>
  );
}
