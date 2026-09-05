"use client";

import { useId, useState, type ReactNode } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { LogoMark } from "@/components/ui/Logo";
import { Reveal } from "@/components/marketing/Reveal";
import { CapsuleRow } from "@/components/ui/Capsule";

/* ----------------------------------------------------------------------- */
/* Secciones de HeyStudy en el lenguaje visual del hero de Mainframe:       */
/* negro sobre crema, sin degradados, tipografía grande, pills y subrayados */
/* en vez de tarjetas de color. El copy es el mismo que ya existía en la    */
/* landing anterior (Pricing.tsx, Faq.tsx, Comparison.tsx) — honesto, sin   */
/* cifras ni testimonios inventados — sólo cambia el traje visual.          */
/* ----------------------------------------------------------------------- */

function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="flex items-center gap-2 text-[13px] font-medium tracking-[0.08em] text-muted uppercase">
      <span aria-hidden>✳︎</span>
      {children}
    </p>
  );
}

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h2
      className="mt-4 max-w-2xl text-[32px] leading-[1.1] font-medium tracking-tight text-foreground sm:text-[44px]"
      style={{ fontFamily: "var(--font-heading)" }}
    >
      {children}
    </h2>
  );
}

// Tres densidades, asignadas por papel narrativo y no por costumbre. Antes
// las ocho secciones compartían el mismo py-20/28, y el resultado era una
// lista en vez de una narración: el scroll no acumulaba tensión porque cada
// sección prometía exactamente lo mismo que la anterior.
const DENSITY = {
  // Silencio: para el momento emocional y para el cierre.
  breathed: "py-28 sm:py-40",
  // El ritmo por defecto de las secciones que argumentan.
  normal: "py-20 sm:py-28",
  // Referencia y letra chica: comparación, preguntas, precios.
  compact: "py-14 sm:py-18",
} as const;

function Section({
  id,
  children,
  density = "normal",
  className = "",
}: {
  id?: string;
  children: ReactNode;
  density?: keyof typeof DENSITY;
  className?: string;
}) {
  return (
    <section
      id={id}
      className={`scroll-mt-20 border-t border-border px-5 sm:px-8 md:px-10 ${DENSITY[density]} ${className}`}
    >
      <div className="mx-auto w-full max-w-[1180px]">{children}</div>
    </section>
  );
}

/* ------------------------------- El hueco -------------------------------- */

// La sección que faltaba, y la que la Fase 3 señaló como imprescindible: es
// la verdad emocional que hace que todo lo demás importe. Sin ella la página
// pasa de "¿qué no sabes?" a "así funciona el producto" sin explicar nunca
// por qué el problema existe.
//
// El tono es reconocimiento, no acusación. El estudiante no es flojo: está
// haciendo justo lo que se siente bien hacer, y por eso no funciona.
//
// Sin cifras, sin estudios citados, sin datos inventados. Sólo una
// observación que cualquiera que haya estudiado para un examen reconoce.
export function ElHueco() {
  return (
    <Section id="el-hueco" density="breathed">
      <Reveal>
        <Eyebrow>El hueco</Eyebrow>
        <SectionTitle>Estudias lo que ya sabes, porque se siente bien.</SectionTitle>
      </Reveal>
      <Reveal>
        <div className="mt-10 grid gap-10 md:grid-cols-12 md:gap-16">
          <div className="md:col-span-7">
            <p className="max-w-prose text-lg leading-relaxed text-muted">
              Repasar un tema que dominas se siente productivo: entiendes todo, avanzas rápido, terminas
              tranquilo. Abrir el que no entiendes se siente al revés. Así que sin darte cuenta pasas más
              horas donde menos falta hacen.
            </p>
            <p className="mt-5 max-w-prose text-lg leading-relaxed text-foreground">
              El examen no pregunta por las horas. Pregunta por los huecos.
            </p>
          </div>

          {/* El argumento, dicho con el sistema en vez de con una ilustración:
              donde ya hay medición se ve el nivel; donde no la hay, gris. Y
              gris no significa "malo" — significa que nadie ha mirado ahí. */}
          <div className="md:col-span-5">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <span className="text-xs font-medium tracking-[0.08em] text-subtle uppercase">
                  Lo que repasas
                </span>
                <CapsuleRow fills={[0.9, 0.85, 0.95]} />
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-xs font-medium tracking-[0.08em] text-subtle uppercase">
                  Lo que entra al examen
                </span>
                <CapsuleRow fills={[0.9, 0.85, 0.95, null, null, null, null, null]} />
              </div>
            </div>
          </div>
        </div>
      </Reveal>
    </Section>
  );
}

