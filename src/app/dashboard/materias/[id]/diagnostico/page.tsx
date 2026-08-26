import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireStudentProfile } from "@/lib/auth/getCurrentUser";
import { getSubjectSummary } from "@/services/subjects/subjectService";
import { listTopicsWithMastery } from "@/services/knowledge/topicService";
import { Clock } from "lucide-react";
import { Card, CardDescription, CardTitle } from "@/components/ui/Card";
import { MasteryBadge } from "@/components/knowledge/MasteryBadge";
import { GenerateTopicsButton } from "@/components/knowledge/GenerateTopicsButton";
import { StartDiagnosticButton } from "@/components/knowledge/StartDiagnosticButton";
import { StandardizedTopicsPicker } from "@/components/knowledge/StandardizedTopicsPicker";

export const metadata: Metadata = { title: "Mapa de conocimiento — HeyStudy" };

export default async function DiagnosticoPage({ params }: PageProps<"/dashboard/materias/[id]/diagnostico">) {
  const { id } = await params;
  const { studentProfile } = await requireStudentProfile();
  const subject = await getSubjectSummary(studentProfile.id, id);
  if (!subject) notFound();

  const topics = await listTopicsWithMastery(studentProfile.id, id);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">Mapa de conocimiento</h1>
        <p className="text-muted">{subject.name} — elige un tema para diagnosticar qué tanto lo dominas.</p>
      </div>

      {topics.length === 0 ? (
        <Card className="flex flex-col items-center gap-3 text-center">
          <CardTitle>Aún no hay temas para esta materia</CardTitle>
          <CardDescription>Generamos los temas centrales de {subject.name} con IA, en segundos.</CardDescription>
          <GenerateTopicsButton subjectId={subject.id} />
        </Card>
      ) : null}

      <StandardizedTopicsPicker subjectId={subject.id} />

      {topics.length > 0 && (
        <div className="flex flex-col divide-y divide-border overflow-hidden rounded-xl border border-border bg-surface">
          {topics.map((topic) => (
            <div key={topic.id} className="flex items-center justify-between gap-4 px-5 py-4">
              <div>
                <p className="text-sm font-medium text-foreground">{topic.name}</p>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <MasteryBadge score={topic.score} confidence={topic.confidence} />
                  {topic.reviewOverdue && (
                    <span className="flex items-center gap-1 rounded-full bg-warning/10 px-2.5 py-1 text-xs font-medium text-warning">
                      <Clock className="h-3 w-3" />
                      Repaso vencido
                    </span>
                  )}
                </div>
                {topic.topErrorPattern && (
                  <p className="mt-1.5 max-w-md text-xs text-muted">Suele fallar en: {topic.topErrorPattern}</p>
                )}
              </div>
              <StartDiagnosticButton subjectId={subject.id} topicId={topic.id} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
