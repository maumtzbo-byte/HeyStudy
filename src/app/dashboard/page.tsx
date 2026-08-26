import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Flame, Target, ListChecks, BookOpen } from "lucide-react";
import { requireStudentProfile } from "@/lib/auth/getCurrentUser";
import { listSubjects } from "@/services/subjects/subjectService";
import { listUpcomingAssignments } from "@/services/assignments/assignmentService";
import { listUpcomingExams } from "@/services/exams/examService";
import { calculateExamReadiness } from "@/services/exams/readinessService";
import { getTodayPlan } from "@/services/studyplan/studyPlanService";
import { getVideoRecommendationsForTopic, type VideoRecommendation } from "@/services/video/videoService";
import { getStudyDates, currentStreakDays } from "@/services/reporting/streakService";
import { getPlanUsageSummary } from "@/services/usage/planLimits";
import { todayInTimezone } from "@/lib/utils/dates";
import { formatDate } from "@/lib/format";
import { Card, CardDescription, CardTitle } from "@/components/ui/Card";
import { ReadinessBadge } from "@/components/exams/ReadinessBadge";
import { GeneratePlanForm } from "@/components/dashboard/GeneratePlanForm";
import { StudyPlanList } from "@/components/dashboard/StudyPlanList";
import { PlanUsageCard } from "@/components/dashboard/PlanUsageCard";
import { StartDiagnosticButton } from "@/components/knowledge/StartDiagnosticButton";

export const metadata: Metadata = { title: "Hoy — HeyStudy" };

function daysUntilLabel(diff: number) {
  if (diff <= 0) return "hoy";
  if (diff === 1) return "mañana";
  return `en ${diff} días`;
}

