import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Brain, LayoutGrid, Target, ListChecks, ArrowRight, CheckCircle2 } from "lucide-react";
import { getAuthUser } from "@/lib/auth/getCurrentUser";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";

export const metadata: Metadata = {
  title: "HeyStudy — Sabe qué estudiar, hoy",
};

const STEPS = [
  {
    number: "1",
    title: "Carga tus materias",
    description: "Agrega tus materias, tareas y exámenes en minutos. Sin conectar nada, sin fricción.",
  },
  {
    number: "2",
    title: "Diagnostica qué sabes",
    description:
      "Respondes preguntas generadas para ti. Analizamos tu nivel real por tema, no solo si acertaste.",
  },
  {
    number: "3",
    title: "Sigue un plan claro",
    description: "Cada día sabes qué estudiar, cuánto tiempo, y por qué — priorizado por tus exámenes próximos.",
  },
];

const FEATURES = [
  {
    icon: Brain,
    title: "Diagnóstico real",
    description:
      "No solo correcto o incorrecto: extraemos tu nivel de dominio por concepto y detectamos patrones de error.",
  },
  {
    icon: LayoutGrid,
    title: "Mapa de conocimiento",
    description: "Ve qué tanto dominas cada tema de tus materias — en verde, amarillo o rojo, siempre actualizado.",
  },
  {
    icon: Target,
    title: "Preparación explicable",
    description:
      "Un puntaje de preparación por examen que puedes entender: qué temas pesan más en el cálculo y por qué.",
  },
  {
    icon: ListChecks,
    title: "Plan de estudio diario",
    description: "Qué estudiar hoy, cuánto tiempo, y por qué — enfocado en tu debilidad más urgente.",
  },
];

const PLAN_PREVIEW = [
  { title: "Repasar funciones cuadráticas", minutes: 20, done: true },
  { title: "5 ejercicios de factorización", minutes: 15, done: false },
  { title: "Leer resumen de la Revolución Francesa", minutes: 10, done: false },
];

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
      <section className="relative overflow-hidden px-4 pt-16 pb-24 sm:pt-20">
        <div
          className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-accent/15 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute top-40 -left-32 h-72 w-72 rounded-full bg-success/10 blur-3xl"
          aria-hidden
        />

        <div className="relative mx-auto grid w-full max-w-5xl grid-cols-1 items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="flex flex-col items-start text-left">
            <span className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent-soft px-3 py-1 text-xs font-medium text-accent-hover">
              Diagnóstico con IA · gratis para empezar
            </span>
            <h1 className="mt-6 font-serif text-4xl leading-[1.1] font-semibold tracking-tight text-foreground sm:text-5xl">
              ¿Qué debería <span className="italic text-accent">estudiar hoy</span>, y por qué?
            </h1>
            <p className="mt-6 max-w-lg text-lg text-muted">
              HeyStudy diagnostica qué sabes realmente, no solo si respondiste bien o mal, y arma tu plan de
              estudio del día. Las otras apps se adaptan a ti. HeyStudy se adapta a cómo aprendes tú.
            </p>
            <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:gap-4">
              <Link href="/registro" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto">
                  Empezar gratis
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/login" className="w-full sm:w-auto">
                <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                  Ya tengo cuenta
                </Button>
              </Link>
            </div>
            <p className="mt-6 text-sm text-muted">
              Hecho por y para estudiantes cansados de adivinar qué estudiar.
            </p>
          </div>

          <div className="relative hidden lg:block">
            <div className="rounded-2xl border border-border bg-surface p-6 shadow-warm">
              <p className="text-xs font-medium tracking-wide text-muted uppercase">Tu plan de hoy</p>
              <div className="mt-4 flex flex-col divide-y divide-border">
                {PLAN_PREVIEW.map((item) => (
                  <div key={item.title} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                        item.done ? "border-success bg-success text-white" : "border-border"
                      }`}
                    >
                      {item.done && <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={2.5} />}
                    </span>
                    <span className={`flex-1 text-sm ${item.done ? "text-muted line-through" : "text-foreground"}`}>
                      {item.title}
                    </span>
                    <span className="shrink-0 text-xs font-medium text-muted">{item.minutes} min</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="absolute -bottom-6 -left-6 flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-3 shadow-warm">
              <span className="h-2.5 w-2.5 rounded-full bg-warning" />
              <span className="text-xs font-medium text-foreground">Cálculo: 62% dominado</span>
            </div>
          </div>
        </div>
      </section>

      {/* Cómo funciona */}
      <section className="border-t border-border bg-surface px-4 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center font-serif text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Cómo funciona
          </h2>
          <div className="mt-12 grid grid-cols-1 gap-10 sm:grid-cols-3">
            {STEPS.map((step) => (
              <div key={step.number} className="flex flex-col items-center text-center sm:items-start sm:text-left">
                <span className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-accent font-serif text-base font-semibold text-accent">
                  {step.number}
                </span>
                <h3 className="mt-4 text-base font-semibold text-foreground">{step.title}</h3>
                <p className="mt-2 text-sm text-muted">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Qué incluye */}
      <section className="px-4 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center font-serif text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Qué incluye
          </h2>
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="rounded-xl border border-border bg-surface p-6 shadow-warm transition-transform hover:-translate-y-0.5"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-soft text-accent">
                  <feature.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 text-base font-semibold text-foreground">{feature.title}</h3>
                <p className="mt-2 text-sm text-muted">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="border-t border-border px-4 py-20 text-center">
        <div className="mx-auto max-w-xl rounded-2xl border border-accent/20 bg-accent-soft px-8 py-14">
          <h2 className="font-serif text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Deja de adivinar qué estudiar
          </h2>
          <p className="mt-4 text-muted">Crea tu cuenta gratis y ten tu primer diagnóstico en minutos.</p>
          <Link href="/registro" className="mt-8 inline-block">
            <Button size="lg">Empezar gratis</Button>
          </Link>
        </div>
      </section>

      <footer className="border-t border-border px-4 py-8 text-center text-sm text-muted">
        © {new Date().getFullYear()} HeyStudy
      </footer>
    </div>
  );
}
