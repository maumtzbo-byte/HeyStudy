import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Sparkles, Brain, Target, ListChecks, MessageCircle, ArrowRight } from "lucide-react";
import { getAuthUser } from "@/lib/auth/getCurrentUser";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";
import { DemoInteractivo } from "@/components/marketing/DemoInteractivo";

export const metadata: Metadata = {
  title: "HeyStudy — Sabe qué estudiar, hoy",
};

const JOURNEY = [
  {
    number: "01",
    title: "Dile qué tienes",
    description: "Agrega tus materias, tareas y exámenes en minutos. Sin conectar nada, sin fricción.",
  },
  {
    number: "02",
    title: "HeyStudy descubre qué sabes",
    description: "Respondes preguntas generadas para ti. No solo si acertaste — cuánto dominas de verdad.",
  },
  {
    number: "03",
    title: "Encontramos tus puntos débiles",
    description: "Vemos exactamente qué temas dominas y cuáles necesitan más trabajo, siempre actualizado.",
  },
  {
    number: "04",
    title: "Te decimos qué hacer hoy",
    description: "Un plan diario priorizado por tus exámenes próximos y tu debilidad más urgente.",
  },
];

const FEATURES = [
  {
    icon: Brain,
    title: "¿Realmente sabes esto?",
    description:
      "No solo correcto o incorrecto: extraemos tu nivel de dominio por concepto y detectamos patrones de error.",
  },
  {
    icon: Target,
    title: "¿Por qué estudiar esto primero?",
    description:
      "Un puntaje de preparación por examen que puedes entender: qué temas pesan más en el cálculo y por qué.",
  },
  {
    icon: ListChecks,
    title: "Esto es lo que estudias hoy",
    description: "Cuánto tiempo, y por qué — enfocado en tu debilidad más urgente, no en la más fácil.",
  },
  {
    icon: MessageCircle,
    title: "Tutor IA a tu ritmo",
    description: "Pregunta lo que no entiendas. Modo socrático, explicación directa, pista o práctica — tú eliges.",
  },
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

const LEVEL_BAR_CLASS: Record<"danger" | "warning" | "success", string> = {
  danger: "bg-danger",
  warning: "bg-warning",
  success: "bg-success",
};

function DashboardPreview() {
  return (
    <div className="mx-auto w-full max-w-2xl rounded-2xl border border-border bg-surface p-6 shadow-soft sm:p-8">
      <p className="text-sm text-muted">Buenas tardes, Alex 👋</p>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-medium tracking-wide text-muted uppercase">Tu preparación</p>
          <p className="mt-1 text-sm font-medium text-foreground">Matemáticas · Examen en 6 días</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-3xl font-semibold text-foreground">72%</span>
          <span className="rounded-full bg-warning/10 px-2.5 py-1 text-xs font-medium text-warning">
            Bien preparado
          </span>
        </div>
      </div>
      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-border">
        <div className="h-full rounded-full bg-warning" style={{ width: "72%" }} />
      </div>

      <div className="mt-6 border-t border-border pt-6">
        <p className="text-xs font-medium tracking-wide text-muted uppercase">Tu plan de hoy</p>
        <div className="mt-3 flex flex-col divide-y divide-border">
          {PLAN_PREVIEW.map((item) => (
            <div key={item.title} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
              <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${LEVEL_BAR_CLASS[item.level]}`} />
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{item.title}</p>
                <p className="text-xs text-muted">{item.reason}</p>
              </div>
              <span className="shrink-0 text-xs font-medium text-muted">{item.minutes} min</span>
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

function KnowledgeMapShowcase() {
  return (
    <div className="mx-auto w-full max-w-2xl rounded-2xl border border-border bg-surface p-6 shadow-soft sm:p-8">
      <p className="text-xs font-medium tracking-wide text-muted uppercase">Matemáticas</p>
      <div className="mt-4 flex flex-col gap-4">
        {KNOWLEDGE_MAP.map((row) => {
          const level = levelFromScore(row.score);
          return (
            <div key={row.topic} className="flex items-center gap-4">
              <span className="w-28 shrink-0 text-sm font-medium text-foreground">{row.topic}</span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-border">
                <div
                  className={`h-full rounded-full ${LEVEL_BAR_CLASS[level]}`}
                  style={{ width: `${Math.round(row.score * 100)}%` }}
                />
              </div>
              <span className="w-10 shrink-0 text-right text-sm font-medium text-muted">
                {Math.round(row.score * 100)}%
              </span>
            </div>
          );
        })}
      </div>
      <div className="mt-6 flex items-start gap-2 rounded-lg bg-accent-soft px-4 py-3">
        <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-accent-hover" />
        <p className="text-sm text-foreground">
          Ejemplo: HeyStudy encontró que <strong>Funciones</strong> es tu punto más débil — por eso es lo primero en
          tu plan de hoy.
        </p>
      </div>
    </div>
  );
}

export default async function Home() {
  const user = await getAuthUser();
  if (user) redirect("/dashboard");

  return (
    <div className="flex flex-1 flex-col bg-background">
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-6">
        <Logo />
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm font-medium text-muted hover:text-foreground">
            Iniciar sesión
          </Link>
          <Link href="/registro">
            <Button size="sm">Crear cuenta</Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden px-4 pt-14 pb-20 sm:pt-20">
        <div
          className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-accent/15 blur-3xl"
          aria-hidden
        />

        <div className="relative mx-auto flex w-full max-w-3xl flex-col items-center text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/20 bg-accent-soft px-3 py-1 text-xs font-medium text-accent-hover">
            <Sparkles className="h-3.5 w-3.5" />
            Tu copiloto de estudio con IA
          </span>
          <h1 className="mt-6 text-4xl leading-[1.1] font-semibold tracking-tight text-foreground sm:text-5xl">
            Estudia lo que necesitas.
            <br />
            No lo que crees que necesitas.
          </h1>
          <p className="mt-6 max-w-xl text-lg text-muted">
            HeyStudy analiza lo que realmente dominas, encuentra tus puntos débiles y convierte tus exámenes en un
            plan de estudio personalizado.
          </p>
          <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:gap-4">
            <Link href="/registro" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto">
                Empezar gratis
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <a href="#como-funciona" className="w-full sm:w-auto">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                Ver cómo funciona
              </Button>
            </a>
          </div>
          <p className="mt-4 text-sm text-muted">Gratis para empezar · Sin tarjeta</p>
        </div>

        <div className="relative mx-auto mt-16 w-full max-w-5xl">
          <DashboardPreview />
        </div>
      </section>

      {/* Cómo funciona */}
      <section id="como-funciona" className="border-t border-border bg-surface px-4 py-20">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-center text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            De &ldquo;no sé qué estudiar&rdquo; a &ldquo;sé exactamente qué hacer&rdquo;
          </h2>
          <div className="mt-14 flex flex-col gap-10">
            {JOURNEY.map((step, i) => (
              <div key={step.number} className="flex gap-5">
                <div className="flex flex-col items-center">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-accent text-sm font-semibold text-accent-hover">
                    {step.number}
                  </span>
                  {i < JOURNEY.length - 1 && <span className="mt-2 w-px flex-1 bg-border" />}
                </div>
                <div className="pb-2">
                  <h3 className="pt-1.5 text-base font-semibold text-foreground">{step.title}</h3>
                  <p className="mt-2 text-sm text-muted">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mapa de conocimiento */}
      <section className="px-4 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">Conoce tu nivel real</h2>
          <p className="mt-4 text-muted">
            No es una lista de temas marcados como &ldquo;visto&rdquo;. Es tu dominio real, actualizado cada vez que
            practicas.
          </p>
        </div>
        <div className="mt-12">
          <KnowledgeMapShowcase />
        </div>
      </section>

      {/* Qué incluye */}
      <section className="border-t border-border bg-surface px-4 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Qué incluye
          </h2>
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="rounded-xl border border-border bg-background p-6 shadow-soft transition-transform hover:-translate-y-0.5"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-soft text-accent-hover">
                  <feature.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 text-base font-semibold text-foreground">{feature.title}</h3>
                <p className="mt-2 text-sm text-muted">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo interactiva */}
      <section className="px-4 py-20">
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
      <section className="border-t border-border px-4 py-20 text-center">
        <div className="mx-auto max-w-xl rounded-2xl border border-accent/20 bg-accent-soft px-8 py-14">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Tu próximo examen no debería decidir qué estudias.
            <br />
            HeyStudy sí.
          </h2>
          <Link href="/registro" className="mt-8 inline-block">
            <Button size="lg">
              Descubre qué deberías estudiar hoy
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <p className="mt-4 text-sm text-muted">Gratis para empezar · Sin tarjeta</p>
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
