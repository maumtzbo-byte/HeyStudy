import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Brain, LayoutGrid, Target, ListChecks } from "lucide-react";
import { getAuthUser } from "@/lib/auth/getCurrentUser";
import { Button } from "@/components/ui/Button";

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

export default async function Home() {
  const user = await getAuthUser();
  if (user) redirect("/dashboard");

  return (
    <div className="flex flex-1 flex-col bg-background">
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-6">
        <span className="text-lg font-semibold tracking-tight text-foreground">HeyStudy</span>
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
      <section className="mx-auto flex w-full max-w-3xl flex-col items-center px-4 pt-16 pb-20 text-center sm:pt-24">
        <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
          ¿Qué debería estudiar hoy, y por qué?
        </h1>
        <p className="mt-6 max-w-xl text-lg text-muted">
          HeyStudy diagnostica qué sabes realmente, no solo si respondiste bien o mal, y arma tu plan de estudio
          del día. Las otras apps se adaptan a ti. HeyStudy se adapta a cómo aprendes tú.
        </p>
        <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:gap-4">
          <Link href="/registro" className="w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto">
              Empezar gratis
            </Button>
          </Link>
          <Link href="/login" className="w-full sm:w-auto">
            <Button size="lg" variant="secondary" className="w-full sm:w-auto">
              Ya tengo cuenta
            </Button>
          </Link>
        </div>
      </section>

      {/* Cómo funciona */}
      <section className="border-t border-border bg-surface px-4 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Cómo funciona
          </h2>
          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-3">
            {STEPS.map((step) => (
              <div key={step.number} className="flex flex-col items-center text-center sm:items-start sm:text-left">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-sm font-semibold text-accent-foreground">
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
          <h2 className="text-center text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Qué incluye
          </h2>
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2">
            {FEATURES.map((feature) => (
              <div key={feature.title} className="rounded-xl border border-border bg-surface p-6">
                <feature.icon className="h-6 w-6 text-accent" />
                <h3 className="mt-4 text-base font-semibold text-foreground">{feature.title}</h3>
                <p className="mt-2 text-sm text-muted">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="border-t border-border bg-surface px-4 py-20 text-center">
        <div className="mx-auto max-w-xl">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
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
