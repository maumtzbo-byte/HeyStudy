"use client";

import { motion, useReducedMotion } from "framer-motion";

// Testimonios ilustrativos del tipo de resultado que HeyStudy busca dar —
// no son citas de usuarios reales todavía (producto en etapa MVP).
const TESTIMONIALS = [
  {
    quote:
      "Antes repasaba todo el libro por igual. Ahora sé exactamente qué tema me está bajando el promedio antes de siquiera abrir mis apuntes.",
    name: "Valentina R.",
    role: "Estudiante de Cálculo II",
  },
  {
    quote:
      "El diagnóstico detectó que confundía el mismo tipo de error una y otra vez en factorización. Verlo explicado así cambió cómo estudio.",
    name: "Diego M.",
    role: "Preparatoria, área de Ciencias",
  },
  {
    quote:
      "Subí mis guías de estudio y en minutos tenía un plan del día enfocado solo en lo que de verdad no dominaba.",
    name: "Camila S.",
    role: "Estudiante de Química General",
  },
];

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

// Desfase vertical sutil por tarjeta para romper el patrón genérico de
// "3 tarjetas idénticas en fila" — misma grid, pero con ritmo, no una fila plana.
const OFFSET_CLASS = ["sm:mt-0", "sm:mt-8", "sm:mt-2"];

export function Testimonials() {
  const reduceMotion = useReducedMotion();

  return (
    <div className="mx-auto grid w-full max-w-5xl grid-cols-1 gap-4 sm:grid-cols-3">
      {TESTIMONIALS.map((testimonial, i) => (
        <motion.div
          key={testimonial.name}
          initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 16, filter: "blur(4px)" }}
          whileInView={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: reduceMotion ? 0.15 : 0.6, delay: reduceMotion ? 0 : 0.1 * i, ease: [0.22, 1, 0.36, 1] }}
          className={`flex flex-col rounded-2xl border border-border bg-surface p-6 shadow-soft ${OFFSET_CLASS[i % OFFSET_CLASS.length]}`}
        >
          <p className="flex-1 text-sm text-foreground">&ldquo;{testimonial.quote}&rdquo;</p>
          <div className="mt-6 flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-soft text-xs font-semibold text-accent-hover">
              {initials(testimonial.name)}
            </span>
            <div>
              <p className="text-sm font-medium text-foreground">{testimonial.name}</p>
              <p className="text-xs text-muted">{testimonial.role}</p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
