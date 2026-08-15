"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

type Step = "elegir" | "analizando" | "listo";

const SUBJECTS = ["Matemáticas", "Historia", "Biología"];

const PLAN_BY_SUBJECT: Record<string, { title: string; reason: string; minutes: number; level: "danger" | "warning" | "success" }[]> = {
  Matemáticas: [
    { title: "Funciones cuadráticas", reason: "Es tu tema más débil ahora mismo", minutes: 20, level: "danger" },
    { title: "Factorización", reason: "4 errores detectados esta semana", minutes: 15, level: "warning" },
    { title: "Ecuaciones lineales", reason: "Repaso rápido para mantener el nivel", minutes: 10, level: "success" },
  ],
  Historia: [
    { title: "Revolución Francesa", reason: "Es tu tema más débil ahora mismo", minutes: 20, level: "danger" },
    { title: "Causas de la Primera Guerra Mundial", reason: "3 errores detectados esta semana", minutes: 15, level: "warning" },
    { title: "Línea de tiempo del siglo XIX", reason: "Repaso rápido para mantener el nivel", minutes: 10, level: "success" },
  ],
  Biología: [
    { title: "Respiración celular", reason: "Es tu tema más débil ahora mismo", minutes: 20, level: "danger" },
    { title: "Mitosis y meiosis", reason: "5 errores detectados esta semana", minutes: 15, level: "warning" },
    { title: "Clasificación de los seres vivos", reason: "Repaso rápido para mantener el nivel", minutes: 10, level: "success" },
  ],
};

const DOT_CLASS: Record<"danger" | "warning" | "success", string> = {
  danger: "bg-danger",
  warning: "bg-warning",
  success: "bg-success",
};

export function DemoInteractivo() {
  const [step, setStep] = useState<Step>("elegir");
  const [subject, setSubject] = useState<string | null>(null);

  function handlePick(s: string) {
    setSubject(s);
    setStep("analizando");
    setTimeout(() => setStep("listo"), 1200);
  }

  function handleReset() {
    setStep("elegir");
    setSubject(null);
  }

  const plan = subject ? PLAN_BY_SUBJECT[subject] : null;
  const totalMinutes = plan?.reduce((sum, item) => sum + item.minutes, 0) ?? 0;

  return (
    <div className="mx-auto max-w-lg rounded-2xl border border-border bg-surface p-6 shadow-soft sm:p-8">
      {step === "elegir" && (
        <div className="flex flex-col items-center gap-5 text-center">
          <p className="text-sm font-medium text-muted">Elige una materia para ver un ejemplo</p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {SUBJECTS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => handlePick(s)}
                className="rounded-full border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-accent hover:bg-accent-soft"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {step === "analizando" && (
        <div className="flex flex-col items-center gap-4 py-8 text-center">
          <Loader2 className="h-6 w-6 animate-spin text-accent-hover" />
          <p className="text-sm font-medium text-muted">Analizando tu nivel en {subject}...</p>
        </div>
      )}

      {step === "listo" && plan && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium tracking-wide text-muted uppercase">
              Tu plan de hoy · {subject}
            </p>
            <span className="text-xs font-medium text-muted">{totalMinutes} min</span>
          </div>
          <div className="flex flex-col divide-y divide-border rounded-xl border border-border">
            {plan.map((item) => (
              <div key={item.title} className="flex items-start gap-3 px-4 py-3">
                <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${DOT_CLASS[item.level]}`} />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{item.title}</p>
                  <p className="text-xs text-muted">{item.reason}</p>
                </div>
                <span className="shrink-0 text-xs font-medium text-muted">{item.minutes} min</span>
              </div>
            ))}
          </div>
          <div className="flex flex-col items-center gap-2 pt-2 text-center">
            <Link href="/registro" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto">
                Empezar gratis
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <button type="button" onClick={handleReset} className="text-xs font-medium text-muted hover:text-foreground">
              Probar con otra materia
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
