import type { Metadata } from "next";
import Link from "next/link";
import { Flame, Target, ListChecks, BookOpen } from "lucide-react";
import { requireStudentProfile } from "@/lib/auth/getCurrentUser";
import { prisma } from "@/lib/prisma/client";
import { listSubjects } from "@/services/subjects/subjectService";
import { listUpcomingAssignments } from "@/services/assignments/assignmentService";
import { listUpcomingExams } from "@/services/exams/examService";
import { calculateExamReadiness } from "@/services/exams/readinessService";
import { getTodayPlan } from "@/services/studyplan/studyPlanService";
import { getVideoRecommendationsForTopic, type VideoRecommendation } from "@/services/video/videoService";
import type { ReadinessStatus } from "@/services/exams/readinessService";
import { getStudyDates, currentStreakDays } from "@/services/reporting/streakService";
import { getPlanUsageSummary } from "@/services/usage/planLimits";
import { todayInTimezone } from "@/lib/utils/dates";
import { cn } from "@/lib/utils/cn";
import { formatDate } from "@/lib/format";
import { Card, CardDescription, CardTitle } from "@/components/ui/Card";
import { ButtonLink } from "@/components/ui/Button";
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

// Mismo mapeo de 4 estados que ReadinessBadge, promovido de pill chico a
// color de identidad de la tarjeta completa.
const READINESS_CARD_META: Record<
  ReadinessStatus,
  { label: string; borderClassName: string; textClassName: string; barClassName: string }
> = {
  sin_temas: { label: "Sin configurar", borderClassName: "border-l-border", textClassName: "text-subtle", barClassName: "bg-subtle" },
  en_riesgo: { label: "En riesgo", borderClassName: "border-l-danger", textClassName: "text-danger", barClassName: "bg-danger" },
  en_progreso: { label: "En progreso", borderClassName: "border-l-warning", textClassName: "text-warning", barClassName: "bg-warning" },
  listo: { label: "Listo", borderClassName: "border-l-success", textClassName: "text-success", barClassName: "bg-success" },
};

