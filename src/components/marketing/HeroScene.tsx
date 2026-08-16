"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, PlayCircle, TrendingUp } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/Button";

// Hero compacto (≈1 pantalla): sin scroll-jacking. La sensación "premium"
// viene de la composición y de una entrada escalonada, no de secuestrar el
// scroll — que es justo lo que hacen Linear/Khanmigo y el resto de
// referencias de presupuesto alto.

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.04 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const } },
};

// Tarjeta flotante: entra con fade+scale y después respira con un loop
// vertical suave. Se apaga por completo con prefers-reduced-motion.
function Floating({
  children,
  className,
  delay = 0,
  distance = 10,
  duration = 5,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  distance?: number;
  duration?: number;
}) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, scale: 0.92 }}
      animate={reduceMotion ? { opacity: 1, scale: 1 } : { opacity: 1, scale: 1, y: [0, -distance, 0] }}
      transition={
        reduceMotion
          ? { duration: 0.35, delay }
          : {
              opacity: { duration: 0.5, delay },
              scale: { duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] },
              y: { duration, repeat: Infinity, ease: "easeInOut", delay: delay + 0.5 },
            }
      }
    >
      {children}
    </motion.div>
  );
}

const HERO_FACTS = [
  { top: "Diagnóstico", bottom: "con IA" },
  { top: "Plan nuevo", bottom: "cada día" },
  { top: "Gratis para", bottom: "empezar" },
];

export function HeroScene() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="relative overflow-hidden bg-background">
      {/* Textura de fondo + resplandores suaves */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          backgroundImage: "radial-gradient(var(--border) 1px, transparent 1px)",
          backgroundSize: "30px 30px",
          maskImage: "radial-gradient(ellipse 80% 70% at 50% 0%, black 25%, transparent 78%)",
          WebkitMaskImage: "radial-gradient(ellipse 80% 70% at 50% 0%, black 25%, transparent 78%)",
        }}
      />

      <div className="relative mx-auto grid w-full max-w-[1280px] grid-cols-1 items-center gap-6 px-6 pt-12 pb-14 sm:gap-12 sm:px-8 sm:pt-20 sm:pb-24 lg:grid-cols-[1.05fr_1fr] lg:gap-10">
        {/* Columna izquierda — mensaje */}
        <motion.div variants={container} initial="hidden" animate="show" className="max-w-xl">
          {/* Etiqueta discreta con filete, no una píldora con destello: la
              píldora con ✨ es la firma visual de landing generada, y esta
              página la repetía en cada sección. */}
          <motion.p
            variants={item}
            className="flex items-center gap-3 text-xs font-semibold tracking-[0.14em] text-muted uppercase"
          >
            <span aria-hidden className="h-px w-8 bg-border-strong" />
            Tu estudio, con dirección
          </motion.p>

          <motion.h1
            variants={item}
            className="mt-5 font-display text-[2.6rem] leading-[1.05] font-semibold tracking-tight text-foreground sm:mt-6 sm:text-6xl sm:leading-[1.02] lg:text-[4.25rem]"
          >
            ¿Qué deberías
            <br />
            <span className="text-accent">estudiar hoy?</span>
          </motion.h1>

          <motion.p variants={item} className="mt-5 text-base leading-relaxed text-muted sm:mt-6 sm:text-lg">
            HeyStudy detecta lo que <strong className="font-semibold text-foreground">todavía no dominas</strong> y
            convierte tu próximo examen en un plan claro para hoy.
          </motion.p>

          <motion.div variants={item} className="mt-7 flex flex-col gap-3 sm:mt-9 sm:flex-row sm:gap-4">
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

          {/* Sin tarjeta ni chips de ícono: una regla superior y tres datos.
              El "ícono Lucide en cuadrito pastel" era el patrón más copiado
              de la página. */}
          <motion.div variants={item} className="mt-8 flex gap-6 border-t border-border pt-5 sm:mt-12 sm:gap-12 sm:pt-6">
            {HERO_FACTS.map(({ top, bottom }) => (
              <p key={top} className="text-sm leading-tight text-muted">
                {top}
                <br />
                <span className="font-semibold text-foreground">{bottom}</span>
              </p>
            ))}
          </motion.div>
        </motion.div>

        {/* Columna derecha — escena con mascota y tarjetas de producto */}
        <div className="relative flex min-h-[290px] items-center justify-center sm:min-h-[440px] lg:min-h-[520px]">


          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 14 }}
            animate={reduceMotion ? { opacity: 1, scale: 1, y: 0 } : { opacity: 1, scale: 1, y: [0, -12, 0] }}
            transition={
              reduceMotion
                ? { duration: 0.4 }
                : {
                    opacity: { duration: 0.6, delay: 0.15 },
                    scale: { duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] },
                    y: { duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.7 },
                  }
            }
            className="relative"
          >
            <Image
              src="/mascot/mascota-lectura.png"
              alt=""
              aria-hidden
              width={338}
              height={270}
              priority
              className="pointer-events-none w-[15rem] sm:w-[19rem] lg:w-[21rem]"
            />
          </motion.div>

          {/* Burbuja: la pregunta que resuelve el producto */}
          <Floating
            delay={0.45}
            duration={5.6}
            className="absolute -top-2 -right-2 sm:top-[4%] sm:right-0 lg:-right-2"
          >
            <div className="max-w-[13rem] rounded-2xl rounded-br-md border border-border bg-surface px-4 py-3 shadow-lg">
              <p className="text-sm leading-snug font-medium text-foreground">
                ¿Qué debería <span className="text-accent">estudiar</span> hoy?
              </p>
            </div>
          </Floating>

          {/* Tarjeta: preparación de examen */}
          <Floating
            delay={0.6}
            duration={6.4}
            distance={12}
            className="absolute bottom-0 -left-2 sm:bottom-[8%] sm:left-0 lg:-left-6"
          >
            <div className="w-[11.5rem] rounded-2xl border border-border bg-surface p-4 shadow-lg">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[10px] font-semibold tracking-wide text-subtle uppercase">Preparación</p>
                <span className="font-display text-lg leading-none font-semibold text-foreground tabular-nums">
                  72%
                </span>
              </div>
              <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-border">
                <motion.div
                  className="h-full rounded-full bg-accent"
                  initial={{ width: 0 }}
                  animate={{ width: "72%" }}
                  transition={{ duration: reduceMotion ? 0 : 1.1, delay: 1, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>
              <p className="mt-2 text-[11px] text-muted">Matemáticas · en 6 días</p>
            </div>
          </Floating>

          {/* Chip: tema débil detectado */}
          <Floating
            delay={0.75}
            duration={5.2}
            distance={8}
            className="absolute right-[4%] bottom-[34%] hidden sm:block lg:right-0"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3.5 py-2 shadow-lg">
              <TrendingUp className="h-3.5 w-3.5 shrink-0 text-premium" strokeWidth={2} />
              <span className="text-xs font-medium text-foreground">Factorización · 41%</span>
            </div>
          </Floating>
        </div>
      </div>
    </section>
  );
}
