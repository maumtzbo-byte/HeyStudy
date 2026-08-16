import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  Sparkles,
  Network,
  Target,
  ListChecks,
  ListOrdered,
  TrendingUp,
  CheckCircle2,
  XCircle,
  ArrowDown,
  Compass,
  BookOpen,
  CalendarCheck,
} from "lucide-react";
import { getAuthUser } from "@/lib/auth/getCurrentUser";
import { ButtonLink } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";
import { DemoInteractivo } from "@/components/marketing/DemoInteractivo";
import { Constellation } from "@/components/marketing/Constellation";
import { HeroScene } from "@/components/marketing/HeroScene";
import { SiteHeader } from "@/components/marketing/SiteHeader";
import { Pricing } from "@/components/marketing/Pricing";
import { Faq } from "@/components/marketing/Faq";
import { Reveal } from "@/components/marketing/Reveal";
import {
  KNOWLEDGE_MAP,
  DIAGNOSTIC_EXAMPLE,
  EXAM_PREP,
  levelFromScore,
  FIXED_LEVEL_BAR_CLASS,
  FIXED_LEVEL_TEXT_CLASS,
} from "@/components/marketing/visualData";
import { cn } from "@/lib/utils/cn";

export const metadata: Metadata = {
  title: "HeyStudy: Sabe qué estudiar, hoy",
};

/* ---------------------------------------------------------------------- */
/* Micro-visuales reutilizables para la grilla de features                */
/* ---------------------------------------------------------------------- */

function MiniCheck() {
  return (
    <div className="mt-4 flex items-center gap-2">
      <CheckCircle2 className="h-4 w-4 shrink-0 text-success" strokeWidth={1.75} />
      <span className="text-xs text-subtle">Correcto</span>
      <XCircle className="ml-2 h-4 w-4 shrink-0 text-danger" strokeWidth={1.75} />
      <span className="text-xs text-subtle">Patrón detectado</span>
    </div>
  );
}

function MiniBars() {
  const values = [88, 54, 71];
  return (
    <div className="mt-4 flex items-end gap-1.5">
      {values.map((v, i) => (
        <span
          key={i}
          className={cn("w-2.5 rounded-full", i === 1 ? "bg-warning" : "bg-accent")}
          style={{ height: `${v * 0.28}px` }}
        />
      ))}
    </div>
  );
}

function MiniGauge() {
  return (
    <div className="mt-4 flex items-center gap-2">
      <svg viewBox="0 0 36 36" className="h-9 w-9 -rotate-90">
        <circle cx="18" cy="18" r="15.5" fill="none" stroke="var(--border)" strokeWidth="3" />
        <circle
          cx="18"
          cy="18"
          r="15.5"
          fill="none"
          stroke="var(--accent)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={`${2 * Math.PI * 15.5 * 0.78} ${2 * Math.PI * 15.5}`}
        />
      </svg>
      <span className="text-sm font-semibold text-foreground tabular-nums">78%</span>
    </div>
  );
}

function MiniChecklist() {
  return (
    <div className="mt-4 flex flex-col gap-1.5">
      {[true, false].map((done, i) => (
        <div key={i} className="flex items-center gap-2">
          <span
            className={cn(
              "flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-[4px] border",
              done ? "border-accent bg-accent" : "border-border-strong/60",
            )}
          >
            {done && <CheckCircle2 className="h-3 w-3 text-accent-foreground" strokeWidth={2.5} />}
          </span>
          <span className="h-1.5 flex-1 rounded-full bg-border" style={{ maxWidth: i === 0 ? "70%" : "50%" }} />
        </div>
      ))}
    </div>
  );
}

function MiniRank() {
  return (
    <div className="mt-4 flex flex-col gap-1.5">
      {[100, 68, 40].map((w, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="text-[10px] font-semibold text-subtle tabular-nums">{i + 1}</span>
          <span
            className="h-1.5 rounded-full bg-accent"
            style={{ width: `${w * 0.4}px`, opacity: 1 - i * 0.25 }}
          />
        </div>
      ))}
    </div>
  );
}

