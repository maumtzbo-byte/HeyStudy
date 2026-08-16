"use client";

import { useState } from "react";
import Image from "next/image";
import { Loader2, ArrowRight } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { PLAN_BY_SUBJECT, FIXED_LEVEL_BAR_CLASS } from "@/components/marketing/visualData";
import { cn } from "@/lib/utils/cn";

type Step = "elegir" | "analizando" | "listo";

const SUBJECTS = ["Matemáticas", "Historia", "Biología"];

export function DemoInteractivo() {
  const [step, setStep] = useState<Step>("elegir");
  const [subject, setSubject] = useState<string | null>(null);

  function handlePick(s: string) {
    setSubject(s);
    setStep("analizando");
    setTimeout(() => setStep("listo"), 1000);
  }

  function handleReset() {
    setStep("elegir");
    setSubject(null);
  }

  const plan = subject ? PLAN_BY_SUBJECT[subject] : null;
  const totalMinutes = plan?.reduce((sum, item) => sum + item.minutes, 0) ?? 0;

  return (
    <div
      className="mx-auto max-w-lg rounded-3xl border border-border bg-surface-elevated p-7 shadow-lg sm:p-9"
      aria-live="polite"
    >
      {step === "elegir" && (
        <div className="flex flex-col items-center gap-2 text-center">
          <Image
            src="/mascot/mascota-saludo.png"
            alt=""
            aria-hidden
            width={193}
            height={144}
            className="pointer-events-none h-16 w-auto"
          />
          <p className="text-sm font-medium text-foreground">Elige una materia para ver un ejemplo</p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {SUBJECTS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => handlePick(s)}
                className="rounded-full border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-accent hover:bg-accent-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {step === "analizando" && (
        <div className="flex flex-col items-center gap-4 py-10 text-center">
          <Loader2 className="h-6 w-6 animate-spin text-accent-hover" strokeWidth={1.75} />
          <p className="text-sm font-medium text-muted">Analizando tu nivel en {subject}…</p>
        </div>
      )}

      {step === "listo" && plan && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold tracking-wide text-subtle uppercase">Tu plan de hoy · {subject}</p>
            <span className="text-xs font-medium text-muted tabular-nums">{totalMinutes} min</span>
          </div>
          <div className="flex flex-col gap-2.5">
            {plan.map((item) => (
              <div key={item.title} className="rounded-xl border border-border bg-background p-3.5">
                <div className="flex items-start gap-3">
                  <span className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", FIXED_LEVEL_BAR_CLASS[item.level])} />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{item.title}</p>
                    <p className="text-xs text-muted">{item.reason}</p>
                  </div>
                  <span className="shrink-0 text-xs font-medium text-muted tabular-nums">{item.minutes} min</span>
                </div>
              </div>
            ))}
          </div>
          <div className="flex flex-col items-center gap-2 pt-2 text-center">
            <ButtonLink href="/registro" className="w-full sm:w-auto">
              Empezar gratis
              <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
            </ButtonLink>
            <button
              type="button"
              onClick={handleReset}
              className="rounded-sm text-xs font-medium text-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
            >
              Probar con otra materia
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
