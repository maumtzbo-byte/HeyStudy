"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useTypewriter } from "@/lib/hooks/useTypewriter";

const PILLS = [
  { label: "Ver cómo funciona", href: "#como-funciona" },
  { label: "Ver precios", href: "#precios" },
  { label: "Preguntas frecuentes", href: "#preguntas" },
];

// Mock estático del plan de hoy — mismo lenguaje visual del resto de esta
// landing (bordes finos, negro/crema, un solo acento) en vez de las
// tarjetas de color sólido del dashboard, que se verían fuera de lugar
// aquí. Sustituye al mascota animado.
const HERO_MOCK_ITEMS = [
  { title: "Matemáticas", minutes: 20, done: true },
  { title: "Historia", minutes: 15, done: true },
  { title: "Biología", minutes: 25, done: false },
];

export function MainframeHero() {
  const { displayed, done } = useTypewriter(
    "Diagnosticamos qué sabes de verdad y armamos tu plan de estudio. ¿Con qué materia empezamos?",
  );
  const [pillsVisible, setPillsVisible] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => setPillsVisible(true), 400);
    return () => clearTimeout(id);
  }, []);

  return (
    <section className="relative flex min-h-screen flex-col justify-center px-5 pt-28 pb-16 sm:px-8 md:px-10">
      <div className="mx-auto flex w-full max-w-[1180px] flex-col items-center gap-12 lg:flex-row lg:justify-between lg:gap-10">
        <div
          aria-hidden="true"
          className="order-1 w-full max-w-[280px] shrink-0 sm:max-w-sm lg:order-2 lg:max-w-md"
        >
          <div className="rounded-[28px] border border-black/10 bg-white p-6 shadow-[0_20px_60px_-24px_rgba(0,0,0,0.15)]">
            <div className="flex items-center justify-between border-b border-black/10 pb-4">
              <span className="text-sm font-medium text-black/50">Racha</span>
              <span className="flex items-baseline gap-1">
                <span className="text-3xl font-semibold text-black" style={{ fontFamily: "var(--font-heading)" }}>
                  12
                </span>
                <span className="text-xs text-black/40">días</span>
              </span>
            </div>
            <div className="flex flex-col gap-3 pt-5">
              <p className="text-xs font-medium tracking-wide text-black/40 uppercase">Plan de hoy</p>
              {HERO_MOCK_ITEMS.map((item) => (
                <div key={item.title} className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-2 text-sm text-black/70">
                    <span aria-hidden className={`h-1.5 w-1.5 rounded-full ${item.done ? "bg-accent" : "bg-black/15"}`} />
                    {item.title}
                  </span>
                  <span className="text-xs text-black/40">{item.minutes} min</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="relative z-10 order-2 max-w-xl lg:order-1">
          <p
            className="mb-5 text-black sm:mb-6"
            style={{
              fontSize: "clamp(18px, 4vw, 26px)",
              lineHeight: 1.35,
              fontWeight: 400,
              minHeight: "54px",
            }}
          >
            {displayed}
            {!done && (
              <span
                aria-hidden
                className="ml-[2px] inline-block h-[1.1em] w-[2px] bg-black align-middle"
                style={{ animation: "mainframe-blink 1s step-end infinite" }}
              />
            )}
          </p>

          <div
            className="flex flex-wrap gap-y-1 transition-[opacity,transform] duration-[400ms] ease-out"
            style={{
              opacity: pillsVisible ? 1 : 0,
              transform: pillsVisible ? "translateY(0)" : "translateY(8px)",
            }}
          >
            {PILLS.map((pill) => (
              <a
                key={pill.href}
                href={pill.href}
                className="mx-[0.2em] mb-[0.4em] inline-flex items-center justify-center rounded-full border border-black/10 bg-white px-4 py-[0.3em] text-[13px] whitespace-nowrap text-black transition-colors duration-200 hover:bg-black hover:text-white sm:px-5 sm:text-[15px]"
              >
                {pill.label}
              </a>
            ))}
            <Link
              href="/registro"
              className="mx-[0.2em] mb-[0.4em] inline-flex items-center justify-center rounded-full border border-accent bg-accent px-4 py-[0.3em] text-[13px] whitespace-nowrap text-white transition-colors duration-200 hover:border-accent-hover hover:bg-accent-hover sm:px-5 sm:text-[15px]"
            >
              Comenzar gratis
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
