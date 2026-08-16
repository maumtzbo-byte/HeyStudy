import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight } from "lucide-react";
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
import { Comparison } from "@/components/marketing/Comparison";
import { Frame, FrameHeading, SplitFrame } from "@/components/marketing/Frame";
import {
  KnowledgeMapVisual,
  DiagnosticVisual,
  ExamPrepVisual,
  DailyPlanVisual,
} from "@/components/marketing/ProductVisuals";
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
/* Cómo funciona — 4 pasos                                                 */
/* ---------------------------------------------------------------------- */

const JOURNEY_STEPS = [
  {
    n: "01",
    title: "Carga tus materias",
    description: "Tus materias reales, con sus tareas y las fechas de tus exámenes. No un temario genérico.",
  },
  {
    n: "02",
    title: "Haz un diagnóstico",
    description: "Preguntas que se ajustan a tus respuestas para encontrar dónde se rompe tu entendimiento.",
  },
  {
    n: "03",
    title: "Recibe tu plan de hoy",
    description: "Qué estudiar, cuánto tiempo y por qué ese tema antes que los demás.",
  },
  {
    n: "04",
    title: "Mañana se reordena",
    description: "Lo que dominaste baja de prioridad y lo que falló sube. El plan sigue tu progreso.",
  },
];

/* ---------------------------------------------------------------------- */
/* Alcance — nube de materias                                              */
/* ---------------------------------------------------------------------- */

const SUBJECTS = [
  "Matemáticas", "Cálculo", "Álgebra", "Física", "Química", "Biología",
  "Anatomía", "Historia", "Geografía", "Literatura", "Filosofía", "Inglés",
  "Economía", "Contabilidad", "Derecho", "Estadística", "Programación", "Psicología",
];

/* ---------------------------------------------------------------------- */
/* Para quién es                                                           */
/* ---------------------------------------------------------------------- */

