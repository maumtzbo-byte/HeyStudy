import type { Metadata } from "next";
import Link from "next/link";
import { requireStudentProfile } from "@/lib/auth/getCurrentUser";
import { listSubjects } from "@/services/subjects/subjectService";
import { listUpcomingAssignments } from "@/services/assignments/assignmentService";
import { listUpcomingExams } from "@/services/exams/examService";
import { calculateExamReadiness } from "@/services/exams/readinessService";
import { getTodayPlan } from "@/services/studyplan/studyPlanService";
import { Card, CardDescription, CardTitle } from "@/components/ui/Card";
import { ReadinessBadge } from "@/components/exams/ReadinessBadge";
import { GeneratePlanForm } from "@/components/dashboard/GeneratePlanForm";
import { StudyPlanList } from "@/components/dashboard/StudyPlanList";

export const metadata: Metadata = { title: "Hoy — HeyStudy" };

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("es-MX", { day: "numeric", month: "short" }).format(date);
}

function daysUntilLabel(diff: number) {
  if (diff <= 0) return "hoy";
  if (diff === 1) return "mañana";
  return `en ${diff} días`;
}

function daysUntil(date: Date) {
  return daysUntilLabel(Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
}

export default async function DashboardHomePage() {
  const { studentProfile } = await requireStudentProfile();

  const [subjects, assignments, exams, todayPlan] = await Promise.all([
    listSubjects(studentProfile.id),
    listUpcomingAssignments(studentProfile.id, 5),
    listUpcomingExams(studentProfile.id, 3),
    getTodayPlan(studentProfile.id),
  ]);

  const examReadiness = await Promise.all(
    exams.map((exam) => calculateExamReadiness(studentProfile.id, exam.id)),
  );

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

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold text-foreground">Qué tan preparado estás</h2>
        {examReadiness.length === 0 ? (
          <Card className="text-center">
            <CardDescription>No tienes exámenes próximos registrados.</CardDescription>
          </Card>
        ) : (
          <div className="flex flex-col divide-y divide-border overflow-hidden rounded-xl border border-border bg-surface">
            {examReadiness.map((readiness) => (
              <Link
                key={readiness.examId}
                href={`/dashboard/materias/${exams.find((e) => e.id === readiness.examId)?.subjectId}/examenes/${readiness.examId}`}
                className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-border/20"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">{readiness.examTitle}</p>
                  <p className="text-xs text-muted">
                    {readiness.subjectName} · {daysUntilLabel(readiness.daysUntilExam)}
                  </p>
                </div>
                <ReadinessBadge status={readiness.status} score={readiness.score} />
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold text-foreground">Tu plan de hoy</h2>
        {todayPlan && todayPlan.items.length > 0 ? (
          <Card className="flex flex-col gap-4">
            <StudyPlanList
              items={todayPlan.items.map((item) => ({
                id: item.id,
                title: item.title,
                reason: item.reason,
                minutes: item.minutes,
                completed: item.completed,
              }))}
            />
            <GeneratePlanForm regenerate />
          </Card>
        ) : (
          <Card className="flex flex-col gap-3">
            <CardTitle>Todavía no tienes un plan para hoy</CardTitle>
            <CardDescription>
              Con lo que hayas diagnosticado, armamos qué estudiar hoy y por qué. Si no has diagnosticado ningún
              tema todavía, hazlo primero desde el mapa de conocimiento de una materia.
            </CardDescription>
            <GeneratePlanForm />
          </Card>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold text-foreground">Tareas y exámenes próximos</h2>
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
