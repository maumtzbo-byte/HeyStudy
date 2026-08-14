import type { Metadata } from "next";
import Link from "next/link";
import { requireStudentProfile } from "@/lib/auth/getCurrentUser";
import { listSubjects } from "@/services/subjects/subjectService";
import { listUpcomingAssignments } from "@/services/assignments/assignmentService";
import { listUpcomingExams } from "@/services/exams/examService";
import { Card, CardDescription, CardTitle } from "@/components/ui/Card";

export const metadata: Metadata = { title: "Hoy — HeyStudy" };

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("es-MX", { day: "numeric", month: "short" }).format(date);
}

function daysUntil(date: Date) {
  const diff = Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  if (diff <= 0) return "hoy";
  if (diff === 1) return "mañana";
  return `en ${diff} días`;
}

export default async function DashboardHomePage() {
  const { studentProfile } = await requireStudentProfile();

  const [subjects, assignments, exams] = await Promise.all([
    listSubjects(studentProfile.id),
    listUpcomingAssignments(studentProfile.id, 5),
    listUpcomingExams(studentProfile.id, 3),
  ]);

  const todoItems = [
    ...assignments.map((a) => ({
      id: a.id,
      title: a.title,
      subjectName: a.subject.name,
      subjectColor: a.subject.color,
      date: a.dueDate,
      kind: "Tarea" as const,
    })),
    ...exams.map((e) => ({
      id: e.id,
      title: e.title,
      subjectName: e.subject.name,
      subjectColor: e.subject.color,
      date: e.examDate,
      kind: "Examen" as const,
    })),
  ].sort((a, b) => a.date.getTime() - b.date.getTime());

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Hola, {studentProfile.displayName.split(" ")[0]}
        </h1>
        <p className="text-muted">Esto es lo que tienes y lo que sigue.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardDescription>Materias</CardDescription>
          <p className="mt-1 text-3xl font-semibold text-foreground">{subjects.length}</p>
        </Card>
        <Card>
          <CardDescription>Tareas pendientes</CardDescription>
          <p className="mt-1 text-3xl font-semibold text-foreground">{assignments.length}</p>
        </Card>
        <Card>
          <CardDescription>Exámenes próximos</CardDescription>
          <p className="mt-1 text-3xl font-semibold text-foreground">{exams.length}</p>
        </Card>
      </div>

      <Card className="bg-accent/5 border-accent/20">
        <CardTitle>Tu nivel de preparación</CardTitle>
        <CardDescription className="mt-1">
          El diagnóstico de conocimiento y el puntaje de preparación por examen llegan en la próxima etapa. Por
          ahora, esto es lo que tienes cargado.
        </CardDescription>
      </Card>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold text-foreground">Qué hacer ahora</h2>
        {todoItems.length === 0 ? (
          <Card className="text-center">
            <CardDescription>
              No tienes tareas ni exámenes próximos. Ve a{" "}
              <Link href="/dashboard/materias" className="font-medium text-accent">
                Materias
              </Link>{" "}
              para agregar algo.
            </CardDescription>
          </Card>
        ) : (
          <div className="flex flex-col divide-y divide-border overflow-hidden rounded-xl border border-border bg-surface">
            {todoItems.map((item) => (
              <div key={`${item.kind}-${item.id}`} className="flex items-center justify-between gap-4 px-5 py-4">
                <div className="flex items-center gap-3">
                  <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: item.subjectColor }} />
                  <div>
                    <p className="text-sm font-medium text-foreground">{item.title}</p>
                    <p className="text-xs text-muted">
                      {item.kind} · {item.subjectName}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-foreground">{formatDate(item.date)}</p>
                  <p className="text-xs text-muted">{daysUntil(item.date)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