const AUDIENCES = [
  {
    title: "Preparatoria",
    description:
      "Seis o siete materias a la vez, exámenes encimados y cero claridad sobre cuál atender primero.",
  },
  {
    title: "Universidad",
    description:
      "Materias que se construyen una sobre otra, donde un hueco de hace dos meses te tumba el parcial de hoy.",
  },
  {
    title: "Exámenes de admisión",
    description:
      "Un temario enorme y meses por delante: necesitas saber qué mueve tu puntaje y qué ya no.",
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
        <section className="border-y border-border bg-surface px-6 py-7 sm:px-8">
          <Reveal className="mx-auto flex w-full max-w-[1280px] flex-col gap-3 sm:flex-row sm:items-baseline sm:justify-between">
            <p className="text-sm font-medium text-foreground">
              Diseñado para estudiantes que quieren dejar de estudiar a ciegas.
            </p>
            <p className="text-sm text-muted">Sin tarjeta · Listo en minutos · Tus datos son tuyos</p>
          </Reveal>
        </section>

        {/* Frame — Problema */}
        <section className="relative overflow-hidden px-6 py-14 sm:px-8 sm:py-24">
          <div className="relative mx-auto w-full max-w-3xl">
            <FrameHeading
              eyebrow="El problema"
              title="Estudiar más no siempre significa aprender más."
            />
            <div className="mt-8 flex flex-col sm:mt-12">
              {PROBLEMS.map(({ title, description, Visual }, i) => (
                <Reveal key={title} delay={0.07 * i}>
                  <div
                    className={cn(
                      "flex items-start gap-4 border-t border-border py-6 sm:items-center sm:gap-10 sm:py-7",
                      i === PROBLEMS.length - 1 && "border-b",
                    )}
                  >
                    <span className="w-7 shrink-0 font-display text-xl leading-none font-semibold text-border-strong/70 select-none sm:w-auto sm:text-5xl">
                      0{i + 1}
                    </span>
                    <div className="flex-1">
                      <h3 className="text-base font-semibold text-foreground sm:text-lg">{title}</h3>
                      <p className="mt-1.5 text-sm text-muted">{description}</p>
                    </div>
                    {/* El micro-visual no vale su altura en un telefono. */}
                    <div className="hidden shrink-0 sm:block">
                      <Visual />
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Frame — Cómo funciona, 4 pasos */}
        <Frame id="como-funciona" tone="raised">
          <FrameHeading
            eyebrow="Cómo funciona"
            title="De no saber por dónde empezar, a saber qué hacer hoy."
            lead="Cuatro pasos. El primero te toma unos minutos; los demás pasan solos."
          />
          <ol className="mt-10 grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-border bg-border sm:mt-14 sm:grid-cols-2 lg:grid-cols-4">
            {JOURNEY_STEPS.map((step, i) => (
              <Reveal key={step.n} delay={0.07 * i} className="bg-background">
                <li className="flex h-full flex-col p-6 sm:p-7">
                  <span className="font-display text-4xl leading-none font-semibold text-border-strong/70 select-none">
                    {step.n}
                  </span>
                  <h3 className="mt-5 text-base font-semibold text-foreground">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{step.description}</p>
                </li>
              </Reveal>
            ))}
          </ol>
        </Frame>

        {/* Frame — Diagnóstico */}
        <Frame id="producto">
          <SplitFrame
            eyebrow="Diagnóstico"
            title="No solo sabe si acertaste. Sabe por qué fallaste."
            lead="Una respuesta incorrecta no dice mucho. El patrón detrás de ella lo dice todo."
            bullets={[
              "Las preguntas se ajustan según respondes, para llegar antes al hueco real.",
              "Cada error se clasifica por concepto, no por pregunta.",
              "El resultado alimenta tu plan automáticamente.",
            ]}
            visual={<DiagnosticVisual />}
          />
        </Frame>

        {/* Frame — Mapa de conocimiento */}
        <Frame tone="raised">
          <SplitFrame
            flip
            eyebrow="Mapa de conocimiento"
            title="Tu dominio real, tema por tema."
            lead="No una lista de temas marcados como vistos. Un porcentaje por concepto que se mueve conforme estudias."
            bullets={[
              "Verde, ámbar y rojo: sabes de un vistazo qué está en riesgo.",
              "Se actualiza con cada diagnóstico y cada sesión completada.",
              "Los temas débiles suben solos al principio de tu plan.",
            ]}
            visual={<KnowledgeMapVisual />}
          />
        </Frame>

        {/* Frame — Preparación de examen */}
        <Frame>
          <SplitFrame
            eyebrow="Preparación para examen"
            title="¿Estás listo para el examen? Ahora tienes un número."
            lead="Un porcentaje de preparación calculado con tu dominio de los temas que ese examen cubre, y los días que faltan."
            bullets={[
              "Desglosado por tema, para saber dónde está el hueco.",
              "Te dice cuánto podrías subir si refuerzas lo correcto.",
              "Cambia solo conforme se acerca la fecha y avanzas.",
            ]}
            visual={<ExamPrepVisual />}
          />
        </Frame>

        {/* Frame — Plan diario */}
        <Frame tone="raised">
          <SplitFrame
            flip
            eyebrow="Plan diario"
            title="Abres HeyStudy y ya está decidido."
            lead="Tres o cuatro cosas concretas, con minutos asignados y una razón por cada una. Nada de listas infinitas."
            bullets={[
              "Ordenado por impacto, no por urgencia aparente.",
              "Cada tema viene con el porqué: qué error lo puso ahí.",
              "Mañana es un plan nuevo, con lo que aprendiste hoy ya contado.",
            ]}
            visual={<DailyPlanVisual />}
          />
        </Frame>

        {/* Frame — Alcance */}
        <Frame>
          <FrameHeading
            align="center"
            eyebrow="Alcance"
            title="Funciona con las materias que ya llevas."
            lead="HeyStudy no trae un temario propio: aprende del tuyo. Si puedes escribir el nombre de la materia, puedes diagnosticarla."
          />
          <Reveal delay={0.1} className="mx-auto mt-9 flex max-w-3xl flex-wrap justify-center gap-2.5 sm:mt-12">
            {SUBJECTS.map((s) => (
              <span
                key={s}
                className="rounded-full border border-border bg-surface px-3.5 py-1.5 text-sm text-muted"
              >
                {s}
              </span>
            ))}
            <span className="rounded-full border border-dashed border-border-strong/60 px-3.5 py-1.5 text-sm text-subtle">
              y la tuya
            </span>
          </Reveal>
        </Frame>

        {/* Frame — Comparativa */}
        <Frame tone="raised">
          <FrameHeading
            eyebrow="Comparativa"
            title="Contra lo que ya estás haciendo."
            lead="Un tutor particular sigue siendo mejor para resolver una duda en vivo. Para todo lo demás, esto es lo que cambia."
          />
          <Reveal delay={0.1} className="mt-9 sm:mt-12">
            <Comparison />
          </Reveal>
        </Frame>

        {/* Frame — Para quién es */}
        <Frame>
          <FrameHeading eyebrow="Para quién es" title="Si llevas más de tres materias, es para ti." />
          <div className="mt-9 grid grid-cols-1 gap-4 sm:mt-12 sm:gap-5 lg:grid-cols-3">
            {AUDIENCES.map((a, i) => (
              <Reveal key={a.title} delay={0.07 * i}>
                <div className="flex h-full flex-col rounded-2xl border border-border bg-surface p-6 sm:p-7">
                  <h3 className="font-display text-xl font-semibold tracking-tight text-foreground">{a.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted">{a.description}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </Frame>

        {/* Frame — Demo interactiva */}
        <Frame id="demo" tone="raised">
          <FrameHeading
            align="center"
            eyebrow="Pruébalo"
            title="Mira tu plan antes de registrarte."
            lead="Elige una materia y verás cómo se arma un día de estudio real."
          />
          <Reveal delay={0.12} className="mt-8 sm:mt-12">
            <DemoInteractivo />
          </Reveal>
        </Frame>

        {/* Frame — Precios */}
        <Frame id="precios">
          <FrameHeading
            align="center"
            eyebrow="Precios"
            title="Empieza gratis, escala cuando lo necesites."
            lead="Sin tarjeta para probar el diagnóstico y el plan de estudio."
          />
          <Reveal delay={0.1} className="mt-8 sm:mt-12">
            <Pricing />
          </Reveal>
        </Frame>

        {/* Frame — FAQ */}
        <Frame tone="raised">
          <FrameHeading align="center" eyebrow="Dudas" title="Preguntas frecuentes" />
          <Reveal delay={0.1} className="mt-8 sm:mt-12">
            <Faq />
          </Reveal>
        </Frame>

        {/* CTA final */}
        <section className="relative overflow-hidden bg-accent px-6 py-16 text-center sm:px-8 sm:py-28">
          <Constellation className="pointer-events-none absolute inset-0 h-full w-full text-white opacity-[0.12]" />
          <Reveal className="relative mx-auto max-w-xl">
            <h2 className="font-display text-[1.75rem] leading-[1.15] font-semibold tracking-tight text-white sm:text-5xl sm:leading-[1.1]">
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
    <footer className="border-t border-border px-6 py-10 sm:px-8 sm:py-14">
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
