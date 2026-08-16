import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Sparkles, Lightbulb, ArrowRight, CheckCircle2, XCircle, Target, ListChecks, LayoutGrid, FileText } from "lucide-react";
import { getAuthUser } from "@/lib/auth/getCurrentUser";
import { ButtonLink } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";
import { DemoInteractivo } from "@/components/marketing/DemoInteractivo";
import { Constellation } from "@/components/marketing/Constellation";
import { HeroScene } from "@/components/marketing/HeroScene";
import { SiteHeader } from "@/components/marketing/SiteHeader";
import { Testimonials } from "@/components/marketing/Testimonials";
import { Pricing } from "@/components/marketing/Pricing";
import { Faq } from "@/components/marketing/Faq";
import { Reveal } from "@/components/marketing/Reveal";
import { Chispa, BookStack, Pencil, ExamCard } from "@/components/marketing/StudyIcons";
import { KNOWLEDGE_MAP, DIAGNOSTIC_ITEMS, TUTOR_CHAT, levelFromScore, FIXED_LEVEL_BAR_CLASS } from "@/components/marketing/visualData";
import { cn } from "@/lib/utils/cn";

export const metadata: Metadata = {
  title: "HeyStudy: Sabe qué estudiar, hoy",
};

const FEATURES = [
  {
    icon: Target,
    title: "Preparación explicable",
    description: "Un puntaje de preparación por examen que puedes entender: qué temas pesan más y por qué.",
  },
  {
    icon: ListChecks,
    title: "Plan de estudio diario",
    description: "Qué estudiar hoy, cuánto tiempo y por qué, enfocado en tu debilidad más urgente.",
  },
  {
    icon: LayoutGrid,
    title: "Organiza tus materias",
    description: "Materias, tareas y exámenes en un solo lugar. Sin conectar nada, sin fricción.",
  },
  {
    icon: FileText,
    title: "Sube tus materiales",
    description: "PDFs e imágenes de tus apuntes: HeyStudy los analiza para armar tus temas de estudio.",
  },
];

// Layout tipo bento: la 1 (preparación) queda ancha arriba, la 4
// (materiales) queda alta a la derecha, las otras dos abajo.
const BENTO_POSITION = [
  "sm:col-start-1 sm:col-end-3 sm:row-start-1 sm:row-end-2",
  "sm:col-start-1 sm:col-end-2 sm:row-start-2 sm:row-end-3",
  "sm:col-start-2 sm:col-end-3 sm:row-start-2 sm:row-end-3",
  "sm:col-start-3 sm:col-end-4 sm:row-start-1 sm:row-end-3",
];

