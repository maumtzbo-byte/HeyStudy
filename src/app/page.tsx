import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  ArrowDown,
  Sparkles,
  Network,
  Target,
  ListChecks,
  ListOrdered,
  TrendingUp,
  CheckCircle2,
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
import { Blob, Sparkle } from "@/components/marketing/Decor";
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
/* Problema — 3 filas editoriales                                          */
/* ---------------------------------------------------------------------- */

function ScatterVisual() {
  return (
    <svg viewBox="0 0 80 40" className="h-8 w-16" fill="none" aria-hidden>
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
    <div className="flex w-28 flex-col gap-2" aria-hidden>
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
/* Cómo funciona — recorrido de 3 pasos                                    */
/* ---------------------------------------------------------------------- */

function StepChips({ items }: { items: { icon: typeof BookOpen; label: string }[] }) {
  return (
    <div className="mt-5 flex flex-wrap gap-2">
      {items.map(({ icon: Icon, label }) => (
        <div
          key={label}
          className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
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
/* Bento del producto — micro-visuales                                     */
/* ---------------------------------------------------------------------- */

function BentoCard({
  className,
  eyebrow,
  title,
  children,
}: {
  className?: string;
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex h-full flex-col rounded-3xl border border-border bg-surface p-6 shadow-sm transition-shadow hover:shadow-md sm:p-7",
        className,
      )}
    >
      <p className="text-xs font-semibold tracking-wide text-accent-hover uppercase">{eyebrow}</p>
      <h3 className="mt-2 font-display text-xl font-semibold tracking-tight text-foreground sm:text-2xl">{title}</h3>
      {children}
    </div>
  );
}

function MiniChecklist() {
  return (
    <div className="mt-5 flex flex-col gap-2" aria-hidden>
      {[
        { w: "72%", done: true },
        { w: "54%", done: false },
      ].map((row, i) => (
        <div key={i} className="flex items-center gap-2">
          <span
            className={cn(
              "flex h-4 w-4 shrink-0 items-center justify-center rounded-[5px] border",
              row.done ? "border-accent bg-accent" : "border-border-strong/60",
            )}
          >
            {row.done && <CheckCircle2 className="h-3 w-3 text-accent-foreground" strokeWidth={2.5} />}
          </span>
          <span className="h-1.5 rounded-full bg-border" style={{ width: row.w }} />
        </div>
      ))}
    </div>
  );
}

function MiniRank() {
  return (
    <div className="mt-5 flex flex-col gap-2" aria-hidden>
      {[100, 68, 42].map((w, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="text-[10px] font-semibold text-subtle tabular-nums">{i + 1}</span>
          <span className="h-1.5 rounded-full bg-accent" style={{ width: `${w * 0.55}px`, opacity: 1 - i * 0.28 }} />
        </div>
      ))}
    </div>
  );
}

function MiniSparkline() {
  return (
    <svg viewBox="0 0 90 26" className="mt-5 h-7 w-24" fill="none" aria-hidden>
      <path
        d="M2 22 L18 16 L34 18 L50 8 L66 11 L88 3"
        stroke="var(--success)"
        strokeWidth="2.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="88" cy="3" r="3" fill="var(--success)" />
    </svg>
  );
}

const BENTO_EXTRAS = [
  {
    icon: ListChecks,
    eyebrow: "Plan diario",
    title: "Sabes por dónde empezar",
    description: "Abres HeyStudy y ya está decidido. Sin adivinar.",
    Visual: MiniChecklist,
  },
  {
    icon: ListOrdered,
    eyebrow: "Priorización",
    title: "Ordenado por impacto",
    description: "Lo urgente no siempre es lo importante.",
    Visual: MiniRank,
  },
  {
    icon: TrendingUp,
    eyebrow: "Progreso",
    title: "Ves cómo subes",
    description: "Tu dominio, tema por tema, semana a semana.",
    Visual: MiniSparkline,
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

        {/* Franja de confianza — copy honesto, sin logos ni cifras inventadas */}
        <section className="border-y border-border bg-surface px-6 py-8 sm:px-8">
          <Reveal className="mx-auto flex w-full max-w-[1280px] flex-col items-center gap-5 text-center sm:flex-row sm:justify-between sm:text-left">
            <p className="max-w-sm text-sm font-medium text-foreground">
              Diseñado para estudiantes que quieren dejar de estudiar a ciegas.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-muted">
              <span className="inline-flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-accent-hover" strokeWidth={1.75} />
                Sin tarjeta
              </span>
              <span className="inline-flex items-center gap-2">
                <ListOrdered className="h-4 w-4 text-accent-hover" strokeWidth={1.75} />
                Listo en minutos
              </span>
              <span className="inline-flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-accent-hover" strokeWidth={1.75} />
                Tus datos son tuyos
              </span>
            </div>
          </Reveal>
        </section>

        {/* Problema */}
        <section className="relative overflow-hidden px-6 py-20 sm:px-8 sm:py-24">
          <Blob tone="accent" className="top-0 left-1/2 h-96 w-96 -translate-x-[85%]" />
          <div className="relative mx-auto w-full max-w-3xl">
            <Reveal className="relative">
              <Sparkle tone="premium" className="absolute -top-2 left-1/2 hidden h-4 w-4 -translate-x-24 sm:block" />
              <p className="text-center text-xs font-semibold tracking-wide text-accent-hover uppercase">
                El problema
              </p>
              <h2 className="mt-3 text-center font-display text-3xl leading-[1.15] font-semibold tracking-tight text-foreground sm:text-4xl">
                Estudiar más no siempre significa aprender más.
              </h2>
            </Reveal>

            <div className="mt-12 flex flex-col">
              {PROBLEMS.map(({ title, description, Visual }, i) => (
                <Reveal key={title} delay={0.07 * i}>
                  <div
                    className={cn(
                      "flex flex-col items-start gap-5 border-t border-border py-7 sm:flex-row sm:items-center sm:gap-10",
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
        <section
          id="como-funciona"
          className="relative scroll-mt-20 overflow-hidden border-t border-border bg-surface px-6 py-20 sm:px-8 sm:py-24"
        >
          <Blob tone="premium" className="top-1/2 -right-24 h-80 w-80 -translate-y-1/2" />
          <div className="relative mx-auto w-full max-w-[1280px]">
            <Reveal className="relative mx-auto max-w-2xl text-center">
              <p className="text-xs font-semibold tracking-wide text-accent-hover uppercase">Así funciona</p>
              <h2 className="mt-3 font-display text-3xl leading-[1.15] font-semibold tracking-tight text-foreground sm:text-4xl">
                De no saber por dónde empezar, a saber qué hacer hoy.
              </h2>
            </Reveal>

            <div className="relative mt-14 grid grid-cols-1 gap-10 sm:grid-cols-3 sm:gap-8">
              <div
                aria-hidden
                className="absolute top-4 right-0 left-0 hidden h-px bg-border sm:block"
                style={{ marginInline: "16.5%" }}
              />
              {JOURNEY_STEPS.map((step, i) => (
                <Reveal key={step.eyebrow} delay={0.09 * i} className="relative">
                  <span className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-background font-display text-sm font-semibold text-accent-hover">
                    {step.eyebrow}
                  </span>
                  <h3 className="mt-4 text-lg font-semibold text-foreground">{step.title}</h3>
                  <p className="mt-1.5 text-sm text-muted">{step.description}</p>
                  <StepChips items={step.items} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Producto — un solo bento en vez de tres secciones separadas */}
        <section id="producto" className="relative scroll-mt-20 overflow-hidden px-6 py-20 sm:px-8 sm:py-24">
          <Blob tone="accent" className="top-1/3 -left-24 h-96 w-96" />
          <Blob tone="premium" className="right-0 bottom-0 h-80 w-80" />
          <div className="relative mx-auto w-full max-w-[1280px]">
            <Reveal className="relative mx-auto max-w-2xl text-center">
              <Sparkle tone="accent" className="absolute -top-2 right-1/2 hidden h-4 w-4 translate-x-28 sm:block" />
              <p className="text-xs font-semibold tracking-wide text-accent-hover uppercase">El producto</p>
              <h2 className="mt-3 font-display text-3xl leading-[1.15] font-semibold tracking-tight text-foreground sm:text-4xl">
                Todo lo que HeyStudy entiende de ti.
              </h2>
            </Reveal>

            <div className="mt-14 grid grid-cols-1 gap-5 lg:grid-cols-3">
              {/* Mapa de conocimiento — ancho */}
              <Reveal className="lg:col-span-2">
                <BentoCard eyebrow="Mapa de conocimiento" title="Entiende exactamente dónde estás.">
                  <p className="mt-2 text-sm text-muted">
                    No es una lista de temas marcados como &quot;visto&quot;. Es tu dominio real por concepto.
                  </p>
                  <div className="mt-6 flex flex-col gap-4">
                    {KNOWLEDGE_MAP.map((row) => {
                      const level = levelFromScore(row.score);
                      return (
                        <div key={row.topic} className="flex items-center gap-4">
                          <span className="w-24 shrink-0 text-sm font-medium text-foreground sm:w-28">{row.topic}</span>
                          <div className="h-2 flex-1 overflow-hidden rounded-full bg-border">
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
                  <div className="mt-6 flex items-start gap-2.5 rounded-xl bg-premium-soft px-4 py-3.5">
                    <Sparkles aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-premium" strokeWidth={1.75} />
                    <p className="text-sm text-foreground">
                      <strong>Factorización</strong> es tu punto más débil — por eso lidera tu plan de hoy.
                    </p>
                  </div>
                </BentoCard>
              </Reveal>

              {/* Diagnóstico — alto */}
              <Reveal delay={0.08} className="lg:row-span-2">
                <BentoCard eyebrow="Diagnóstico con IA" title="No solo sabe si acertaste.">
                  <p className="mt-2 text-sm text-muted">
                    Analiza el patrón de error detrás de tu respuesta y ajusta tu plan.
                  </p>

                  <div className="mt-6 rounded-xl border border-border bg-background px-4 py-3">
                    <p className="text-[11px] font-semibold tracking-wide text-subtle uppercase">Pregunta</p>
                    <p className="mt-1 text-sm font-medium text-foreground">{DIAGNOSTIC_EXAMPLE.question}</p>
                    <p className="mt-3 text-[11px] font-semibold tracking-wide text-subtle uppercase">Tu respuesta</p>
                    <p className="mt-1 text-sm text-muted">{DIAGNOSTIC_EXAMPLE.studentAnswer}</p>
                  </div>

                  <div className="my-4 flex items-center gap-3 text-subtle">
                    <span className="h-px flex-1 bg-border" />
                    <ArrowDown className="h-4 w-4" strokeWidth={1.75} />
                    <span className="h-px flex-1 bg-border" />
                  </div>

                  <dl className="flex flex-col gap-3">
                    <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background px-4 py-3">
                      <dt className="text-[11px] text-subtle">Concepto</dt>
                      <dd className="text-sm font-semibold text-foreground">{DIAGNOSTIC_EXAMPLE.concept}</dd>
                    </div>
                    <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background px-4 py-3">
                      <dt className="text-[11px] text-subtle">Dominio</dt>
                      <dd className="text-sm font-semibold text-danger tabular-nums">{DIAGNOSTIC_EXAMPLE.domain}%</dd>
                    </div>
                    <div className="rounded-xl border border-border bg-background px-4 py-3">
                      <dt className="text-[11px] text-subtle">Patrón</dt>
                      <dd className="mt-0.5 text-sm text-foreground">{DIAGNOSTIC_EXAMPLE.pattern}</dd>
                    </div>
                  </dl>

                  <div className="mt-4 flex items-start gap-2.5 rounded-xl bg-premium-soft px-4 py-3.5">
                    <Sparkles aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-premium" strokeWidth={1.75} />
                    <p className="text-sm text-foreground">{DIAGNOSTIC_EXAMPLE.recommendation}</p>
                  </div>
                </BentoCard>
              </Reveal>

              {/* Preparación para examen — ancho */}
              <Reveal delay={0.05} className="lg:col-span-2">
                <BentoCard eyebrow="Preparación para examen" title="¿Estás listo? Ahora lo sabes.">
                  <div className="mt-5 flex items-center justify-between gap-4">
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

                  <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-x-6">
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
                </BentoCard>
              </Reveal>

              {/* Tres tarjetas chicas cierran el bento */}
              {BENTO_EXTRAS.map(({ icon: Icon, eyebrow, title, description, Visual }, i) => (
                <Reveal key={eyebrow} delay={0.05 * i}>
                  <div className="flex h-full flex-col rounded-3xl border border-border bg-surface p-6 shadow-sm transition-shadow hover:shadow-md">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-soft text-accent-hover">
                      <Icon aria-hidden className="h-5 w-5" strokeWidth={1.75} />
                    </span>
                    <p className="mt-4 text-xs font-semibold tracking-wide text-accent-hover uppercase">{eyebrow}</p>
                    <h3 className="mt-1.5 text-base font-semibold text-foreground">{title}</h3>
                    <p className="mt-1.5 text-sm text-muted">{description}</p>
                    <Visual />
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Demo interactiva */}
        <section
          id="demo"
          className="relative scroll-mt-20 overflow-hidden border-t border-border bg-surface px-6 py-20 sm:px-8 sm:py-24"
        >
          <Blob tone="premium" className="bottom-0 left-1/2 h-80 w-80 -translate-x-[15%]" />
          <Reveal className="relative mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold tracking-wide text-accent-hover uppercase">Pruébalo</p>
            <h2 className="mt-3 font-display text-3xl leading-[1.15] font-semibold tracking-tight text-foreground sm:text-4xl">
              Mira tu plan antes de registrarte.
            </h2>
            <p className="mt-4 text-muted">Elige una materia y verás cómo se arma un día de estudio real.</p>
          </Reveal>
          <Reveal delay={0.12} className="mt-10">
            <DemoInteractivo />
          </Reveal>
        </section>

        {/* Precios */}
        <section id="precios" className="relative scroll-mt-20 overflow-hidden px-6 py-20 sm:px-8 sm:py-24">
          <Blob tone="premium" className="top-1/2 right-[10%] h-72 w-72 -translate-y-1/2" />
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
        <section className="border-t border-border bg-surface px-6 py-20 sm:px-8 sm:py-24">
          <Reveal className="relative mx-auto max-w-2xl text-center">
            <Sparkle tone="accent" className="absolute -top-2 left-1/2 hidden h-3.5 w-3.5 -translate-x-28 sm:block" />
            <h2 className="font-display text-3xl leading-[1.15] font-semibold tracking-tight text-foreground sm:text-4xl">
              Preguntas frecuentes
            </h2>
          </Reveal>
          <Reveal delay={0.1} className="mt-10">
            <Faq />
          </Reveal>
        </section>

        {/* CTA final */}
        <section className="relative overflow-hidden bg-accent px-6 py-24 text-center sm:px-8 sm:py-28">
          <Constellation className="pointer-events-none absolute inset-0 h-full w-full text-white opacity-[0.12]" />
          <Sparkle className="absolute top-[20%] left-[16%] hidden h-5 w-5 text-white/50 sm:block" />
          <Sparkle className="absolute right-[14%] bottom-[22%] hidden h-4 w-4 text-white/40 md:block" />
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
    <footer className="border-t border-border px-6 py-14 sm:px-8">
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

      <div className="mx-auto mt-10 w-full max-w-[1280px] border-t border-border pt-6">
        <p className="text-sm text-subtle">© {new Date().getFullYear()} HeyStudy</p>
      </div>
    </footer>
  );
}
