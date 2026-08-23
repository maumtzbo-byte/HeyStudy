import type { Metadata } from "next";
import Link from "next/link";
import { requireStudentProfile } from "@/lib/auth/getCurrentUser";
import { getExamTopicSetup, calculateExamReadiness } from "@/services/exams/readinessService";
import { Card, CardTitle, CardDescription } from "@/components/ui/Card";
import { ReadinessBadge } from "@/components/exams/ReadinessBadge";
import { ExamTopicSetupForm } from "@/components/exams/ExamTopicSetupForm";
import { RecordGradeForm } from "@/components/exams/RecordGradeForm";

export const metadata: Metadata = { title: "Preparación del examen — HeyStudy" };

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("es-MX", { day: "numeric", month: "short", year: "numeric" }).format(date);
}

export default async function ExamReadinessPage({
  params,
}: PageProps<"/dashboard/materias/[id]/examenes/[examId]">) {
  const { id: subjectId, examId } = await params;
  const { studentProfile } = await requireStudentProfile();

  const { exam, subjectTopics, linkedTopicIds } = await getExamTopicSetup(studentProfile.id, examId);

  const readiness = linkedTopicIds.size > 0 ? await calculateExamReadiness(studentProfile.id, examId) : null;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">{exam.title}</h1>
        <p className="text-muted">
          {exam.subject.name} · {formatDate(exam.examDate)}
        </p>
      </div>

      {subjectTopics.length === 0 ? (
        <Card className="flex flex-col items-center gap-3 text-center">
          <CardTitle>Primero necesitas temas en esta materia</CardTitle>
          <CardDescription>
            Genera el mapa de conocimiento de {exam.subject.name} para poder calcular tu preparación.
          </CardDescription>
          <Link href={`/dashboard/materias/${subjectId}/diagnostico`} className="text-sm font-medium text-accent">
            Ir al mapa de conocimiento
          </Link>
        </Card>
      ) : (
        <>
          <Card className="flex flex-col gap-4">
            <CardTitle>¿Qué temas cubre este examen?</CardTitle>
            <CardDescription>Elige los temas que entran. Puedes ajustarlo cuando quieras.</CardDescription>
            <ExamTopicSetupForm
              subjectId={subjectId}
              examId={examId}
              topics={subjectTopics.map((t) => ({ id: t.id, name: t.name }))}
              linkedTopicIds={linkedTopicIds}
            />
          </Card>

          {readiness && (
            <Card className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <CardTitle>Tu preparación</CardTitle>
                <ReadinessBadge status={readiness.status} score={readiness.score} />
              </div>
              <CardDescription>
                {readiness.daysUntilExam > 0
                  ? `Faltan ${readiness.daysUntilExam} días.`
                  : readiness.daysUntilExam === 0
                    ? "Es hoy."
                    : "Ya pasó."}{" "}
                El puntaje es el promedio ponderado del dominio que tienes en cada tema del examen.
              </CardDescription>

              <div className="flex flex-col divide-y divide-border overflow-hidden rounded-xl border border-border">
                {readiness.breakdown.map((topic) => (
                  <div key={topic.topicId} className="flex items-center justify-between gap-4 px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">{topic.topicName}</p>
                      {!topic.hasEvidence && <p className="text-xs text-muted">Sin diagnosticar todavía</p>}
                    </div>
                    <div className="flex items-center gap-3 text-right">
                      <span className="text-xs text-muted">Pesa {topic.contributionPercent}%</span>
                      <span className="w-12 text-sm font-semibold text-foreground">{topic.masteryPercent}%</span>
                    </div>
                  </div>
                ))}
              </div>

              <Link
                href={`/dashboard/materias/${subjectId}/diagnostico`}
                className="text-sm font-medium text-accent"
              >
                Diagnosticar temas débiles →
              </Link>
            </Card>
          )}

          <Card className="flex flex-col gap-4">
            <div>
              <CardTitle>¿Ya presentaste el examen?</CardTitle>
              <CardDescription>Registra tu calificación real para ver qué tan bien predijo HeyStudy.</CardDescription>
            </div>
            <RecordGradeForm subjectId={subjectId} examId={examId} />
          </Card>
        </>
      )}
    </div>
  );
}
