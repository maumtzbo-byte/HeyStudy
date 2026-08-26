import type { Metadata } from "next";
import { Flame, Clock, Trophy, TrendingUp, Target } from "lucide-react";
import { requireStudentProfile } from "@/lib/auth/getCurrentUser";
import { getWrappedSummary } from "@/services/reporting/wrappedService";
import { Card, CardTitle, CardDescription } from "@/components/ui/Card";
import { ButtonLink } from "@/components/ui/Button";

export const metadata: Metadata = { title: "Tu resumen — HeyStudy" };

function formatHours(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest === 0 ? `${hours} h` : `${hours} h ${rest} min`;
}

// Tono celebratorio, pensado para verse bien en una captura de pantalla —
// no es un reporte académico (sección 4.5). Sin cifras de usuarios ni de
// mercado: sólo los datos reales de este estudiante.
export default async function WrappedPage() {
  const { studentProfile } = await requireStudentProfile();
  const summary = await getWrappedSummary(studentProfile.id);

  const hasAnyData =
    summary.totalStudySessions > 0 || summary.longestStreakDays > 0 || summary.totalMinutesStudied > 0;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
          Tu resumen, {studentProfile.displayName.split(" ")[0]}
        </h1>
        <p className="text-muted">Todo lo que has hecho en HeyStudy hasta hoy.</p>
      </div>

      {!hasAnyData ? (
        <Card className="text-center">
          <CardDescription>
            Todavía no hay suficientes datos para tu resumen. Vuelve cuando lleves algunas sesiones de estudio.
          </CardDescription>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Card className="flex flex-col gap-2 bg-accent text-accent-foreground">
            <Flame aria-hidden className="h-5 w-5" strokeWidth={1.75} />
            <p className="text-3xl font-bold tabular-nums">{summary.longestStreakDays}</p>
            <p className="text-sm opacity-90">
              {summary.longestStreakDays === 1 ? "día seguido estudiando" : "días seguidos estudiando, tu mejor racha"}
            </p>
          </Card>

          <Card className="flex flex-col gap-2">
            <Clock aria-hidden className="h-5 w-5 text-accent" strokeWidth={1.75} />
            <p className="text-3xl font-bold tabular-nums text-foreground">{formatHours(summary.totalMinutesStudied)}</p>
            <p className="text-sm text-muted">estudiados en {summary.totalStudySessions} sesiones</p>
          </Card>

          {summary.hardestTopicMastered && (
            <Card className="flex flex-col gap-2 sm:col-span-2">
              <Trophy aria-hidden className="h-5 w-5 text-premium" strokeWidth={1.75} />
              <CardTitle>Lo que más te costó — y ya lo dominas</CardTitle>
              <CardDescription>
                <strong className="font-semibold text-foreground">{summary.hardestTopicMastered.topicName}</strong>{" "}
                ({summary.hardestTopicMastered.subjectName}) te tomó {summary.hardestTopicMastered.errorCount}{" "}
                {summary.hardestTopicMastered.errorCount === 1 ? "error" : "errores"} superarlo. Ahora lo dominas.
              </CardDescription>
            </Card>
          )}

          {summary.mostImprovedSubject && (
            <Card className="flex flex-col gap-2">
              <TrendingUp aria-hidden className="h-5 w-5 text-success" strokeWidth={1.75} />
              <CardTitle>{summary.mostImprovedSubject.subjectName}</CardTitle>
              <CardDescription>
                {summary.mostImprovedSubject.topicsOvercome}{" "}
                {summary.mostImprovedSubject.topicsOvercome === 1 ? "tema superado" : "temas superados"}: la materia
                donde más le diste la vuelta a lo que no sabías.
              </CardDescription>
            </Card>
          )}

          {summary.readinessAccuracy && (
            <Card className="flex flex-col gap-2">
              <Target aria-hidden className="h-5 w-5 text-accent" strokeWidth={1.75} />
              <CardTitle>Qué tan bien te conoces</CardTitle>
              <CardDescription>
                En {summary.readinessAccuracy.sampleSize}{" "}
                {summary.readinessAccuracy.sampleSize === 1 ? "examen" : "exámenes"}, predijiste en promedio{" "}
                <strong className="font-semibold text-foreground">{summary.readinessAccuracy.avgPredicted}%</strong>{" "}
                de preparación y sacaste{" "}
                <strong className="font-semibold text-foreground">{summary.readinessAccuracy.avgActual}%</strong>.
              </CardDescription>
            </Card>
          )}
        </div>
      )}

      <ButtonLink href="/dashboard" variant="secondary" className="self-start">
        Volver a tu día
      </ButtonLink>
    </div>
  );
}