function MiniSparkline() {
  return (
    <svg viewBox="0 0 80 24" className="mt-4 h-6 w-20" fill="none">
      <path
        d="M2 20 L16 15 L30 17 L44 8 L58 10 L78 3"
        stroke="var(--success)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const FEATURES = [
  {
    icon: Sparkles,
    title: "Diagnóstico real",
    description: "HeyStudy no solo sabe si acertaste. Sabe qué entiendes y qué todavía no.",
    Visual: MiniCheck,
  },
  {
    icon: Network,
    title: "Mapa de conocimiento",
    description: "Ve tu nivel real en cada tema, no una lista de temas marcados como \"visto\".",
    Visual: MiniBars,
  },
  {
    icon: Target,
    title: "Preparación explicable",
    description: "Sabes si estás listo para tu examen — y exactamente por qué.",
    Visual: MiniGauge,
  },
  {
    icon: ListChecks,
    title: "Plan diario",
    description: "Abres HeyStudy y sabes por dónde empezar. Sin adivinar.",
    Visual: MiniChecklist,
  },
  {
    icon: ListOrdered,
    title: "Priorización por examen",
    description: "Lo urgente no siempre es lo importante. Ordenamos por impacto real.",
    Visual: MiniRank,
  },
  {
    icon: TrendingUp,
    title: "Seguimiento de progreso",
    description: "Mira cómo tu dominio sube, tema por tema, semana a semana.",
    Visual: MiniSparkline,
  },
];

/* ---------------------------------------------------------------------- */
/* Problema — 3 filas editoriales, no cards genéricas                     */
/* ---------------------------------------------------------------------- */

function ScatterVisual() {
  return (
    <svg viewBox="0 0 80 40" className="h-8 w-16" fill="none">
      {[
        [10, 12],
        [34, 28],
        [58, 10],
        [70, 30],
      ].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={3} fill="var(--danger)" opacity={0.55} />
      ))}
    </svg>
  );
}

function CompareVisual({ labels }: { labels: [string, string] }) {
  return (
    <div className="flex w-28 flex-col gap-2">
      <div className="flex items-center gap-2">
        <span className="w-14 shrink-0 text-[10px] text-subtle">{labels[0]}</span>
        <span className="h-1.5 w-full rounded-full bg-warning/70" />
      </div>
      <div className="flex items-center gap-2">
        <span className="w-14 shrink-0 text-[10px] text-subtle">{labels[1]}</span>
        <span className="h-1.5 w-[45%] rounded-full bg-success" />
      </div>
    </div>
  );
}

const PROBLEMS = [
  {
    title: "No sabes por dónde empezar.",
    description: "Todo el temario se siente igual de urgente, así que terminas sin empezar nada.",
    Visual: ScatterVisual,
  },
  {
    title: "Confundes reconocer un tema con dominarlo.",
    description: '"Se me hace conocido" no es lo mismo que poder resolverlo bajo presión de examen.',
    Visual: () => <CompareVisual labels={["Reconocer", "Dominar"]} />,
  },
  {
    title: "Estudias lo urgente y descuidas lo importante.",
    description: "La tarea de mañana gana siempre, aunque el examen que más pesa sea la próxima semana.",
    Visual: () => <CompareVisual labels={["Urgente", "Importante"]} />,
  },
];

/* ---------------------------------------------------------------------- */
/* Cómo funciona — recorrido de 3 pasos, visuales ligeros (chips)         */
/* ---------------------------------------------------------------------- */

function StepChips({ items }: { items: { icon: typeof BookOpen; label: string }[] }) {
  return (
    <div className="mt-5 flex flex-col gap-2">
      {items.map(({ icon: Icon, label }) => (
        <div
          key={label}
          className="flex items-center gap-2.5 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
        >
          <Icon className="h-4 w-4 shrink-0 text-accent-hover" strokeWidth={1.75} />
          {label}
        </div>
      ))}
    </div>
  );
}

const JOURNEY_STEPS = [
  {
    eyebrow: "01",
    title: "Conecta tu realidad académica",
    description: "Materias, tareas y exámenes reales — los tuyos, no un temario genérico.",
    items: [
      { icon: BookOpen, label: "Materias" },
      { icon: ListChecks, label: "Tareas" },
      { icon: CalendarCheck, label: "Exámenes" },
    ],
  },
  {
    eyebrow: "02",
    title: "Descubre lo que realmente sabes",
    description: "Preguntas adaptativas que revelan tu dominio real, no solo si acertaste.",
    items: [
      { icon: Sparkles, label: "Preguntas adaptativas" },
      { icon: Network, label: "Dominio por concepto" },
      { icon: Target, label: "Patrones de error" },
    ],
  },
  {
    eyebrow: "03",
    title: "Recibe tu plan",
    description: "Enfocado en lo que más te va a mover el puntaje, no en todo el temario.",
    items: [
      { icon: ListChecks, label: "Qué estudiar" },
      { icon: TrendingUp, label: "Cuánto tiempo" },
      { icon: Compass, label: "Por qué" },
    ],
  },
];