export default async function DashboardHomePage() {
  const { user, studentProfile } = await requireStudentProfile();

  const [subjects, assignments, exams, todayPlan, studyDates, planUsage, diagnosedTopicCount] = await Promise.all([
    listSubjects(studentProfile.id),
    listUpcomingAssignments(studentProfile.id, 5),
    listUpcomingExams(studentProfile.id, 3),
    getTodayPlan(studentProfile.id),
    getStudyDates(studentProfile.id),
    getPlanUsageSummary(user.id),
    // generateTodayPlan devuelve null si no hay ni una fila de mastery
    // (studyPlanService.ts), y esas filas sólo nacen al RESPONDER una
    // pregunta de diagnóstico. Sin este conteo, al estudiante nuevo se le
    // mostraba el formulario de "Generar mi plan", que para él siempre
    // falla. No sirve usar planUsage.diagnosticsUsed como atajo: se puede
    // empezar un diagnóstico y abandonarlo sin responder, y ahí el
    // contador va en 1 pero el plan sigue sin poder generarse.
    prisma.knowledgeMastery.count({ where: { studentProfileId: studentProfile.id } }),
  ]);

  const hasDiagnosed = diagnosedTopicCount > 0;
  // A dónde mandarlo a dar su primer paso: la materia de admisión sembrada
  // en el onboarding si existe, si no la primera materia que tenga.
  const firstStepSubject = subjects.find((s) => s.name.startsWith("Admisión —")) ?? subjects[0];
  const firstStepHref = firstStepSubject
    ? `/dashboard/materias/${firstStepSubject.id}/diagnostico`
    : "/dashboard/materias";

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
  const todayProgressPct = todayTotalMinutes > 0 ? Math.round((todayCompletedMinutes / todayTotalMinutes) * 100) : 0;

  // Últimos 7 días de racha, para la tira de puntos junto al número — mismo
  // criterio de "día activo" que currentStreakDays (día con algo completado).
  const today = todayInTimezone(studentProfile.timezone);
  const activeDayNumbers = new Set(studyDates.map((d) => Math.floor(d.getTime() / 86400000)));
  const todayDayNumber = Math.floor(today.getTime() / 86400000);
  const WEEKDAY_LETTERS = ["D", "L", "M", "M", "J", "V", "S"];
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const dayNumber = todayDayNumber - (6 - i);
    return { active: activeDayNumbers.has(dayNumber), letter: WEEKDAY_LETTERS[new Date(dayNumber * 86400000).getUTCDay()] };
  });

  // Para la tira de tarjetas destacadas: mismo criterio de "día" que
  // last7Days, sobre las tareas ya obtenidas (sin fetch nuevo).
  const dueTodayCount = assignments.filter(
    (a) => Math.floor(a.dueDate.getTime() / 86400000) === todayDayNumber,
  ).length;

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

      <Card className="flex flex-col gap-4 bg-accent-soft">
        <div>
          <p className="font-display text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            Cada minuto cuenta.
          </p>
          <p className="mt-1 text-sm text-muted">
            Organiza tus materias, cierra tus pendientes y llega listo a tus exámenes.
          </p>
        </div>
        <ButtonLink href="#plan-de-hoy" variant="primary" className="w-fit rounded-full">
          Ver mi plan de hoy
        </ButtonLink>
      </Card>

      {/* Tira horizontal de tarjetas de color sólido — vista rápida sin
          scrollear a las secciones de abajo, mismos datos ya obtenidos
          arriba (sin fetches nuevos). */}
      <div className="-mx-1 flex snap-x snap-mandatory gap-3 overflow-x-auto px-1 pb-1">
        {dueTodayCount > 0 && (
          <Card className="flex w-36 shrink-0 snap-start flex-col justify-between gap-4 border-transparent bg-danger p-4 text-white">
            <ListChecks className="h-5 w-5 text-white" strokeWidth={2} />
            <div>
              <p className="text-3xl font-bold tabular-nums">{dueTodayCount}</p>
              <p className="text-xs text-white/80">{dueTodayCount === 1 ? "tarea vence hoy" : "tareas vencen hoy"}</p>
            </div>
          </Card>
        )}
        <Card className="flex w-36 shrink-0 snap-start flex-col justify-between gap-4 border-transparent bg-warning p-4 text-white">
          <Flame className="h-5 w-5 text-white" strokeWidth={2} />
          <div>
            <p className="text-3xl font-bold tabular-nums">{streak}</p>
            <p className="text-xs text-white/80">{streak === 1 ? "día de racha" : "días de racha"}</p>
          </div>
        </Card>
        {exams.length > 0 && (
          <Card className="flex w-36 shrink-0 snap-start flex-col justify-between gap-4 border-transparent bg-accent p-4 text-accent-foreground">
            <Target className="h-5 w-5 text-accent-foreground" strokeWidth={2} />
            <div>
              <p className="line-clamp-1 text-sm font-semibold">{exams[0].subject.name}</p>
              <p className="text-xs text-accent-foreground/80">{daysUntil(exams[0].examDate)}</p>
            </div>
          </Card>
        )}
      </div>

      {/* Misma secuencia de formas que la referencia: rectángulo grande
          (arriba) → rectángulo más chico, ancho completo → dos cuadrados
          lado a lado → rectángulo ancho completo. Sustituye a la línea de
          texto que había antes — Materias/Tareas/Exámenes viven aquí. */}
      <Card className="border-transparent bg-warning text-white">
        <div className="flex items-center justify-between">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
            <Flame className="h-5 w-5 text-white" strokeWidth={2} />
          </span>
          <span className="text-sm font-medium text-white/80">Racha</span>
        </div>
        <p className="mt-4 flex items-baseline gap-2">
          <span className="text-6xl font-bold tabular-nums">{streak}</span>
          <span className="text-base text-white/70">{streak === 1 ? "día" : "días"}</span>
        </p>
        <div className="mt-4 flex gap-1.5">
          {last7Days.map((day, i) => (
            <span
              key={i}
              aria-hidden
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold",
                day.active ? "bg-white text-warning" : "bg-white/15 text-white/50",
              )}
            >
              {day.letter}
            </span>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-5">
        <Card className="flex aspect-[4/5] flex-col justify-between border-transparent bg-accent text-accent-foreground">
          <div>
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
              <ListChecks className="h-5 w-5 text-white" strokeWidth={2} />
            </span>
            <p className="mt-3 text-sm font-medium text-accent-foreground/80">Hoy</p>
            <p className="text-xs text-accent-foreground/60">Tu progreso del día</p>
          </div>
          {todayPlan && todayPlan.items.length > 0 ? (
            <div>
              <p className="flex items-baseline gap-1.5">
                <span className="text-5xl font-bold tabular-nums">{todayCompletedMinutes}</span>
                <span className="text-sm text-accent-foreground/70">/{todayTotalMinutes} min</span>
              </p>
              <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/20">
                <div className="h-full rounded-full bg-white" style={{ width: `${todayProgressPct}%` }} />
              </div>
            </div>
          ) : (
            <p className="text-sm text-accent-foreground/80">Genera tu plan para ver tu avance.</p>
          )}
        </Card>
        <Card className="flex aspect-[4/5] flex-col justify-between">
          <div>
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-soft text-accent">
              <BookOpen className="h-5 w-5" strokeWidth={2} />
            </span>
            <p className="mt-3 text-sm font-medium text-muted">Materias</p>
            <p className="text-xs text-subtle">Todo lo que cursas</p>
          </div>
          <p className="text-5xl font-bold tabular-nums text-foreground">{subjects.length}</p>
        </Card>
      </div>

      <Card className="grid grid-cols-2 divide-x divide-border p-0">
        <div className="flex flex-col gap-1 px-5 py-4">
          <span className="flex items-center gap-1.5 text-xs font-medium text-muted">
            <ListChecks className="h-3.5 w-3.5 text-accent" strokeWidth={2} />
            Tareas pendientes
          </span>
          <p className="text-3xl font-bold tabular-nums text-foreground">{assignments.length}</p>
        </div>
        <div className="flex flex-col gap-1 px-5 py-4">
          <span className="flex items-center gap-1.5 text-xs font-medium text-muted">
            <Target className="h-3.5 w-3.5 text-accent" strokeWidth={2} />
            Exámenes próximos
          </span>
          <p className="text-3xl font-bold tabular-nums text-foreground">{exams.length}</p>
        </div>
      </Card>

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
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {examReadiness.map((readiness) => {
              const subjectId = exams.find((e) => e.id === readiness.examId)?.subjectId;
              const weakestTopicId = readiness.breakdown[0]?.topicId;
              const meta = READINESS_CARD_META[readiness.status];
              const pct = readiness.score ?? 0;
              return (
                <Card key={readiness.examId} className={cn("flex flex-col gap-3 border-l-4", meta.borderClassName)}>
                  <Link href={`/dashboard/materias/${subjectId}/examenes/${readiness.examId}`} className="min-w-0">
                    <p className="text-sm font-medium text-foreground">{readiness.examTitle}</p>
                    <p className="text-xs text-muted">
                      {readiness.subjectName} · {daysUntilLabel(readiness.daysUntilExam)}
                    </p>
                  </Link>
                  <div className="flex items-end justify-between gap-3">
                    <p className={cn("text-4xl font-bold tabular-nums", meta.textClassName)}>
                      {readiness.score !== null ? `${pct}%` : "—"}
                    </p>
                    <div className="flex shrink-0 items-center gap-3">
                      {readiness.status !== "listo" && subjectId && weakestTopicId && (
                        <StartDiagnosticButton subjectId={subjectId} topicId={weakestTopicId} />
                      )}
                      <span className={cn("text-xs font-medium", meta.textClassName)}>{meta.label}</span>
                    </div>
                  </div>
                  {readiness.score !== null && (
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-border">
                      <div className={cn("h-full rounded-full", meta.barClassName)} style={{ width: `${pct}%` }} />
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </section>

      <section id="plan-de-hoy" className="flex flex-col gap-3 scroll-mt-6">
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
        ) : hasDiagnosed ? (
          <Card className="flex flex-col gap-3">
            <CardTitle>Todavía no tienes un plan para hoy</CardTitle>
            <CardDescription>
              Con lo que ya diagnosticaste armamos qué estudiar hoy y por qué.
            </CardDescription>
            <GeneratePlanForm />
          </Card>
        ) : (
          <Card className="flex flex-col gap-3 border-transparent bg-accent-soft">
            <CardTitle>Empieza por un diagnóstico</CardTitle>
            <CardDescription>
              Tu plan se arma a partir de lo que te falta, así que primero necesitamos ver qué tan bien conoces
              un tema. Son unas cuantas preguntas y con eso ya podemos priorizar tu día.
            </CardDescription>
            <ButtonLink href={firstStepHref} variant="primary" className="w-fit">
              {firstStepSubject ? "Hacer mi primer diagnóstico" : "Agregar mi primera materia"}
            </ButtonLink>
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
                  <span
                    className="shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold"
                    style={{ backgroundColor: `${item.subjectColor}1a`, color: item.subjectColor }}
                  >
                    {item.kind}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-foreground">{item.title}</p>
                    <p className="text-xs text-muted">{item.subjectName}</p>
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