function daysUntil(date: Date) {
  return daysUntilLabel(Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
}

export default async function DashboardHomePage() {
  const { user, studentProfile } = await requireStudentProfile();

  const [subjects, assignments, exams, todayPlan, studyDates, planUsage] = await Promise.all([
    listSubjects(studentProfile.id),
    listUpcomingAssignments(studentProfile.id, 5),
    listUpcomingExams(studentProfile.id, 3),
    getTodayPlan(studentProfile.id),
    getStudyDates(studentProfile.id),
    getPlanUsageSummary(user.id),
  ]);

  const streak = currentStreakDays(studyDates, todayInTimezone(studentProfile.timezone));

  const examReadiness = await Promise.all(
    exams.map((exam) => calculateExamReadiness(studentProfile.id, exam.id)),
  );

  // Videos sólo si el estudiante dijo que así prefiere estudiar (onboarding
  // o /dashboard/perfil). Se limita a los primeros temas del plan —ya vienen
  // ordenados por debilidad/urgencia— para no gastar de más la cuota diaria
  // de la YouTube Data API en un solo estudiante.
  const MAX_TOPICS_WITH_VIDEOS = 3;
  const videosByItemId = new Map<string, VideoRecommendation[]>();
  if (todayPlan && studentProfile.preferredStudyMethod !== "LECTURA" && studentProfile.preferredStudyMethod !== "PRACTICA") {
    const subjectNameById = new Map(subjects.map((s) => [s.id, s.name]));
    const itemsWithTopic = todayPlan.items
      .filter((item) => item.knowledgeTopicId && item.knowledgeTopic)
      .slice(0, MAX_TOPICS_WITH_VIDEOS);

    const results = await Promise.all(
      itemsWithTopic.map((item) =>
        getVideoRecommendationsForTopic({
          knowledgeTopicId: item.knowledgeTopicId!,
          topicName: item.knowledgeTopic!.name,
          subjectName: subjectNameById.get(item.knowledgeTopic!.subjectId) ?? "",
        }),
      ),
    );
    itemsWithTopic.forEach((item, i) => videosByItemId.set(item.id, results[i]));
  }

  const todayCompletedMinutes =
    todayPlan?.items.filter((item) => item.completed).reduce((sum, item) => sum + item.minutes, 0) ?? 0;
  const todayTotalMinutes = todayPlan?.items.reduce((sum, item) => sum + item.minutes, 0) ?? 0;
  const todayCompletedCount = todayPlan?.items.filter((item) => item.completed).length ?? 0;
  const todayProgressPct = todayTotalMinutes > 0 ? Math.round((todayCompletedMinutes / todayTotalMinutes) * 100) : 0;

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
        <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
          Hola, {studentProfile.displayName.split(" ")[0]}
        </h1>
        <p className="text-muted">Esto es lo que tienes y lo que sigue.</p>
      </div>

      {/* Bento real: dos tarjetas grandes de color sólido (sin degradados,
          sin fotos) arriba, tres tarjetas chicas con ícono abajo. Sustituye
          por completo a la línea de texto que había antes — ahora Materias/
          Tareas/Exámenes viven aquí, no en dos lugares distintos. */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="flex flex-col justify-between border-transparent bg-accent text-accent-foreground sm:col-span-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-accent-foreground/80">Tu plan de hoy</span>
            <ListChecks className="h-4 w-4 text-accent-foreground/70" strokeWidth={2} />
          </div>
          {todayPlan && todayPlan.items.length > 0 ? (
            <>
              <p className="mt-3 flex items-baseline gap-1.5">
                <span className="text-4xl font-bold tabular-nums">{todayCompletedMinutes}</span>
                <span className="text-lg text-accent-foreground/70">/{todayTotalMinutes} min</span>
              </p>
              <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/20">
                <div className="h-full rounded-full bg-white" style={{ width: `${todayProgressPct}%` }} />
              </div>
              <p className="mt-2 text-xs text-accent-foreground/70">
                {todayCompletedCount}/{todayPlan.items.length} temas completados
              </p>
            </>
          ) : (
            <p className="mt-3 text-sm text-accent-foreground/80">Genera tu plan para ver tu avance de hoy.</p>
          )}
        </Card>
        <Card className="flex flex-col justify-between border-transparent bg-warning text-white">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-white/80">Racha</span>
            <Flame className="h-4 w-4 text-white/80" strokeWidth={2} />
          </div>
          <p className="mt-3 flex items-baseline gap-1.5">
            <span className="text-4xl font-bold tabular-nums">{streak}</span>
            <span className="text-sm text-white/70">{streak === 1 ? "día" : "días"}</span>
          </p>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent">
            <BookOpen className="h-5 w-5" strokeWidth={1.75} />
          </span>
          <div>
            <p className="text-2xl font-bold tabular-nums text-foreground">{subjects.length}</p>
            <p className="text-xs text-muted">Materias</p>
          </div>
        </Card>
        <Card className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent">
            <ListChecks className="h-5 w-5" strokeWidth={1.75} />
          </span>
          <div>
            <p className="text-2xl font-bold tabular-nums text-foreground">{assignments.length}</p>
            <p className="text-xs text-muted">Tareas pendientes</p>
          </div>
        </Card>
        <Card className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent">
            <Target className="h-5 w-5" strokeWidth={1.75} />
          </span>
          <div>
            <p className="text-2xl font-bold tabular-nums text-foreground">{exams.length}</p>
            <p className="text-xs text-muted">Exámenes próximos</p>
          </div>
        </Card>
      </div>

      {planUsage.plan === "FREE" && (
        <PlanUsageCard diagnosticsUsed={planUsage.diagnosticsUsed} diagnosticsLimit={planUsage.diagnosticsLimit} />
      )}

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold text-foreground">Qué tan preparado estás</h2>
        {examReadiness.length === 0 ? (
          <Card className="flex items-center gap-3">
            <Target className="h-5 w-5 shrink-0 text-subtle" strokeWidth={1.75} />
            <CardDescription>No tienes exámenes próximos registrados.</CardDescription>
          </Card>
        ) : (
          <div className="flex flex-col divide-y divide-border overflow-hidden rounded-xl border border-border bg-surface">
            {examReadiness.map((readiness) => {
              const subjectId = exams.find((e) => e.id === readiness.examId)?.subjectId;
              const weakestTopicId = readiness.breakdown[0]?.topicId;
              return (
                <div
                  key={readiness.examId}
                  className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-border/20"
                >
                  <Link href={`/dashboard/materias/${subjectId}/examenes/${readiness.examId}`} className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground">{readiness.examTitle}</p>
                    <p className="text-xs text-muted">
                      {readiness.subjectName} · {daysUntilLabel(readiness.daysUntilExam)}
                    </p>
                  </Link>
                  <div className="flex shrink-0 items-center gap-3">
                    {readiness.status !== "listo" && subjectId && weakestTopicId && (
                      <StartDiagnosticButton subjectId={subjectId} topicId={weakestTopicId} />
                    )}
                    <ReadinessBadge status={readiness.status} score={readiness.score} />
                  </div>
                </div>
              );
            })}
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
                videos: videosByItemId.get(item.id) ?? [],
              }))}
            />
            <GeneratePlanForm regenerate />
          </Card>
        ) : (
          <Card className="flex flex-col items-center gap-3 text-center sm:flex-row sm:items-center sm:text-left">
            <Image
              src="/mascot/mascota-lectura.png"
              alt=""
              aria-hidden
              width={139}
              height={111}
              className="h-20 w-auto shrink-0"
            />
            <div className="flex flex-col gap-3">
              <div>
                <CardTitle>Todavía no tienes un plan para hoy</CardTitle>
                <CardDescription>
                  Con lo que hayas diagnosticado, armamos qué estudiar hoy y por qué. Si no has diagnosticado
                  ningún tema todavía, hazlo primero desde el mapa de conocimiento de una materia.
                </CardDescription>
              </div>
              <GeneratePlanForm />
            </div>
          </Card>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold text-foreground">Tareas y exámenes próximos</h2>
        {todoItems.length === 0 ? (
          <Card className="flex items-center gap-3">
            <ListChecks className="h-5 w-5 shrink-0 text-subtle" strokeWidth={1.75} />
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
                  <p className="text-sm font-medium text-foreground">
                    {formatDate(item.date, { day: "numeric", month: "short" })}
                  </p>
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
