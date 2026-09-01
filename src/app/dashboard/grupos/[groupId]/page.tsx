import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Trophy, Clock, CheckCircle2, Share2 } from "lucide-react";
import { requireStudentProfile } from "@/lib/auth/getCurrentUser";
import { getStudyGroupDetail } from "@/services/groups/studyGroupService";
import { UserFacingError } from "@/lib/actions/result";
import { ShareTodayPlanButton, UnshareButton, LeaveGroupButton } from "@/components/groups/GroupActions";
import { Card, CardDescription } from "@/components/ui/Card";
import { ButtonLink } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = { title: "Grupo de estudio — HeyStudy" };

const MEDAL = ["🥇", "🥈", "🥉"];

function formatMinutes(total: number) {
  if (total < 60) return `${total} min`;
  const hours = Math.floor(total / 60);
  const minutes = total % 60;
  return minutes === 0 ? `${hours} h` : `${hours} h ${minutes} min`;
}

export default async function GroupDetailPage({ params }: PageProps<"/dashboard/grupos/[groupId]">) {
  const { groupId } = await params;
  const { studentProfile } = await requireStudentProfile();

  // El servicio lanza si no eres miembro; para el usuario eso es un 404, no un
  // "existe pero no puedes verlo".
  let group;
  try {
    group = await getStudyGroupDetail(studentProfile.id, groupId);
  } catch (err) {
    if (err instanceof UserFacingError) notFound();
    throw err;
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <Link
          href="/dashboard/grupos"
          className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
          Grupos
        </Link>
        <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">{group.name}</h1>
            <p className="mt-1 text-sm text-muted">
              {group.memberCount} {group.memberCount === 1 ? "miembro" : "miembros"} · Código{" "}
              <code className="rounded bg-accent-soft px-1.5 py-0.5 font-mono font-semibold tracking-widest text-accent-hover">
                {group.joinCode}
              </code>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <ButtonLink href="/dashboard/drops" variant="secondary" size="sm">
              Ver Drops
            </ButtonLink>
            <LeaveGroupButton groupId={group.id} isOwner={group.myRole === "OWNER"} />
          </div>
        </div>
      </div>

      {/* Ranking */}
      <section>
        <div className="mb-4 flex items-center gap-2">
          <Trophy className="h-5 w-5 text-premium" strokeWidth={1.75} />
          <h2 className="text-base font-semibold text-foreground">Ranking de los últimos 7 días</h2>
        </div>
        <Card className="overflow-hidden p-0">
          {group.leaderboard.map((row, i) => (
            <div
              key={row.studentProfileId}
              className={cn(
                "flex items-center gap-4 border-b border-border px-5 py-4 last:border-b-0",
                row.isMe && "bg-accent-soft/50",
              )}
            >
              <span className="w-8 shrink-0 text-center text-lg font-semibold text-subtle tabular-nums">
                {i < 3 ? <span aria-label={`Lugar ${i + 1}`}>{MEDAL[i]}</span> : i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">
                  {row.displayName}
                  {row.isMe && <span className="ml-2 text-xs font-normal text-accent-hover">tú</span>}
                </p>
                <p className="mt-0.5 flex flex-wrap items-center gap-x-4 gap-y-0.5 text-xs text-muted">
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3 w-3" strokeWidth={2} />
                    {formatMinutes(row.minutesCompleted)}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" strokeWidth={2} />
                    {Math.round(row.completionRate * 100)}% del plan
                  </span>
                  <span>
                    {row.activeDays} {row.activeDays === 1 ? "día activo" : "días activos"}
                  </span>
                </p>
              </div>
              <div className="w-24 shrink-0">
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-border">
                  <div
                    className="h-full rounded-full bg-accent"
                    style={{ width: `${Math.round(row.completionRate * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </Card>
        <p className="mt-2 text-xs text-subtle">
          El ranking usa minutos de tu plan marcados como completados. Nadie ve tus diagnósticos ni tu mapa de
          conocimiento.
        </p>
      </section>

      {/* Compartir plan */}
      <Card as="section">
        <h2 className="mb-1 text-base font-semibold text-foreground">Tu plan de hoy</h2>
        <p className="mb-4 text-sm text-muted">
          Compartirlo es opcional. Solo se ven los temas y los minutos, no el porqué de cada uno.
        </p>
        <ShareTodayPlanButton
          groupId={group.id}
          alreadyShared={group.myTodayPlanShared}
          hasPlan={group.myTodayPlanId !== null}
        />
      </Card>

      {/* Planes compartidos */}
      <section>
        <h2 className="mb-4 text-base font-semibold text-foreground">Planes compartidos</h2>
        {group.sharedPlans.length === 0 ? (
          <Card className="flex items-center gap-3">
            <Share2 className="h-5 w-5 shrink-0 text-subtle" strokeWidth={1.75} />
            <CardDescription>Nadie ha compartido un plan todavía. Sé el primero.</CardDescription>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {group.sharedPlans.map((plan) => (
              <Card key={plan.id} as="article">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {plan.sharedByName}
                      {plan.isMine && <span className="ml-2 text-xs font-normal text-accent-hover">tú</span>}
                    </p>
                    <p className="text-xs text-subtle">
                      {formatDate(plan.forDate, { day: "numeric", month: "long", timeZone: "UTC" })} ·{" "}
                      {formatMinutes(plan.totalMinutes)} ·{" "}
                      {plan.completedCount}/{plan.items.length} hechos
                    </p>
                  </div>
                  {plan.isMine && <UnshareButton groupId={group.id} sharedPlanId={plan.id} />}
                </div>
                <ul className="mt-4 flex flex-col gap-2">
                  {plan.items.map((item) => (
                    <li key={item.id} className="flex items-center gap-2.5 text-sm">
                      <span
                        aria-hidden
                        className={cn(
                          "flex h-4 w-4 shrink-0 items-center justify-center rounded-[5px] border",
                          item.completed ? "border-accent bg-accent" : "border-border-strong/60",
                        )}
                      >
                        {item.completed && (
                          <CheckCircle2 className="h-3 w-3 text-accent-foreground" strokeWidth={2.5} />
                        )}
                      </span>
                      <span className={cn("flex-1 text-foreground", item.completed && "text-muted line-through")}>
                        {item.title}
                      </span>
                      <span className="shrink-0 text-xs text-muted tabular-nums">{item.minutes} min</span>
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
