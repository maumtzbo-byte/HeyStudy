import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Sparkles, Lightbulb, ArrowRight, CheckCircle2, XCircle } from "lucide-react";
import { getAuthUser } from "@/lib/auth/getCurrentUser";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";
import { DemoInteractivo } from "@/components/marketing/DemoInteractivo";
import { Constellation } from "@/components/marketing/Constellation";

export const metadata: Metadata = {
  title: "HeyStudy — Sabe qué estudiar, hoy",
};

const DIAGNOSTIC_ITEMS = [
  { question: "¿Cuál es el vértice de f(x) = x² − 4x + 3?", correct: true, detail: "Dominas este concepto" },
  { question: "Factoriza x² − 5x + 6", correct: false, detail: "Confundes el signo del término medio" },
  { question: "Resuelve 2x + 3 = 11", correct: true, detail: "Dominas este concepto" },
];

const TUTOR_CHAT = [
  { role: "user" as const, text: "¿Por qué la derivada de x² es 2x?" },
  { role: "assistant" as const, text: "Buena pregunta — ¿qué pasa si primero desarrollas (x+h)² y ves qué tan rápido crece?" },
];

const PLAN_PREVIEW = [
  { title: "Funciones cuadráticas", reason: "Tu tema más débil ahora mismo", minutes: 20, level: "danger" as const },
  { title: "Factorización", reason: "4 errores detectados esta semana", minutes: 15, level: "warning" as const },
  { title: "Ecuaciones lineales", reason: "Repaso rápido para mantener el nivel", minutes: 10, level: "success" as const },
];

const KNOWLEDGE_MAP = [
  { topic: "Funciones", score: 0.42 },
  { topic: "Factorización", score: 0.67 },
  { topic: "Ecuaciones", score: 0.91 },
  { topic: "Polinomios", score: 0.73 },
  { topic: "Geometría", score: 0.88 },
];

function levelFromScore(score: number): "danger" | "warning" | "success" {
  if (score >= 0.7) return "success";
  if (score >= 0.4) return "warning";
  return "danger";
}

// Estos dos mockups son "capturas de producto" flotando sobre las bandas
// oscuras: deben verse siempre igual (claros), sin adaptarse al modo
// oscuro del sistema — por eso usan colores fijos en vez de los tokens de tema.
const FIXED_LEVEL_BAR_CLASS: Record<"danger" | "warning" | "success", string> = {
  danger: "bg-[#b3341c]",
  warning: "bg-[#b4790a]",
  success: "bg-[#3f7d52]",
};

