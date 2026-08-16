"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { ArrowRight, PlayCircle } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/Button";
import { ParallaxField, ParallaxLayer } from "@/components/marketing/Parallax";
import { DAILY_PLAN, EXAM_CONTEXT, FIXED_LEVEL_BAR_CLASS } from "@/components/marketing/visualData";

function HeroMascot() {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      aria-hidden
      className="pointer-events-none absolute top-6 right-[6%] hidden w-20 sm:block lg:right-[12%] lg:w-24"
      initial={{ opacity: 0, y: 10 }}
      animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: [0, -10, 0] }}
      transition={
        reduceMotion
          ? { duration: 0.6, delay: 0.4 }
          : { opacity: { duration: 0.6, delay: 0.4 }, y: { duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.6 } }
      }
    >
      <Image src="/mascot/mascota-saludo.png" alt="" width={193} height={144} className="w-full" />
    </motion.div>
  );
}

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const } },
};

function DashboardPreview() {
  return (
    <div className="mx-auto w-full max-w-2xl overflow-hidden rounded-2xl border border-border bg-surface shadow-xl">
      {/* Barra de "ventana" — vende que esto es una captura de producto,
          no una ilustración. Puntos neutros, no semáforo mac genérico. */}
      <div className="flex items-center gap-4 border-b border-border bg-surface-elevated px-5 py-3">
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-border-strong/50" />
          <span className="h-2 w-2 rounded-full bg-border-strong/50" />
          <span className="h-2 w-2 rounded-full bg-border-strong/50" />
        </div>
        <div className="flex-1 rounded-md bg-background px-3 py-1 text-center text-[11px] text-subtle">
          app.heystudy.com/hoy
        </div>
      </div>

      <div className="p-6 sm:p-7">
        <p className="text-sm text-muted">
          Buenos días, <span className="font-medium text-foreground">Alex</span>
        </p>
        <p className="text-xs text-subtle">Esto es lo que necesitas hoy.</p>

        <div className="mt-5 rounded-xl border border-border bg-background p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold tracking-wide text-subtle uppercase">
                Preparación · {EXAM_CONTEXT.subject}
              </p>
              <p className="mt-0.5 text-xs text-muted">Examen en {EXAM_CONTEXT.daysLeft} días</p>
            </div>
            <span className="font-display text-2xl font-semibold text-foreground tabular-nums">
              {EXAM_CONTEXT.readiness}%
            </span>
          </div>
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-border">
            <div className="h-full rounded-full bg-accent" style={{ width: `${EXAM_CONTEXT.readiness}%` }} />
          </div>
        </div>

        <p className="mt-6 text-[11px] font-semibold tracking-wide text-subtle uppercase">Hoy</p>
        <div className="mt-3 flex flex-col gap-3">
          {DAILY_PLAN.map((task) => (
            <div key={task.topic} className="rounded-xl border border-border bg-background p-3.5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-medium tracking-wide text-subtle uppercase">{task.subject}</p>
                  <p className="mt-0.5 text-sm font-medium text-foreground">{task.topic}</p>
                </div>
                <span className="shrink-0 text-xs font-medium text-muted tabular-nums">{task.minutes} min</span>
              </div>
              <div className="mt-2.5 h-1 w-full overflow-hidden rounded-full bg-border">
                <div className={`h-full rounded-full ${FIXED_LEVEL_BAR_CLASS[task.level]}`} style={{ width: "58%" }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function HeroScene() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });

  const contentOpacity = useTransform(scrollYProgress, [0, 0.45], [1, 0]);
  const contentY = useTransform(scrollYProgress, [0, 0.45], [0, -30]);
  const mockupOpacity = useTransform(scrollYProgress, [0.15, 0.7], [1, 0]);
  const mockupY = useTransform(scrollYProgress, [0.15, 0.7], [0, -24]);

  return (
    <ParallaxField ref={heroRef} className="relative overflow-hidden bg-background">
      {/* Textura sutil: puntos casi invisibles + un resplandor tenue detrás
          del producto — profundidad sin gradient genérico de startup. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.5]"
        style={{
          backgroundImage: "radial-gradient(var(--border) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          maskImage: "radial-gradient(ellipse 70% 60% at 50% 0%, black 30%, transparent 75%)",
          WebkitMaskImage: "radial-gradient(ellipse 70% 60% at 50% 0%, black 30%, transparent 75%)",
        }}
      />

      <section className="relative px-6 pt-16 pb-20 sm:px-8 sm:pt-24 sm:pb-28">
        <HeroMascot />
        <motion.div
          style={{ opacity: contentOpacity, y: contentY }}
          className="relative mx-auto flex w-full max-w-3xl flex-col items-center text-center"
        >
          <motion.div variants={container} initial="hidden" animate="show" className="contents">
            <motion.span
              variants={item}
              className="inline-flex items-center rounded-full border border-border bg-surface px-3.5 py-1.5 text-xs font-semibold tracking-wide text-accent-hover uppercase"
            >
              Tu estudio, con dirección
            </motion.span>
            <motion.h1
              variants={item}
              className="mt-7 font-display text-5xl leading-[1.05] font-semibold tracking-tight text-foreground sm:text-6xl"
            >
              ¿Qué deberías
              <br />
              estudiar hoy?
            </motion.h1>
            <motion.p variants={item} className="mt-6 max-w-xl text-lg text-muted">
              HeyStudy analiza lo que realmente dominas, detecta tus puntos débiles y convierte tu próximo examen en
              un plan claro para hoy.
            </motion.p>
            <motion.div variants={item} className="mt-9 flex flex-col items-center gap-3 sm:flex-row sm:gap-4">
              <ButtonLink href="/registro" size="lg" className="w-full sm:w-auto">
                Empezar gratis
                <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
              </ButtonLink>
              <a href="#como-funciona" className="w-full sm:w-auto">
                <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                  <PlayCircle className="h-4 w-4" strokeWidth={1.75} />
                  Ver cómo funciona
                </Button>
              </a>
            </motion.div>
          </motion.div>
        </motion.div>

        <ParallaxLayer depth={0.3} className="relative mx-auto mt-16 w-full max-w-5xl sm:mt-20">
          <motion.div style={{ opacity: mockupOpacity, y: mockupY }}>
            <motion.div
              initial={{ opacity: 0, y: 28, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <DashboardPreview />
            </motion.div>
          </motion.div>
        </ParallaxLayer>
      </section>
    </ParallaxField>
  );
}