function KnowledgeMapVisual() {
  return (
    <div className="w-full rounded-2xl bg-[#f5f4fc] p-6">
      <p className="text-xs font-medium tracking-wide text-[#6b6790] uppercase">Matemáticas</p>
      <div className="mt-4 flex flex-col gap-4">
        {KNOWLEDGE_MAP.map((row) => {
          const level = levelFromScore(row.score);
          return (
            <div key={row.topic} className="flex items-center gap-4">
              <span className="w-24 shrink-0 text-sm font-medium text-[#111111]">{row.topic}</span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#e3e0f5]">
                <div
                  className={`h-full rounded-full ${FIXED_LEVEL_BAR_CLASS[level]}`}
                  style={{ width: `${Math.round(row.score * 100)}%` }}
                />
              </div>
              <span className="w-10 shrink-0 text-right text-sm font-medium tabular-nums text-[#6b6790]">
                {Math.round(row.score * 100)}%
              </span>
            </div>
          );
        })}
      </div>
      <div className="mt-6 flex items-start gap-2 rounded-lg bg-white px-4 py-3">
        <Sparkles aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-[#565ec2]" />
        <p className="text-sm text-[#111111]">
          Ejemplo: HeyStudy encontró que <strong>Funciones</strong> es tu punto más débil, por eso es lo primero en
          tu plan de hoy.
        </p>
      </div>
    </div>
  );
}

function DiagnosticVisual() {
  return (
    <div className="w-full rounded-2xl bg-[#f5f4fc] p-6">
      <p className="text-xs font-medium tracking-wide text-[#6b6790] uppercase">Diagnóstico · Funciones</p>
      <div className="mt-4 flex flex-col divide-y divide-[#e3e0f5]">
        {DIAGNOSTIC_ITEMS.map((item) => (
          <div key={item.question} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
            {item.correct ? (
              <CheckCircle2 aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-[#3f7d52]" />
            ) : (
              <XCircle aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-[#b3341c]" />
            )}
            <div>
              <p className="text-sm font-medium text-[#111111]">{item.question}</p>
              <p className="text-xs text-[#6b6790]">{item.detail}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TutorChatVisual() {
  return (
    <div className="w-full rounded-2xl bg-[#f5f4fc] p-6">
      <p className="mb-4 text-xs font-medium tracking-wide text-[#6b6790] uppercase">Tutor IA · Modo socrático</p>
      <div className="flex flex-col gap-2">
        {TUTOR_CHAT.map((message, i) => (
          <div
            key={i}
            className={
              message.role === "user"
                ? "max-w-[85%] self-start rounded-xl rounded-bl-sm bg-white px-4 py-2.5 text-sm text-[#111111]"
                : "max-w-[85%] self-end rounded-xl rounded-br-sm bg-[#6c74d6] px-4 py-2.5 text-sm text-white"
            }
          >
            {message.text}
          </div>
        ))}
      </div>
    </div>
  );
}

const PAIN_POINTS = [
  "¿Repasas todo el temario esperando que algo se te pegue?",
  "¿Llegas al examen sin saber si de verdad estás listo?",
  "¿Sigues el mismo tipo de error sin darte cuenta?",
  "¿No sabes si hoy te conviene más repasar Álgebra o Historia?",
];

const STORY_CARDS = [
  {
    eyebrow: "Diagnóstico con IA",
    title: "No solo si acertaste: qué tanto sabes",
    description:
      "Respondes preguntas generadas para ti. Analizamos tu respuesta más allá de correcto o incorrecto para detectar patrones de error específicos.",
    Visual: DiagnosticVisual,
    Icon: ExamCard,
  },
  {
    eyebrow: "Mapa de conocimiento",
    title: "Conoce tu nivel real, tema por tema",
    description:
      'No es una lista de temas marcados como "visto". Es tu dominio real, actualizado cada vez que practicas.',
    Visual: KnowledgeMapVisual,
    Icon: BookStack,
  },
  {
    eyebrow: "Tutor IA",
    title: "Pregunta lo que no entiendas, a tu ritmo",
    description: "Modo socrático, explicación directa, pista o práctica: tú eliges cómo quieres que te expliquen.",
    Visual: TutorChatVisual,
    Icon: Pencil,
  },
];

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

      {/* Cómo funciona — historia en tarjetas */}
      <section id="como-funciona" className="relative scroll-mt-20 overflow-hidden bg-surface px-4 py-20 sm:py-28">
        <Constellation className="pointer-events-none absolute inset-0 h-full w-full text-accent opacity-10" />

        <Reveal className="relative mx-auto flex max-w-md justify-center">
          <Chispa className="w-28 sm:w-32" />
        </Reveal>

        <Reveal delay={0.1} className="relative mx-auto mt-6 flex max-w-md flex-col items-center gap-2">
          {PAIN_POINTS.map((question) => (
            <p key={question} className="text-center text-sm text-muted sm:text-base">
              {question}
            </p>
          ))}
        </Reveal>

        <Reveal delay={0.2} className="relative mx-auto mt-8 max-w-2xl text-center">
          <h2 className="text-3xl leading-[1.15] font-semibold tracking-tight text-foreground sm:text-4xl">
            Deja de adivinar qué estudiar.
            <br />
            Empieza a{" "}
            <span className="mx-1 inline-flex h-9 w-9 -translate-y-1 items-center justify-center rounded-lg bg-white align-middle shadow-soft">
              <Lightbulb aria-hidden className="h-5 w-5 text-accent-hover" />
            </span>{" "}
            saber qué toca hoy.
          </h2>
        </Reveal>

        <div className="relative mx-auto mt-16 w-full max-w-4xl">
          <Reveal delay={0.15}>
            <p className="text-center text-xs font-semibold tracking-wide text-muted uppercase">
              Así es como funciona:
            </p>
          </Reveal>

          <div className="mt-8 flex flex-col gap-6">
            {STORY_CARDS.map(({ eyebrow, title, description, Visual, Icon }, i) => (
              <Reveal key={eyebrow} delay={0.1 * i} y={40}>
                <div className="grid grid-cols-1 gap-6 rounded-3xl bg-white p-6 shadow-soft sm:grid-cols-2 sm:gap-10 sm:p-10">
                  <div className="flex flex-col sm:justify-center">
                    <p className="text-xs font-semibold tracking-wide text-accent-hover uppercase">{eyebrow}</p>
                    <h3 className="mt-3 text-xl font-bold text-[#111111]">{title}</h3>
                    <p className="mt-3 text-[#6b6790]">{description}</p>
                    <Icon className="mt-6 w-24 self-start opacity-70 sm:w-28" />
                  </div>
                  <Reveal delay={0.1 * i + 0.15} y={16}>
                    <Visual />
                  </Reveal>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Qué más incluye — bento grid */}
      <section className="border-t border-border bg-surface px-4 py-20">
        <div className="mx-auto max-w-5xl">
          <Reveal>
            <h2 className="text-center text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Qué más incluye
            </h2>
          </Reveal>
          <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-3 sm:grid-rows-2">
            {FEATURES.map((feature, i) => (
              <Reveal key={feature.title} delay={0.08 * i} className={BENTO_POSITION[i]}>
                <div
                  className={cn(
                    "relative h-full overflow-hidden rounded-xl border p-6 shadow-soft transition-transform hover:-translate-y-0.5",
                    i === 0 || i === 3 ? "border-accent/20 bg-accent-soft" : "border-border bg-background",
                  )}
                >
                  {i === 0 && (
                    <ExamCard className="pointer-events-none absolute -right-8 -bottom-12 w-36 opacity-[0.35]" />
                  )}
                  {i === 3 && (
                    <BookStack className="pointer-events-none absolute -right-10 -bottom-8 w-32 opacity-[0.35]" />
                  )}
                  <span
                    className={cn(
                      "relative flex h-10 w-10 items-center justify-center rounded-full",
                      i === 0 || i === 3 ? "bg-accent text-accent-foreground" : "bg-accent-soft text-accent-hover",
                    )}
                  >
                    <feature.icon aria-hidden className="h-5 w-5" />
                  </span>
                  <h3 className="relative mt-4 text-base font-semibold text-foreground">{feature.title}</h3>
                  <p className="relative mt-2 text-sm text-muted">{feature.description}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Demo interactiva */}
      <section id="demo" className="scroll-mt-20 px-4 py-20">
        <Reveal className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            ¿Quieres ver cómo funciona?
          </h2>
          <p className="mt-4 text-muted">Elige una materia y mira un ejemplo de tu plan del día, sin registrarte.</p>
        </Reveal>
        <Reveal delay={0.15} className="mt-10">
          <DemoInteractivo />
        </Reveal>
      </section>

      {/* Testimonios */}
      <section className="relative overflow-hidden border-t border-border bg-surface px-4 py-20">
        <Pencil className="pointer-events-none absolute top-10 -left-8 hidden w-32 opacity-[0.3] sm:block" />
        <BookStack className="pointer-events-none absolute -right-6 bottom-6 hidden w-36 opacity-[0.3] sm:block" />
        <Reveal className="relative mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Estudiantes que dejaron de adivinar
          </h2>
        </Reveal>
        <div className="relative mt-12">
          <Testimonials />
        </div>
      </section>

      {/* Precios */}
      <section id="precios" className="relative scroll-mt-20 overflow-hidden px-4 py-20">
        <Chispa className="pointer-events-none absolute top-4 right-[6%] hidden w-28 opacity-40 sm:block" />
        <Reveal className="relative mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Empieza gratis, escala cuando lo necesites
          </h2>
          <p className="mt-4 text-muted">Sin tarjeta para probar el diagnóstico y el plan de estudio.</p>
        </Reveal>
        <Reveal delay={0.1} className="relative mt-12">
          <Pricing />
        </Reveal>
      </section>

      {/* Preguntas frecuentes */}
      <section className="border-t border-border bg-surface px-4 py-20">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Preguntas frecuentes</h2>
        </Reveal>
        <Reveal delay={0.1} className="mt-12">
          <Faq />
        </Reveal>
      </section>

      {/* CTA final — único momento de color sólido, como cierre */}
      <section className="relative overflow-hidden bg-accent px-4 py-24 text-center">
        <Constellation className="pointer-events-none absolute inset-0 h-full w-full text-white opacity-20" />
        <Reveal className="relative mx-auto max-w-xl">
          <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Deja de estudiar a ciegas.
            <br />
            Sabe qué repasar antes de tu próximo examen.
          </h2>
          <ButtonLink
            href="/registro"
            size="lg"
            className="mt-8 bg-white text-accent-hover shadow-none hover:bg-white/90"
          >
            Empezar gratis
            <ArrowRight className="h-4 w-4" />
          </ButtonLink>
          <p className="mt-4 text-sm text-white/80">Gratis para empezar · Sin tarjeta</p>
        </Reveal>
      </section>
      </main>

      <footer className="border-t border-border px-4 py-12">
        <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-6 text-center sm:flex-row sm:items-start sm:justify-between sm:text-left">
          <div className="flex flex-col items-center gap-2 sm:items-start">
            <Logo />
            <p className="max-w-xs text-sm text-muted">
              Diseñado para estudiantes que quieren estudiar mejor, no estudiar más.
            </p>
          </div>
          <nav className="flex flex-col items-center gap-2 text-sm sm:items-start">
            <a href="#como-funciona" className="text-muted hover:text-foreground">
              Cómo funciona
            </a>
            <Link href="/login" className="text-muted hover:text-foreground">
              Iniciar sesión
            </Link>
            <Link href="/registro" className="text-muted hover:text-foreground">
              Crear cuenta
            </Link>
          </nav>
        </div>
        <p className="mt-10 text-center text-sm text-muted">© {new Date().getFullYear()} HeyStudy</p>
      </footer>
    </div>
  );
}
