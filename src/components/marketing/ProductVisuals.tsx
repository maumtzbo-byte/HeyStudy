import { ArrowDown, Clock, Lightbulb, TrendingUp } from "lucide-react";
import { Panel } from "@/components/marketing/Frame";
import {
  KNOWLEDGE_MAP,
  DIAGNOSTIC_EXAMPLE,
  EXAM_PREP,
  PLAN_BY_SUBJECT,
  levelFromScore,
  FIXED_LEVEL_BAR_CLASS,
  FIXED_LEVEL_TEXT_CLASS,
  FIXED_LEVEL_SOFT_BG_CLASS,
} from "@/components/marketing/visualData";
import { cn } from "@/lib/utils/cn";

/* ----------------------------------------------------------------------- */
/* Un visual grande por capacidad. Antes eran micro-gráficas dentro de       */
/* tarjetas de bento, demasiado chicas para probar nada; aquí cada una es    */
/* la prueba central de su frame y se lee como una captura del producto.     */
/* ----------------------------------------------------------------------- */

function Insight({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-6 flex items-start gap-2.5 rounded-xl bg-premium-soft px-4 py-3.5">
      <Lightbulb aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-premium" strokeWidth={1.75} />
      <p className="text-sm text-foreground">{children}</p>
    </div>
  );
}

export function KnowledgeMapVisual() {
  return (
    <Panel label="Mapa de conocimiento" meta="Matemáticas">
      <div className="flex flex-col gap-5">
        {KNOWLEDGE_MAP.map((row) => {
          const level = levelFromScore(row.score);
          return (
            <div key={row.topic} className="flex items-center gap-4">
              <span className="w-24 shrink-0 text-sm font-medium text-foreground sm:w-32">{row.topic}</span>
              <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-border">
                <div
                  className={cn("h-full rounded-full", FIXED_LEVEL_BAR_CLASS[level])}
                  style={{ width: `${Math.round(row.score * 100)}%` }}
                />
              </div>
              <span
                className={cn(
                  "w-11 shrink-0 text-right text-sm font-semibold tabular-nums",
                  FIXED_LEVEL_TEXT_CLASS[level],
                )}
              >
                {Math.round(row.score * 100)}%
              </span>
            </div>
          );
        })}
      </div>
      <Insight>
        <strong>Factorización</strong> es tu punto más débil, así que lidera tu plan de hoy.
      </Insight>
    </Panel>
  );
}

export function DiagnosticVisual() {
  return (
    <Panel label="Diagnóstico" meta="Pregunta 4 de 8">
      <div className="rounded-xl border border-border bg-surface px-4 py-3.5">
        <p className="text-[11px] font-semibold tracking-wide text-subtle uppercase">Pregunta</p>
        <p className="mt-1 text-sm font-medium text-foreground">{DIAGNOSTIC_EXAMPLE.question}</p>
        <p className="mt-3.5 text-[11px] font-semibold tracking-wide text-subtle uppercase">Tu respuesta</p>
        <p className="mt-1 text-sm text-muted">{DIAGNOSTIC_EXAMPLE.studentAnswer}</p>
      </div>

      <div className="my-4 flex items-center gap-3 text-subtle">
        <span className="h-px flex-1 bg-border" />
        <ArrowDown className="h-4 w-4" strokeWidth={1.75} aria-hidden />
        <span className="h-px flex-1 bg-border" />
      </div>

      <dl className="grid grid-cols-2 gap-2.5">
        <div className="rounded-xl border border-border bg-surface px-3.5 py-3">
          <dt className="text-[11px] text-subtle">Concepto</dt>
          <dd className="mt-0.5 text-sm font-semibold text-foreground">{DIAGNOSTIC_EXAMPLE.concept}</dd>
        </div>
        <div className="rounded-xl border border-border bg-surface px-3.5 py-3">
          <dt className="text-[11px] text-subtle">Dominio</dt>
          <dd className="mt-0.5 text-sm font-semibold text-danger tabular-nums">{DIAGNOSTIC_EXAMPLE.domain}%</dd>
        </div>
        <div className="col-span-2 rounded-xl border border-border bg-surface px-3.5 py-3">
          <dt className="text-[11px] text-subtle">Patrón de error</dt>
          <dd className="mt-0.5 text-sm text-foreground">{DIAGNOSTIC_EXAMPLE.pattern}</dd>
        </div>
      </dl>

      <Insight>{DIAGNOSTIC_EXAMPLE.recommendation}</Insight>
    </Panel>
  );
}

export function ExamPrepVisual() {
  return (
    <Panel label="Preparación para examen" meta={EXAM_PREP.date}>
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-foreground">{EXAM_PREP.name}</p>
          <p className="text-xs text-subtle">Faltan 12 días</p>
        </div>
        <div className="text-right">
          <p className="font-display text-4xl leading-none font-semibold text-foreground tabular-nums">
            {EXAM_PREP.readiness}%
          </p>
          <p className="mt-1 text-[11px] text-subtle">preparación</p>
        </div>
      </div>
      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-border">
        <div className="h-full rounded-full bg-accent" style={{ width: `${EXAM_PREP.readiness}%` }} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-3.5 sm:grid-cols-2 sm:gap-x-6">
        {EXAM_PREP.topics.map((row) => {
          const level = levelFromScore(row.score);
          return (
            <div key={row.topic} className="flex items-center gap-3">
              <span className="w-20 shrink-0 text-sm text-foreground">{row.topic}</span>
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-border">
                <div
                  className={cn("h-full rounded-full", FIXED_LEVEL_BAR_CLASS[level])}
                  style={{ width: `${Math.round(row.score * 100)}%` }}
                />
              </div>
              <span className="w-9 shrink-0 text-right text-xs font-medium text-muted tabular-nums">
                {Math.round(row.score * 100)}%
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex items-start gap-2.5 rounded-xl bg-premium-soft px-4 py-3.5">
        <TrendingUp aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-premium" strokeWidth={1.75} />
        <p className="text-sm text-foreground">
          Podría subir <strong>{EXAM_PREP.potential}%</strong> si refuerzas {EXAM_PREP.focus}.
        </p>
      </div>
    </Panel>
  );
}

export function DailyPlanVisual() {
  const items = PLAN_BY_SUBJECT["Matemáticas"];
  const total = items.reduce((sum, i) => sum + i.minutes, 0);
  return (
    <Panel label="Tu plan de hoy" meta={`${total} min`}>
      <div className="flex flex-col gap-3">
        {items.map((item, i) => (
          <div key={item.title} className="flex gap-3.5 rounded-xl border border-border bg-surface p-4">
            <span
              className={cn(
                "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                FIXED_LEVEL_SOFT_BG_CLASS[item.level],
                FIXED_LEVEL_TEXT_CLASS[item.level],
              )}
            >
              {i + 1}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-3">
                <p className="text-sm font-medium text-foreground">{item.title}</p>
                <span className="flex shrink-0 items-center gap-1 text-xs text-subtle tabular-nums">
                  <Clock className="h-3 w-3" strokeWidth={2} aria-hidden />
                  {item.minutes} min
                </span>
              </div>
              {/* El "por qué" es lo que separa esto de una lista de pendientes. */}
              <p className="mt-1 text-xs text-muted">{item.reason}</p>
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}