/* ------------------------------- Cómo funciona --------------------------- */

const STEPS = [
  {
    n: "01",
    title: "Diagnóstico con IA",
    body: "Respondes un set de preguntas por materia. No sólo revisamos si acertaste: analizamos el tipo de error para encontrar el patrón.",
  },
  {
    n: "02",
    title: "Mapa de conocimiento",
    body: "Cada tema con tu nivel real, para ver de un vistazo qué dominas y qué no — sin adivinar.",
  },
  {
    n: "03",
    title: "Plan de estudio diario",
    body: "Se reordena solo, priorizando lo que más te va a costar en el examen.",
  },
  {
    n: "04",
    title: "Tutor con IA",
    body: "Dudas resueltas al momento, sobre tus propios materiales — no un chat genérico.",
  },
];

export function HowItWorks() {
  return (
    <Section id="como-funciona">
      <Reveal>
        <Eyebrow>Cómo funciona</Eyebrow>
        <SectionTitle>De adivinar a saber, en cuatro pasos.</SectionTitle>
      </Reveal>

      <div className="mt-14 grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((step, i) => (
          <Reveal key={step.n} delay={i * 0.08}>
            <span
              className="text-[15px] text-subtle"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {step.n}
            </span>
            <h3 className="mt-3 text-lg font-medium text-foreground">{step.title}</h3>
            <p className="mt-2 text-[15px] leading-relaxed text-muted">{step.body}</p>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

/* ---------------------------------- Producto ------------------------------ */

const PRODUCTO_BULLETS = [
  "Basado en tus materias reales, no en un temario genérico.",
  "Prioriza lo que más te cuesta, no lo que ya sabes.",
  "Empieza gratis. Sin tarjeta, sin compromiso.",
];

// Mock estático del mapa de conocimiento — mismos tokens de color que ya
// usa el resto de la app por materia (subject.color), como acento chico
// (un punto), no como fondo sólido — consistente con el "sin tarjetas de
// color" del resto de esta landing.
const SHOWCASE_SUBJECTS = [
  { name: "Matemáticas", color: "#6d46e3", mastery: 78 },
  { name: "Historia", color: "#7e5e25", mastery: 52 },
  { name: "Biología", color: "#396a5a", mastery: 91 },
  { name: "Química", color: "#974535", mastery: 34 },
];

export function ProductShowcase() {
  return (
    <Section id="producto" className="bg-white">
      <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-20">
        <Reveal>
          <Eyebrow>Producto</Eyebrow>
          <SectionTitle>Para prepa, universidad y admisión.</SectionTitle>
          <ul className="mt-8 flex flex-col gap-4">
            {PRODUCTO_BULLETS.map((bullet) => (
              <li key={bullet} className="flex gap-3 border-t border-border pt-4 text-[15px] text-muted">
                <span aria-hidden className="mt-2 h-1 w-1 shrink-0 rounded-full bg-foreground" />
                {bullet}
              </li>
            ))}
          </ul>
          <Link
            href="/registro"
            className="mt-9 inline-flex items-center justify-center rounded-full border border-accent bg-accent px-6 py-3 text-[15px] text-white transition-colors duration-200 hover:border-accent-hover hover:bg-accent-hover"
          >
            Comenzar gratis
          </Link>
        </Reveal>
        <Reveal delay={0.15} className="flex items-center justify-center">
          <div
            aria-hidden="true"
            className="w-full max-w-sm rounded-[28px] border border-border bg-white p-6 shadow-[0_20px_60px_-24px_rgba(0,0,0,0.15)]"
          >
            <p className="text-xs font-medium tracking-wide text-subtle uppercase">Tus materias</p>
            <div className="mt-4 flex flex-col divide-y divide-border">
              {SHOWCASE_SUBJECTS.map((s) => (
                <div key={s.name} className="flex items-center justify-between gap-3 py-3">
                  <span className="flex items-center gap-2.5 text-sm text-foreground">
                    <span aria-hidden className="h-2 w-2 rounded-full" style={{ backgroundColor: s.color }} />
                    {s.name}
                  </span>
                  <span className="text-xs font-medium text-subtle">{s.mastery}%</span>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}

/* --------------------------------- Exámenes -------------------------------- */

const EXAMS = [
  {
    name: "EXANI-I",
    org: "CENEVAL",
    body: "Ingreso a bachillerato/prepa. Habilidad matemática y español, con base en el temario oficial de CENEVAL.",
  },
  {
    name: "EXANI-II",
    org: "CENEVAL",
    body: "Ingreso a licenciatura. Pensamiento matemático, comprensión lectora y pensamiento científico.",
  },
  {
    name: "ECOEMS",
    org: "Zona metropolitana CDMX",
    body: "El examen único para asignación a preparatorias públicas de la CDMX y zona conurbada (antes COMIPEMS).",
  },
  {
    name: "Examen UNAM",
    org: "DGAE",
    body: "Selección a nivel licenciatura: matemáticas, español y las materias de tu área académica.",
  },
  {
    name: "Examen IPN",
    org: "Nivel superior",
    body: "Habilidades matemáticas y verbales, más conocimientos específicos de tu área.",
  },
  {
    name: "PAA",
    org: "College Board",
    body: "La que piden el Tec de Monterrey y varias universidades privadas.",
  },
];

export function Exams() {
  return (
    <Section id="examenes" className="bg-white">
      <Reveal>
        <Eyebrow>Exámenes de admisión</Eyebrow>
        <SectionTitle>Nos basamos en el temario oficial de cada examen.</SectionTitle>
      </Reveal>

      <div className="mt-12 grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
        {EXAMS.map((exam, i) => (
          <Reveal key={exam.name} delay={(i % 3) * 0.08} className="border-t border-border pt-5">
            <p className="text-xs font-semibold tracking-wide text-subtle uppercase">{exam.org}</p>
            <h3 className="mt-1.5 text-lg font-medium text-foreground">{exam.name}</h3>
            <p className="mt-2 text-[15px] leading-relaxed text-muted">{exam.body}</p>
          </Reveal>
        ))}
      </div>

      <p className="mt-12 max-w-2xl text-xs leading-relaxed text-subtle">
        HeyStudy no está afiliado a CENEVAL, la UNAM, el IPN, College Board Latinoamérica ni a ECOEMS. Usamos los
        nombres de estos exámenes únicamente para describir para cuáles te ayudamos a prepararte, con base en sus
        temarios públicos.
      </p>
    </Section>
  );
}

/* -------------------------------- Comparativa ----------------------------- */

type Verdict = "yes" | "partial" | "no";

const COLUMNS = ["HeyStudy", "Por tu cuenta", "IA general", "Tutor particular"] as const;

const ROWS: { feature: string; values: [Verdict, Verdict, Verdict, Verdict] }[] = [
  { feature: "Detecta qué temas te fallan", values: ["yes", "no", "partial", "yes"] },
  { feature: "Te dice qué estudiar hoy", values: ["yes", "no", "partial", "partial"] },
  { feature: "Se reordena con tu progreso", values: ["yes", "no", "no", "partial"] },
  { feature: "Usa tus materias y tus fechas", values: ["yes", "partial", "no", "yes"] },
  { feature: "Disponible a cualquier hora", values: ["yes", "yes", "yes", "no"] },
  { feature: "Resuelve dudas en vivo, cara a cara", values: ["no", "no", "no", "yes"] },
  { feature: "Empieza gratis", values: ["yes", "yes", "partial", "no"] },
];

const VERDICT_GLYPH: Record<Verdict, string> = { yes: "✓", partial: "–", no: "✕" };
const VERDICT_LABEL: Record<Verdict, string> = { yes: "Sí", partial: "A medias", no: "No" };

export function Comparativa() {
  return (
    <Section id="comparativa" density="compact">
      <Reveal>
        <Eyebrow>Comparación</Eyebrow>
        <SectionTitle>Contra lo que de verdad compite HeyStudy.</SectionTitle>
      </Reveal>

      {/* Móvil — una tarjeta por criterio */}
      <Reveal delay={0.1} className="mt-12 md:hidden">
        <ul className="flex flex-col gap-3">
          {ROWS.map((row) => (
            <li key={row.feature} className="rounded-2xl border border-border p-4">
              <p className="text-sm font-medium text-foreground">{row.feature}</p>
              <div className="mt-4 grid grid-cols-4 gap-2">
                {row.values.map((v, i) => (
                  <div key={i} className={`flex flex-col items-center gap-1.5 rounded-xl px-1 py-2.5 ${i === 0 ? "bg-accent/10" : ""}`}>
                    <span
                      aria-label={VERDICT_LABEL[v]}
                      className={`text-base ${v === "yes" ? (i === 0 ? "text-accent" : "text-foreground") : "text-subtle"}`}
                    >
                      {VERDICT_GLYPH[v]}
                    </span>
                    <span className={`text-center text-[10px] leading-tight ${i === 0 ? "font-semibold text-foreground" : "text-subtle"}`}>
                      {COLUMNS[i]}
                    </span>
                  </div>
                ))}
              </div>
            </li>
          ))}
        </ul>
      </Reveal>

      {/* md+ — tabla completa */}
      <Reveal delay={0.1} className="mt-12 hidden md:block">
        <table className="w-full border-collapse text-left">
          <caption className="sr-only">
            Comparación de HeyStudy contra estudiar por tu cuenta, una IA de uso general y un tutor particular
          </caption>
          <thead>
            <tr>
              <th scope="col" className="w-[34%] pb-4" />
              {COLUMNS.map((col, i) => (
                <th
                  key={col}
                  scope="col"
                  className={`pb-4 text-center align-bottom text-sm ${i === 0 ? "font-semibold text-foreground" : "font-medium text-muted"}`}
                >
                  {i === 0 ? <span className="inline-block rounded-full bg-accent px-3 py-1.5 text-white">{col}</span> : col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row) => (
              <tr key={row.feature} className="border-t border-border">
                <th scope="row" className="py-4 pr-4 text-sm font-medium text-foreground">
                  {row.feature}
                </th>
                {row.values.map((v, i) => (
                  <td key={i} className={`py-4 text-center ${i === 0 ? "bg-accent/10" : ""}`}>
                    <span
                      aria-label={VERDICT_LABEL[v]}
                      className={`text-base ${v === "yes" ? (i === 0 ? "text-accent" : "text-foreground") : "text-subtle"}`}
                    >
                      {VERDICT_GLYPH[v]}
                    </span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </Reveal>
    </Section>
  );
}

/* ---------------------------------- Precios -------------------------------- */

const PLANS = [
  {
    name: "Gratis",
    price: "$0",
    description: "Para empezar a diagnosticar tus materias sin compromiso.",
    features: [
      "Diagnóstico con IA por materia",
      "Mapa de conocimiento",
      "Plan de estudio diario",
      "6 diagnósticos y 40 mensajes con el tutor al mes",
    ],
    cta: "Empezar gratis",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "Próximamente",
    description: "Para quienes quieren uso sin límites en cada examen.",
    features: [
      "Todo lo del plan Gratis",
      "Diagnósticos ilimitados y más a fondo",
      "500 mensajes con el tutor al mes",
      "100 respuestas del tutor en voz al mes",
    ],
    cta: "Avísame cuando esté listo",
    highlighted: true,
  },
];

export function Precios() {
  return (
    <Section id="precios" density="compact" className="bg-white">
      <Reveal>
        <Eyebrow>Precios</Eyebrow>
        <SectionTitle>Empieza gratis. Sin tarjeta.</SectionTitle>
      </Reveal>

      <div className="mx-auto mt-12 grid w-full max-w-3xl grid-cols-1 gap-5 sm:grid-cols-2">
        {PLANS.map((plan, i) => (
          <Reveal
            key={plan.name}
            delay={i * 0.1}
            className={`relative flex h-full flex-col rounded-2xl border p-7 sm:p-8 ${
              plan.highlighted ? "border-accent bg-accent text-white" : "border-border text-foreground"
            }`}
          >
            <p className={`text-xs font-semibold tracking-wide uppercase ${plan.highlighted ? "text-white/60" : "text-muted"}`}>
              {plan.name}
            </p>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="text-3xl font-medium" style={{ fontFamily: "var(--font-heading)" }}>
                {plan.price}
              </span>
            </div>
            <p className={`mt-2 text-sm ${plan.highlighted ? "text-white/70" : "text-muted"}`}>{plan.description}</p>

            <ul className="mt-6 flex flex-1 flex-col gap-3">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-sm">
                  <span aria-hidden className="mt-0.5">
                    ✓
                  </span>
                  {feature}
                </li>
              ))}
            </ul>

            <Link
              href="/registro"
              className={`mt-8 inline-flex w-full items-center justify-center rounded-full border px-6 py-3 text-[15px] transition-colors duration-200 ${
                plan.highlighted
                  ? "border-white bg-white text-accent hover:bg-transparent hover:text-white"
                  : "border-accent bg-accent text-white hover:border-accent-hover hover:bg-accent-hover"
              }`}
            >
              {plan.cta}
            </Link>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

/* ----------------------------------- FAQ ----------------------------------- */

const FAQ_ITEMS = [
  {
    question: "¿En qué se diferencia de simplemente repasar mis apuntes?",
    answer:
      "Repasar todo por igual desperdicia tiempo en lo que ya dominas. HeyStudy diagnostica qué tan bien conoces cada tema y arma tu plan alrededor de tus puntos débiles reales, no de una lista genérica de temario.",
  },
  {
    question: "¿Cómo funciona el diagnóstico con IA?",
    answer:
      "Respondes un set de preguntas generadas para tu materia. HeyStudy no solo revisa si acertaste: analiza el tipo de error para detectar patrones (por ejemplo, confundes signos al factorizar) y así ajustar tu plan.",
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
      "Sí. Tus materias, tareas y materiales quedan asociados solo a tu cuenta y no se comparten con otros usuarios ni se usan para nada fuera de generar tu propio diagnóstico y plan.",
  },
];

function FaqRow({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const reduceMotion = useReducedMotion();

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
          animate={{ rotate: open ? 45 : 0 }}
          transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 500, damping: 40 }}
          className="shrink-0 text-xl text-muted"
          aria-hidden
        >
          +
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={panelId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <p className="pr-8 pb-5 text-sm text-muted">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Faq() {
  return (
    <Section id="preguntas" density="compact">
      <Eyebrow>Preguntas frecuentes</Eyebrow>
      <SectionTitle>Lo que preguntan antes de empezar.</SectionTitle>

      <div className="mx-auto mt-12 w-full max-w-2xl">
        {FAQ_ITEMS.map((item) => (
          <FaqRow key={item.question} {...item} />
        ))}
      </div>
    </Section>
  );
}

/* ------------------------------- CTA final / Footer ------------------------ */

export function CtaFinal() {
  return (
    <Section density="breathed" className="bg-white text-center">
      <Reveal>
        <h2
          className="mx-auto max-w-2xl text-[32px] leading-[1.1] font-medium tracking-tight text-foreground sm:text-[48px]"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Deja de adivinar qué estudiar.
        </h2>
        <Link
          href="/registro"
          className="mt-9 inline-flex items-center justify-center rounded-full border border-accent bg-accent px-7 py-3.5 text-[15px] text-white transition-colors duration-200 hover:border-accent-hover hover:bg-accent-hover"
        >
          Comenzar gratis
        </Link>
      </Reveal>
    </Section>
  );
}

export function MainframeFooter() {
  return (
    <footer className="border-t border-border px-5 py-10 sm:px-8 md:px-10">
      <div className="mx-auto flex w-full max-w-[1180px] flex-col items-center justify-between gap-6 sm:flex-row">
        <div className="flex items-center gap-3">
          <span className="text-[18px] tracking-tight text-foreground" style={{ fontFamily: "var(--font-heading)" }}>
            HeyStudy
          </span>
          <LogoMark className="h-5 w-5 shrink-0 text-accent" />
        </div>
        {/* py-3 -my-3 agranda el área de toque a 44px sin cambiar el tamaño
            visual del pie: el objetivo crece, el diseño no se mueve. */}
        <nav className="flex items-center gap-6 text-sm text-muted">
          <Link href="/login" className="-my-3 py-3 transition-colors hover:text-foreground">
            Iniciar sesión
          </Link>
          <Link href="/terminos" className="-my-3 py-3 transition-colors hover:text-foreground">
            Términos
          </Link>
          <Link href="/privacidad" className="-my-3 py-3 transition-colors hover:text-foreground">
            Privacidad
          </Link>
        </nav>
        <p className="text-sm text-subtle">© {new Date().getFullYear()} HeyStudy</p>
      </div>
    </footer>
  );
}
