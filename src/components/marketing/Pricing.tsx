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
    <div className="mx-auto grid w-full max-w-3xl grid-cols-1 gap-5 sm:grid-cols-2">
      {PLANS.map((plan) => (
        <div
          key={plan.name}
          className={cn(
            "relative flex h-full flex-col rounded-3xl border p-7 sm:p-8",
            plan.highlighted
              ? "border-accent/40 bg-surface shadow-lg"
              : "border-border bg-surface shadow-sm",
          )}
        >
          {plan.highlighted && (
            <span className="absolute -top-3 left-7 rounded-full bg-premium px-3 py-1 text-[11px] font-semibold tracking-wide text-white uppercase">
              Próximamente
            </span>
          )}
          <p className="text-sm font-semibold tracking-wide text-foreground uppercase">{plan.name}</p>
          <div className="mt-3 flex items-baseline gap-1">
            <span className="font-display text-3xl font-semibold text-foreground">{plan.price}</span>
            {plan.period && <span className="text-sm text-muted">{plan.period}</span>}
          </div>
          <p className="mt-2 text-sm text-muted">{plan.description}</p>

          <ul className="mt-6 flex flex-1 flex-col gap-3">
            {plan.features.map((feature) => (
              <li key={feature} className="flex items-start gap-2 text-sm text-foreground">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent-hover" strokeWidth={1.75} />
                {feature}
              </li>
            ))}
          </ul>

          <ButtonLink href="/registro" variant={plan.highlighted ? "primary" : "secondary"} className="mt-8 w-full">
            {plan.cta}
          </ButtonLink>
        </div>
      ))}
    </div>
  );
}