function DashboardPreview() {
  return (
    <div className="mx-auto w-full max-w-2xl rounded-2xl border border-[#e8e8e5] bg-white p-6 shadow-soft sm:p-8">
      <p className="text-sm text-[#4b4b4f]">Buenas tardes, Alex 👋</p>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-medium tracking-wide text-[#4b4b4f] uppercase">Tu preparación</p>
          <p className="mt-1 text-sm font-medium text-[#111111]">Matemáticas · Examen en 6 días</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-3xl font-semibold text-[#111111]">72%</span>
          <span className="rounded-full bg-[#b4790a]/10 px-2.5 py-1 text-xs font-medium text-[#b4790a]">
            Bien preparado
          </span>
        </div>
      </div>
      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-[#e8e8e5]">
        <div className="h-full rounded-full bg-[#b4790a]" style={{ width: "72%" }} />
      </div>

      <div className="mt-6 border-t border-[#e8e8e5] pt-6">
        <p className="text-xs font-medium tracking-wide text-[#4b4b4f] uppercase">Tu plan de hoy</p>
        <div className="mt-3 flex flex-col divide-y divide-[#e8e8e5]">
          {PLAN_PREVIEW.map((item) => (
            <div key={item.title} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
              <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${FIXED_LEVEL_BAR_CLASS[item.level]}`} />
              <div className="flex-1">
                <p className="text-sm font-medium text-[#111111]">{item.title}</p>
                <p className="text-xs text-[#4b4b4f]">{item.reason}</p>
              </div>
              <span className="shrink-0 text-xs font-medium text-[#4b4b4f]">{item.minutes} min</span>
            </div>
          ))}
        </div>
      </div>

      <Link href="/registro" className="mt-6 block">
        <Button className="w-full">
          Empezar sesión
          <ArrowRight className="h-4 w-4" />
        </Button>
      </Link>
    </div>
  );
}

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
              <span className="w-10 shrink-0 text-right text-sm font-medium text-[#6b6790]">
                {Math.round(row.score * 100)}%
              </span>
            </div>
          );
        })}
      </div>
      <div className="mt-6 flex items-start gap-2 rounded-lg bg-white px-4 py-3">
        <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-[#565ec2]" />
        <p className="text-sm text-[#111111]">
          Ejemplo: HeyStudy encontró que <strong>Funciones</strong> es tu punto más débil — por eso es lo primero en
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
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#3f7d52]" />
            ) : (
              <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#b3341c]" />
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

export default async function Home() {
  const user = await getAuthUser();
  if (user) redirect("/dashboard");

  return (
    <div className="flex flex-1 flex-col bg-background">
      {/* Header + Hero — banda atmosférica */}
      <div className="relative overflow-hidden bg-atmosphere">
        <Image
          src="/images/hero-gate.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-top"
        />
        <div
          className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[var(--deep)]"
          aria-hidden
        />

        <header className="relative mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-6">
          <Logo inverted />
          <nav className="hidden items-center gap-1 rounded-full border border-white/15 bg-white/10 p-1 backdrop-blur-md md:flex">
            <a
              href="#como-funciona"
              className="rounded-full px-4 py-1.5 text-sm font-medium text-deep-foreground/90 hover:bg-white/10"
            >
              Cómo funciona
            </a>
            <a
              href="#demo"
              className="rounded-full px-4 py-1.5 text-sm font-medium text-deep-foreground/90 hover:bg-white/10"
            >
              Demo
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium text-deep-muted hover:text-deep-foreground">
              Iniciar sesión
            </Link>
            <Link href="/registro">
              <Button size="sm" className="bg-white text-accent-hover shadow-none hover:bg-white/90">
                Crear cuenta
              </Button>
            </Link>
          </div>
        </header>

        <section className="relative px-4 pt-10 pb-20 sm:pt-16">
          <div className="relative mx-auto flex w-full max-w-3xl flex-col items-center text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-white backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5" />
              Tu copiloto de estudio con IA
            </span>
            <h1 className="mt-6 text-4xl leading-[1.1] font-semibold tracking-tight text-deep-foreground sm:text-5xl">
              Estudia lo que necesitas.
              <br />
              No lo que crees que necesitas.
            </h1>
            <p className="mt-6 max-w-xl text-lg text-deep-muted">
              HeyStudy analiza lo que realmente dominas, encuentra tus puntos débiles y convierte tus exámenes en un
              plan de estudio personalizado.
            </p>
            <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:gap-4">
              <Link href="/registro" className="w-full sm:w-auto">
                <Button size="lg" className="w-full bg-white text-accent-hover shadow-none hover:bg-white/90 sm:w-auto">
                  Empezar gratis
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <a href="#como-funciona" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  variant="secondary"
                  className="w-full border-white/15 bg-white/10 text-deep-foreground backdrop-blur-md hover:bg-white/15 sm:w-auto"
                >
                  Ver cómo funciona
                </Button>
              </a>
            </div>
            <p className="mt-4 text-sm text-deep-muted">Gratis para empezar · Sin tarjeta</p>
          </div>

          <div className="relative mx-auto mt-16 w-full max-w-5xl">
            <DashboardPreview />
          </div>
        </section>
      </div>

      {/* Cómo funciona — historia en tarjetas, como en la referencia */}
      <section id="como-funciona" className="relative overflow-hidden bg-atmosphere px-4 py-20 sm:py-28">
        <Constellation className="pointer-events-none absolute inset-0 h-full w-full text-white opacity-20" />

        <div className="relative mx-auto max-w-2xl text-center">
          <h2 className="text-3xl leading-[1.15] font-semibold tracking-tight text-deep-foreground sm:text-4xl">
            Deja de adivinar.
            <br />
            Empieza a{" "}
            <span className="mx-1 inline-flex h-9 w-9 -translate-y-1 items-center justify-center rounded-lg bg-white align-middle">
              <Lightbulb className="h-5 w-5 text-accent-hover" />
            </span>{" "}
            saber.
          </h2>
        </div>

        <div className="relative mx-auto mt-16 w-full max-w-4xl">
          <p className="text-center text-xs font-semibold tracking-wide text-deep-muted uppercase">
            Así es como funciona:
          </p>

          <div className="mt-8 flex flex-col gap-6">
            <div className="grid grid-cols-1 items-center gap-6 rounded-3xl bg-white p-6 shadow-soft sm:grid-cols-2 sm:gap-10 sm:p-10">
              <div>
                <p className="text-xs font-semibold tracking-wide text-accent-hover uppercase">Diagnóstico con IA</p>
                <h3 className="mt-3 text-xl font-semibold text-[#111111]">No solo si acertaste — qué tanto sabes</h3>
                <p className="mt-3 text-[#6b6790]">
                  Respondes preguntas generadas para ti. Analizamos tu respuesta más allá de correcto o incorrecto
                  para detectar patrones de error específicos.
                </p>
              </div>
              <DiagnosticVisual />
            </div>

            <div className="grid grid-cols-1 items-center gap-6 rounded-3xl bg-white p-6 shadow-soft sm:grid-cols-2 sm:gap-10 sm:p-10">
              <div>
                <p className="text-xs font-semibold tracking-wide text-accent-hover uppercase">
                  Mapa de conocimiento
                </p>
                <h3 className="mt-3 text-xl font-semibold text-[#111111]">Conoce tu nivel real, tema por tema</h3>
                <p className="mt-3 text-[#6b6790]">
                  No es una lista de temas marcados como &ldquo;visto&rdquo;. Es tu dominio real, actualizado cada
                  vez que practicas.
                </p>
              </div>
              <KnowledgeMapVisual />
            </div>

            <div className="grid grid-cols-1 items-center gap-6 rounded-3xl bg-white p-6 shadow-soft sm:grid-cols-2 sm:gap-10 sm:p-10">
              <div>
                <p className="text-xs font-semibold tracking-wide text-accent-hover uppercase">Tutor IA</p>
                <h3 className="mt-3 text-xl font-semibold text-[#111111]">Pregunta lo que no entiendas, a tu ritmo</h3>
                <p className="mt-3 text-[#6b6790]">
                  Modo socrático, explicación directa, pista o práctica — tú eliges cómo quieres que te expliquen.
                </p>
              </div>
              <TutorChatVisual />
            </div>
          </div>
        </div>
      </section>

      {/* Demo interactiva */}
      <section id="demo" className="px-4 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            ¿Quieres ver cómo funciona?
          </h2>
          <p className="mt-4 text-muted">Elige una materia y mira un ejemplo de tu plan del día — sin registrarte.</p>
        </div>
        <div className="mt-10">
          <DemoInteractivo />
        </div>
      </section>

      {/* CTA final */}
      <section className="relative overflow-hidden bg-atmosphere px-4 py-24 text-center">
        <Constellation className="pointer-events-none absolute inset-0 h-full w-full text-white opacity-20" />
        <div className="relative mx-auto max-w-xl">
          <h2 className="text-2xl font-semibold tracking-tight text-deep-foreground sm:text-3xl">
            Tu próximo examen no debería decidir qué estudias.
            <br />
            HeyStudy sí.
          </h2>
          <Link href="/registro" className="mt-8 inline-block">
            <Button size="lg" className="bg-white text-accent-hover shadow-none hover:bg-white/90">
              Descubre qué deberías estudiar hoy
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <p className="mt-4 text-sm text-deep-muted">Gratis para empezar · Sin tarjeta</p>
        </div>
      </section>

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
