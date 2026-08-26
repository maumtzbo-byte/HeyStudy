"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useTypewriter } from "@/lib/hooks/useTypewriter";
import { Mascot3D } from "@/components/marketing/Mascot3D";

const PILLS = [
  { label: "Ver cómo funciona", href: "#como-funciona" },
  { label: "Ver precios", href: "#precios" },
  { label: "Preguntas frecuentes", href: "#preguntas" },
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
        <div className="relative z-10 max-w-xl">
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

        <Mascot3D className="w-full max-w-[280px] shrink-0 sm:max-w-sm lg:max-w-md" />
      </div>
    </section>
  );
}
