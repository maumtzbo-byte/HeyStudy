"use client";

import { Check } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";

// Refleja el modelo real de Subscription (PlanTier: FREE | PAID) — el
// precio del plan de pago es un placeholder hasta que el negocio lo defina.
const PLANS = [
  {
    name: "Gratis",
    price: "$0",
    period: "",
    description: "Para empezar a diagnosticar tus materias sin compromiso.",
    features: [
      "Diagnóstico con IA por materia",
      "Mapa de conocimiento",
      "Plan de estudio diario",
      "Diagnósticos y materiales limitados por mes",
    ],
    cta: "Empezar gratis",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "Próximamente",
    period: "",
    description: "Para quienes quieren uso sin límites en cada examen.",
    features: [
      "Todo lo del plan Gratis",
      "Diagnósticos ilimitados",
      "Materiales analizados ilimitados",
      "Tutor IA sin límite de mensajes",
    ],
    cta: "Avísame cuando esté listo",
    highlighted: true,
  },
];

export function Pricing() {
  return (
    <div className="mx-auto grid w-full max-w-3xl grid-cols-1 gap-6 sm:grid-cols-2">
      {PLANS.map((plan) => (
        <div key={plan.name} className="relative">
          {plan.highlighted && (
            // Blob de color detrás del panel de vidrio — sin esto, el
            // backdrop-blur no tendría nada de fondo que refractar.
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded-2xl bg-[radial-gradient(circle_at_20%_15%,#8b91e8_0%,transparent_55%),radial-gradient(circle_at_85%_85%,#f2c169_0%,transparent_50%)]"
            />
          )}
          <div
            className={cn(
              "relative flex h-full flex-col rounded-2xl border p-6 shadow-soft sm:p-8",
              plan.highlighted
                ? "border-white/60 bg-white/35 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] backdrop-blur-xl"
                : "border-border bg-surface",
            )}
          >
            <p className="text-sm font-semibold tracking-wide text-foreground uppercase">{plan.name}</p>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="text-3xl font-semibold text-foreground">{plan.price}</span>
              {plan.period && <span className="text-sm text-muted">{plan.period}</span>}
            </div>
            <p className="mt-2 text-sm text-muted">{plan.description}</p>

            <ul className="mt-6 flex flex-1 flex-col gap-3">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-sm text-foreground">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent-hover" />
                  {feature}
                </li>
              ))}
            </ul>

            <ButtonLink
              href="/registro"
              variant={plan.highlighted ? "primary" : "secondary"}
              className="mt-8 w-full"
            >
              {plan.cta}
            </ButtonLink>
          </div>
        </div>
      ))}
    </div>
  );
}
