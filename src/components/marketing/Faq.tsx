"use client";

import { useId, useState } from "react";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const FAQ_ITEMS = [
  {
    question: "¿En qué se diferencia de simplemente repasar mis apuntes?",
    answer:
      "Repasar todo por igual desperdicia tiempo en lo que ya dominas. HeyStudy diagnostica qué tan bien conoces cada tema y arma tu plan alrededor de tus puntos débiles reales, no de una lista genérica de temario.",
  },
  {
    question: "¿Cómo funciona el diagnóstico con IA?",
    answer:
      "Respondes un set de preguntas generadas para tu materia. HeyStudy no solo revisa si acertaste — analiza el tipo de error para detectar patrones (por ejemplo, confundes signos al factorizar) y así ajustar tu plan.",
  },
  {
    question: "¿Necesito subir materiales para empezar?",
    answer:
      "No es obligatorio. Puedes usar HeyStudy solo con el diagnóstico y el tutor IA. Subir tus apuntes o guías en PDF/imagen ayuda a que el plan se ajuste mejor al temario exacto de tu curso.",
  },
  {
    question: "¿HeyStudy es gratis?",
    answer:
      "Sí, puedes crear una cuenta y usar el diagnóstico, el mapa de conocimiento y el plan de estudio diario sin costo. El plan de pago existe para quienes quieren uso sin límites de diagnósticos y materiales analizados.",
  },
  {
    question: "¿Mis materiales y datos de estudio están seguros?",
    answer:
      "Sí. Tus materias, tareas y materiales quedan asociados solo a tu cuenta — no se comparten con otros usuarios ni se usan para nada fuera de generar tu propio diagnóstico y plan.",
  },
];

function FaqRow({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  return (
    <div className="border-b border-border last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={panelId}
        className="flex w-full items-center justify-between gap-4 py-5 text-left"
      >
        <span className="text-base font-medium text-foreground">{question}</span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 40 }}
          className="shrink-0 text-muted"
        >
          <ChevronDown className="h-5 w-5" />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={panelId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <p className="pb-5 pr-8 text-sm text-muted">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Faq() {
  return (
    <div className="mx-auto w-full max-w-2xl rounded-2xl border border-border bg-surface px-6 shadow-soft sm:px-8">
      {FAQ_ITEMS.map((faqItem) => (
        <FaqRow key={faqItem.question} {...faqItem} />
      ))}
    </div>
  );
}
