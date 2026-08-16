"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ParallaxField, ParallaxLayer } from "@/components/marketing/Parallax";
import { BookStack, Pencil, ExamCard } from "@/components/marketing/StudyIcons";
import { PLAN_PREVIEW, FIXED_LEVEL_BAR_CLASS } from "@/components/marketing/visualData";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.18, delayChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const } },
};

function DashboardPreview() {
  return (
    <div className="mx-auto w-full max-w-2xl rounded-2xl border border-[#e8e8e5] bg-white p-6 shadow-soft sm:p-8">
      <p className="text-sm text-[#4b4b4f]">Buenas tardes, Alex 👋</p>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-medium tracking-wide text-[#4b4b4f] uppercase">Tu preparación</p>
          <p className="mt-1 text-sm font-medium text-[#111111]">Matemáticas · Examen en 6 días</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-3xl font-semibold text-[#111111]">72%</span>
          <span className="rounded-full bg-[#b4790a]/10 px-2.5 py-1 text-xs font-medium text-[#b4790a]">
            Bien preparado
          </span>
        </div>
      </div>
      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-[#e8e8e5]">
        <div className="h-full rounded-full bg-[#b4790a]" style={{ width: "72%" }} />
      </div>

      <div className="mt-6 border-t border-[#e8e8e5] pt-6">
        <p className="text-xs font-medium tracking-wide text-[#4b4b4f] uppercase">Tu plan de hoy</p>
        <div className="mt-3 flex flex-col divide-y divide-[#e8e8e5]">
          {PLAN_PREVIEW.map((item) => (
            <div key={item.title} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
              <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${FIXED_LEVEL_BAR_CLASS[item.level]}`} />
              <div className="flex-1">
                <p className="text-sm font-medium text-[#111111]">{item.title}</p>
                <p className="text-xs text-[#4b4b4f]">{item.reason}</p>
              </div>
              <span className="shrink-0 text-xs font-medium text-[#4b4b4f]">{item.minutes} min</span>
            </div>
          ))}
        </div>
      </div>

      <Link href="/registro" className="mt-6 block">
        <Button className="w-full">
          Empezar sesión
          <ArrowRight className="h-4 w-4" />
        </Button>
      </Link>
    </div>
  );
}

export function HeroScene() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });

  // Al hacer scroll: el texto se va primero, la tarjeta un poco después
  // (con un ligero acercamiento, no solo fade) — fondo blanco fijo, ya no
  // hay foto que fundir a color sólido.
  const contentOpacity = useTransform(scrollYProgress, [0, 0.45], [1, 0]);
  const contentY = useTransform(scrollYProgress, [0, 0.45], [0, -40]);
  const mockupOpacity = useTransform(scrollYProgress, [0.15, 0.7], [1, 0]);
  const mockupY = useTransform(scrollYProgress, [0.15, 0.7], [0, -30]);
  const mockupScale = useTransform(scrollYProgress, [0, 0.7], [1, 1.06]);

  return (
    <ParallaxField ref={heroRef} className="relative overflow-hidden bg-background">
      <section className="relative px-4 pt-24 pb-20">
        <ParallaxLayer
          depth={0.6}
          className="pointer-events-none absolute top-24 left-[6%] hidden w-28 sm:block lg:left-[12%] lg:w-36"
        >
          <BookStack className="w-full drop-shadow-none" />
        </ParallaxLayer>
        <ParallaxLayer
          depth={0.9}
          className="pointer-events-none absolute top-20 right-[8%] hidden w-24 sm:block lg:right-[14%] lg:w-32"
        >
          <Pencil className="w-full" />
        </ParallaxLayer>
        <ParallaxLayer
          depth={0.75}
          className="pointer-events-none absolute top-56 right-[4%] hidden w-24 sm:block lg:right-[8%] lg:w-28"
        >
          <ExamCard className="w-full" />
        </ParallaxLayer>

        <motion.div
          style={{ opacity: contentOpacity, y: contentY }}
          className="relative mx-auto flex w-full max-w-3xl flex-col items-center text-center"
        >
          <motion.div variants={container} initial="hidden" animate="show" className="contents">
            <motion.span
              variants={item}
              className="inline-flex items-center gap-1.5 rounded-full border border-accent/20 bg-accent-soft px-3 py-1 text-xs font-medium text-accent-hover"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Tu copiloto de estudio con IA
            </motion.span>
            <motion.h1
              variants={item}
              className="mt-6 text-4xl leading-[1.1] font-semibold tracking-tight text-foreground sm:text-5xl"
            >
              Sabe qué estudiar
              <br />
              antes de tu próximo examen.
            </motion.h1>
            <motion.p variants={item} className="mt-6 max-w-xl text-lg text-muted">
              Respondes un diagnóstico corto, HeyStudy detecta lo que no dominas y arma tu plan de estudio del día.
            </motion.p>
            <motion.div variants={item} className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:gap-4">
              <Link href="/registro" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto">
                  Empezar gratis
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <a href="#como-funciona" className="w-full sm:w-auto">
                <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                  Ver cómo funciona
                </Button>
              </a>
            </motion.div>
          </motion.div>
        </motion.div>

        <ParallaxLayer depth={1.1} className="relative mx-auto mt-16 w-full max-w-5xl">
          <motion.div style={{ opacity: mockupOpacity, y: mockupY, scale: mockupScale }}>
            <motion.div
              initial={{ opacity: 0, y: 32, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <DashboardPreview />
            </motion.div>
          </motion.div>
        </ParallaxLayer>
      </section>
    </ParallaxField>
  );
}