/* ---------------------------------------------------------------------- */

export default async function Home() {
  const user = await getAuthUser();
  if (user) redirect("/dashboard");

  return (
    <div className="flex flex-1 flex-col bg-background">
      <a
        href="#main-content"
        className="sr-only focus-visible:not-sr-only focus-visible:fixed focus-visible:top-4 focus-visible:left-4 focus-visible:z-[60] focus-visible:rounded-lg focus-visible:bg-accent focus-visible:px-4 focus-visible:py-2 focus-visible:text-sm focus-visible:font-medium focus-visible:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
      >
        Saltar al contenido
      </a>
      <SiteHeader />
      <main id="main-content" className="flex flex-1 flex-col">
        <HeroScene />

        {/* Social proof honesto — sin logos ni testimonios inventados */}
        <section className="border-y border-border bg-surface px-6 py-10 sm:px-8">
          <Reveal className="mx-auto flex w-full max-w-[1280px] flex-col items-center gap-6 text-center sm:flex-row sm:justify-between sm:text-left">
            <p className="max-w-sm text-sm font-medium text-foreground sm:text-base">
              Diseñado para estudiantes que quieren dejar de estudiar a ciegas.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-muted">
              <span className="inline-flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-accent-hover" strokeWidth={1.75} />
                Diagnóstico con IA
              </span>
              <span className="inline-flex items-center gap-2">
                <ListOrdered className="h-4 w-4 text-accent-hover" strokeWidth={1.75} />
                Prioridad clara cada día
              </span>
              <span className="inline-flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-accent-hover" strokeWidth={1.75} />
                Gratis para empezar
              </span>
            </div>
          </Reveal>
        </section>

        {/* Problema */}
        <section className="px-6 py-20 sm:px-8 sm:py-28">
          <div className="mx-auto w-full max-w-3xl">
            <Reveal>
              <p className="text-center text-xs font-semibold tracking-wide text-accent-hover uppercase">
                El problema
              </p>
              <h2 className="mt-3 text-center font-display text-3xl leading-[1.15] font-semibold tracking-tight text-foreground sm:text-4xl">
                Estudiar más no siempre significa aprender más.
              </h2>
            </Reveal>

            <div className="mt-14 flex flex-col">
              {PROBLEMS.map(({ title, description, Visual }, i) => (
                <Reveal key={title} delay={0.08 * i}>
                  <div
                    className={cn(
                      "flex flex-col items-start gap-5 border-t border-border py-8 sm:flex-row sm:items-center sm:gap-10",
                      i === PROBLEMS.length - 1 && "border-b",
                    )}
                  >
                    <span className="font-display text-4xl leading-none font-semibold text-border-strong/70 select-none sm:text-5xl">
                      0{i + 1}
                    </span>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
                      <p className="mt-1.5 text-sm text-muted">{description}</p>
                    </div>
                    <div className="shrink-0 pl-11 sm:pl-0">
                      <Visual />
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Cómo funciona */}
        <section id="como-funciona" className="scroll-mt-20 border-t border-border bg-surface px-6 py-20 sm:px-8 sm:py-28">
          <div className="mx-auto w-full max-w-[1280px]">
            <Reveal className="mx-auto max-w-2xl text-center">
              <p className="text-xs font-semibold tracking-wide text-accent-hover uppercase">Así funciona</p>
              <h2 className="mt-3 font-display text-3xl leading-[1.15] font-semibold tracking-tight text-foreground sm:text-4xl">
                De no saber por dónde empezar, a saber qué hacer hoy.
              </h2>
            </Reveal>

            <div className="relative mt-16 grid grid-cols-1 gap-10 sm:grid-cols-3 sm:gap-8">
              <div
                aria-hidden
                className="absolute top-4 right-0 left-0 hidden h-px bg-border sm:block"
                style={{ marginInline: "16.5%" }}
              />
              {JOURNEY_STEPS.map((step, i) => (
                <Reveal key={step.eyebrow} delay={0.1 * i} className="relative">
                  <div className="relative flex items-center gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-background font-display text-sm font-semibold text-accent-hover">
                      {step.eyebrow}
                    </span>
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-foreground">{step.title}</h3>
                  <p className="mt-1.5 text-sm text-muted">{step.description}</p>
                  <StepChips items={step.items} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <div id="producto" />

        {/* Mapa de conocimiento */}
        <section className="px-6 py-20 sm:px-8 sm:py-28">
          <div className="mx-auto grid w-full max-w-[1280px] grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-20">
            <Reveal>
              <p className="text-xs font-semibold tracking-wide text-accent-hover uppercase">Mapa de conocimiento</p>
              <h2 className="mt-3 font-display text-3xl leading-[1.15] font-semibold tracking-tight text-foreground sm:text-4xl">
                Entiende exactamente dónde estás.
              </h2>
              <p className="mt-4 max-w-md text-muted">
                No es una lista de temas marcados como &quot;visto&quot;. Es tu dominio real por concepto, actualizado
                cada vez que practicas.
              </p>
            </Reveal>

            <Reveal delay={0.15}>
              <div className="rounded-3xl border border-border bg-surface-elevated p-7 shadow-lg sm:p-9">
                <p className="text-xs font-semibold tracking-wide text-subtle uppercase">Matemáticas</p>
                <div className="mt-6 flex flex-col gap-5">
                  {KNOWLEDGE_MAP.map((row, i) => {
                    const level = levelFromScore(row.score);
                    return (
                      <div key={row.topic} className="flex items-center gap-4">
                        <span className="w-28 shrink-0 text-sm font-medium text-foreground">{row.topic}</span>
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-border">
                          <div
                            className={cn("h-full rounded-full transition-[width] duration-700 ease-out", FIXED_LEVEL_BAR_CLASS[level])}
                            style={{ width: `${Math.round(row.score * 100)}%`, transitionDelay: `${i * 80}ms` }}
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
                <div className="mt-7 flex items-start gap-2.5 rounded-xl bg-premium-soft px-4 py-3.5">
                  <Sparkles aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-premium" strokeWidth={1.75} />
                  <p className="text-sm text-foreground">
                    <strong>Factorización</strong> es tu punto más débil — por eso lidera tu plan de hoy.
                  </p>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* Diagnóstico con IA */}
        <section className="border-t border-border bg-surface px-6 py-20 sm:px-8 sm:py-28">
          <div className="mx-auto grid w-full max-w-[1280px] grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-20">
            <Reveal delay={0.15} className="order-2 lg:order-1">
              <div className="rounded-3xl border border-border bg-surface-elevated p-7 shadow-lg sm:p-9">
                <p className="text-xs font-semibold tracking-wide text-subtle uppercase">Pregunta</p>
                <p className="mt-2 text-sm font-medium text-foreground">{DIAGNOSTIC_EXAMPLE.question}</p>

                <p className="mt-5 text-xs font-semibold tracking-wide text-subtle uppercase">Tu respuesta</p>
                <p className="mt-2 text-sm text-muted">{DIAGNOSTIC_EXAMPLE.studentAnswer}</p>

                <div className="my-6 flex items-center gap-3 text-subtle">
                  <span className="h-px flex-1 bg-border" />
                  <ArrowDown className="h-4 w-4" strokeWidth={1.75} />
                  <span className="h-px flex-1 bg-border" />
                </div>

                <p className="text-xs font-semibold tracking-wide text-accent-hover uppercase">HeyStudy detecta</p>
                <dl className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-border bg-background px-4 py-3">
                    <dt className="text-[11px] text-subtle">Concepto</dt>
                    <dd className="mt-0.5 text-sm font-semibold text-foreground">{DIAGNOSTIC_EXAMPLE.concept}</dd>
                  </div>
                  <div className="rounded-xl border border-border bg-background px-4 py-3">
                    <dt className="text-[11px] text-subtle">Dominio</dt>
                    <dd className="mt-0.5 text-sm font-semibold text-danger tabular-nums">{DIAGNOSTIC_EXAMPLE.domain}%</dd>
                  </div>
                  <div className="rounded-xl border border-border bg-background px-4 py-3 sm:col-span-2">
                    <dt className="text-[11px] text-subtle">Patrón</dt>
                    <dd className="mt-0.5 text-sm text-foreground">{DIAGNOSTIC_EXAMPLE.pattern}</dd>
                  </div>
                </dl>

                <div className="mt-5 flex items-start gap-2.5 rounded-xl bg-premium-soft px-4 py-3.5">
                  <Sparkles aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-premium" strokeWidth={1.75} />
                  <p className="text-sm text-foreground">{DIAGNOSTIC_EXAMPLE.recommendation}</p>
                </div>
              </div>
            </Reveal>

            <Reveal className="order-1 lg:order-2">
              <p className="text-xs font-semibold tracking-wide text-accent-hover uppercase">Diagnóstico con IA</p>
              <h2 className="mt-3 font-display text-3xl leading-[1.15] font-semibold tracking-tight text-foreground sm:text-4xl">
                No solo sabe si acertaste.
                <br />
                Sabe qué entiendes y qué no.
              </h2>
              <p className="mt-4 max-w-md text-muted">
                Cada respuesta se analiza más allá de correcto o incorrecto, para encontrar el patrón de error
                específico detrás — y ajustar tu plan en consecuencia.
              </p>
            </Reveal>
          </div>
        </section>

        {/* Preparación para examen */}
        <section className="px-6 py-20 sm:px-8 sm:py-28">
          <div className="mx-auto grid w-full max-w-[1280px] grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-20">
            <Reveal>
              <p className="text-xs font-semibold tracking-wide text-accent-hover uppercase">Preparación para examen</p>
              <h2 className="mt-3 font-display text-3xl leading-[1.15] font-semibold tracking-tight text-foreground sm:text-4xl">
                ¿Estás preparado? Ahora lo sabes con certeza.
              </h2>
              <p className="mt-4 max-w-md text-muted">
                Un puntaje de preparación que puedes entender: qué temas pesan más en tu examen y cuánto podría subir
                tu preparación si refuerzas los correctos.
              </p>
            </Reveal>

            <Reveal delay={0.15}>
              <div className="rounded-3xl border border-border bg-surface-elevated p-7 shadow-lg sm:p-9">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{EXAM_PREP.name}</p>
                    <p className="text-xs text-subtle">{EXAM_PREP.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-display text-3xl font-semibold text-foreground tabular-nums">
                      {EXAM_PREP.readiness}%
                    </p>
                    <p className="text-[11px] text-subtle">preparación</p>
                  </div>
                </div>
                <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-border">
                  <div className="h-full rounded-full bg-accent" style={{ width: `${EXAM_PREP.readiness}%` }} />
                </div>

                <div className="mt-7 flex flex-col gap-4">
                  {EXAM_PREP.topics.map((row) => {
                    const level = levelFromScore(row.score);
                    return (
                      <div key={row.topic} className="flex items-center gap-4">
                        <span className="w-24 shrink-0 text-sm text-foreground">{row.topic}</span>
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-border">
                          <div
                            className={cn("h-full rounded-full", FIXED_LEVEL_BAR_CLASS[level])}
                            style={{ width: `${Math.round(row.score * 100)}%` }}
                          />
                        </div>
                        <span className="w-10 shrink-0 text-right text-xs font-medium text-muted tabular-nums">
                          {Math.round(row.score * 100)}%
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-7 flex items-start gap-2.5 rounded-xl bg-premium-soft px-4 py-3.5">
                  <TrendingUp aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-premium" strokeWidth={1.75} />
                  <p className="text-sm text-foreground">
                    Tu preparación podría subir <strong>{EXAM_PREP.potential}%</strong> si refuerzas{" "}
                    {EXAM_PREP.focus}.
                  </p>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* Plan diario — demo interactiva */}
        <section id="demo" className="scroll-mt-20 border-t border-border bg-surface px-6 py-20 sm:px-8 sm:py-28">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold tracking-wide text-accent-hover uppercase">Plan diario</p>
            <h2 className="mt-3 font-display text-3xl leading-[1.15] font-semibold tracking-tight text-foreground sm:text-4xl">
              Hoy sabes exactamente qué hacer.
            </h2>
            <p className="mt-4 text-muted">Elige una materia y mira un ejemplo de tu plan, sin registrarte.</p>
          </Reveal>
          <Reveal delay={0.15} className="mt-12">
            <DemoInteractivo />
          </Reveal>
        </section>

        {/* Qué más incluye */}
        <section className="px-6 py-20 sm:px-8 sm:py-28">
          <div className="mx-auto w-full max-w-[1280px]">
            <Reveal className="mx-auto max-w-2xl text-center">
              <p className="text-xs font-semibold tracking-wide text-accent-hover uppercase">Qué más incluye</p>
              <h2 className="mt-3 font-display text-3xl leading-[1.15] font-semibold tracking-tight text-foreground sm:text-4xl">
                Todo lo que necesitas, nada de lo que sobra.
              </h2>
            </Reveal>
            <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map((feature, i) => (
                <Reveal key={feature.title} delay={0.06 * i}>
                  <div className="h-full rounded-2xl border border-border bg-surface p-6 shadow-sm transition-shadow hover:shadow-md">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-soft text-accent-hover">
                      <feature.icon aria-hidden className="h-5 w-5" strokeWidth={1.75} />
                    </span>
                    <h3 className="mt-4 text-base font-semibold text-foreground">{feature.title}</h3>
                    <p className="mt-1.5 text-sm text-muted">{feature.description}</p>
                    <feature.Visual />
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Precios */}
        <section id="precios" className="relative scroll-mt-20 overflow-hidden border-t border-border bg-surface px-6 py-20 sm:px-8 sm:py-28">
          <Reveal className="relative mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl leading-[1.15] font-semibold tracking-tight text-foreground sm:text-4xl">
              Empieza gratis, escala cuando lo necesites
            </h2>
            <p className="mt-4 text-muted">Sin tarjeta para probar el diagnóstico y el plan de estudio.</p>
          </Reveal>
          <Reveal delay={0.1} className="relative mt-12">
            <Pricing />
          </Reveal>
        </section>

        {/* Preguntas frecuentes */}
        <section className="px-6 py-20 sm:px-8 sm:py-28">
          <Reveal className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl leading-[1.15] font-semibold tracking-tight text-foreground sm:text-4xl">
              Preguntas frecuentes
            </h2>
          </Reveal>
          <Reveal delay={0.1} className="mt-12">
            <Faq />
          </Reveal>
        </section>

        {/* CTA final */}
        <section className="relative overflow-hidden bg-accent px-6 py-24 text-center sm:px-8 sm:py-32">
          <Constellation className="pointer-events-none absolute inset-0 h-full w-full text-white opacity-[0.12]" />
          <Reveal className="relative mx-auto max-w-xl">
            <h2 className="font-display text-3xl leading-[1.1] font-semibold tracking-tight text-white sm:text-5xl">
              Deja de adivinar qué estudiar.
            </h2>
            <p className="mt-4 text-lg text-white/80">Tu próximo examen ya tiene un plan.</p>
            <ButtonLink
              href="/registro"
              size="lg"
              className="mt-9 bg-white text-accent-hover shadow-none hover:-translate-y-px hover:bg-white/90"
            >
              Crear mi plan gratis
              <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
            </ButtonLink>
            <p className="mt-6 text-sm text-white/70">Gratis para empezar · Sin tarjeta</p>
          </Reveal>
        </section>
      </main>

      <Footer />
    </div>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border px-6 py-16 sm:px-8">
      <div className="mx-auto grid w-full max-w-[1280px] grid-cols-2 gap-10 sm:grid-cols-4">
        <div className="col-span-2 flex flex-col gap-3 sm:col-span-1">
          <Logo />
          <p className="max-w-[220px] text-sm text-muted">
            Diseñado para estudiantes que quieren estudiar mejor, no estudiar más.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <p className="text-xs font-semibold tracking-wide text-subtle uppercase">Producto</p>
          <a href="#producto" className="text-sm text-muted hover:text-foreground">
            Diagnóstico
          </a>
          <a href="#demo" className="text-sm text-muted hover:text-foreground">
            Plan de estudio
          </a>
          <a href="#producto" className="text-sm text-muted hover:text-foreground">
            Mapa de conocimiento
          </a>
        </div>

        <div className="flex flex-col gap-3">
          <p className="text-xs font-semibold tracking-wide text-subtle uppercase">Recursos</p>
          <a href="#como-funciona" className="text-sm text-muted hover:text-foreground">
            Cómo funciona
          </a>
          <a href="#precios" className="text-sm text-muted hover:text-foreground">
            Precios
          </a>
          <Link href="/login" className="text-sm text-muted hover:text-foreground">
            Iniciar sesión
          </Link>
        </div>

        <div className="flex flex-col gap-3">
          <p className="text-xs font-semibold tracking-wide text-subtle uppercase">Legal</p>
          <Link href="/privacidad" className="text-sm text-muted hover:text-foreground">
            Privacidad
          </Link>
          <Link href="/terminos" className="text-sm text-muted hover:text-foreground">
            Términos
          </Link>
        </div>
      </div>

      <div className="mx-auto mt-12 w-full max-w-[1280px] border-t border-border pt-6">
        <p className="text-sm text-subtle">© {new Date().getFullYear()} HeyStudy</p>
      </div>
    </footer>
  );
}
