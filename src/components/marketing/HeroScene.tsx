"use client";

import { useRef, type PointerEvent as ReactPointerEvent } from "react";
import Image from "next/image";
import { motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { ArrowRight, ChevronDown, PlayCircle } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { Mascot3D } from "@/components/marketing/Mascot3D";
import { HEADING_HERO } from "@/lib/utils/typography";
import { cn } from "@/lib/utils/cn";

/* ----------------------------------------------------------------------- */
/* Hero conducido por el personaje.                                         */
/*                                                                          */
/* El orden está invertido a propósito: mascota → acciones → prueba →        */
/* titular. Funciona porque el personaje carga la primera pantalla solo y    */
/* el producto ya se explica a fondo en los frames de abajo, así que el      */
/* hero no tiene que probar nada — sólo tiene que detenerte.                 */
/*                                                                          */
/* Todo centrado y sin tarjetas flotantes ni textura de fondo: cualquier     */
/* elemento extra aquí le quita escala a la mascota, que es el punto.        */
/* ----------------------------------------------------------------------- */

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const } },
};

// Las tres poses de la mascota en vez de fotos de estudiantes: el cluster
// de avatares del mockup pide caras, y no tenemos usuarios reales que
// retratar. Estas son piezas de marca propias y la frase que las acompaña
// es verificable.
const POSES = [
  { src: "/mascot/mascota-feliz.png", cls: "z-30" },
  { src: "/mascot/mascota-lectura.png", cls: "-ml-3 z-20" },
  { src: "/mascot/mascota-saludo.png", cls: "-ml-3 z-10" },
];

export function HeroScene() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();

  // Profundidad al hacer scroll: la mascota se encoge y sube un poco
  // mientras el hero sale de pantalla, en vez de sólo desaparecer. Progreso
  // 0→1 va de "hero recién entrando arriba" a "hero a punto de salir por
  // arriba" — confinado al alto del propio hero, no toda la página.
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end start"] });
  const mascotY = useTransform(scrollYProgress, [0, 1], [0, reduceMotion ? 0 : -36]);
  const mascotScale = useTransform(scrollYProgress, [0, 1], [1, reduceMotion ? 1 : 0.94]);

  // CTA "magnético": se acerca unos px al cursor dentro de su propio botón,
  // mismo resorte que el tilt de la mascota (stiffness 140 / damping 18)
  // para que se sienta como el mismo sistema de física en todo el hero.
  const ctaX = useMotionValue(0);
  const ctaY = useMotionValue(0);
  const springConfig = { stiffness: 140, damping: 18, mass: 0.6 };
  const ctaSpringX = useSpring(ctaX, springConfig);
  const ctaSpringY = useSpring(ctaY, springConfig);

  function handleCtaPointerMove(e: ReactPointerEvent<HTMLDivElement>) {
    if (reduceMotion || e.pointerType === "touch") return;
    const rect = e.currentTarget.getBoundingClientRect();
    const relX = (e.clientX - rect.left) / rect.width - 0.5;
    const relY = (e.clientY - rect.top) / rect.height - 0.5;
    ctaX.set(relX * 12);
    ctaY.set(relY * 12);
  }

  function resetCta() {
    ctaX.set(0);
    ctaY.set(0);
  }

  return (
    <section ref={sectionRef} className="relative overflow-hidden bg-background">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="mx-auto flex w-full max-w-[1280px] flex-col items-center px-6 pt-6 pb-12 text-center sm:px-8 sm:pt-8 sm:pb-16"
      >
        {/* La mascota entra primero y ocupa casi todo el ancho: es la única
            pieza de marca que el visitante reconoce antes de leer nada. */}
        <motion.div variants={item} style={{ y: mascotY, scale: mascotScale }}>
          <Mascot3D className="w-[100vw] max-w-[32rem] sm:w-[30rem] sm:max-w-none lg:w-[37rem]" />
        </motion.div>

        {/* Acciones antes que titular, como en la referencia. */}
        <motion.div variants={item} className="mt-7 w-full max-w-sm sm:mt-9">
          <motion.div
            onPointerMove={handleCtaPointerMove}
            onPointerLeave={resetCta}
            style={{ x: ctaSpringX, y: ctaSpringY }}
          >
            <ButtonLink href="/registro" size="lg" className="w-full rounded-full">
              Comenzar gratis
              <ArrowRight className="h-4 w-4" strokeWidth={2} />
            </ButtonLink>
          </motion.div>
        </motion.div>

        <motion.a
          variants={item}
          href="#como-funciona"
          className="mt-3.5 inline-flex w-full max-w-sm items-center justify-center gap-2 rounded-full border border-accent/35 px-7 py-3.5 text-base font-medium text-accent transition-colors hover:border-accent/60 hover:bg-accent-soft"
        >
          <PlayCircle className="h-5 w-5" strokeWidth={1.75} />
          Ver cómo funciona
        </motion.a>

        {/* Fila de prueba. Sin cifras de usuarios: HeyStudy no las tiene
            todavía e inventarlas sería una afirmación falsa en producción. */}
        <motion.div variants={item} className="mt-8 flex items-center gap-3">
          <div className="flex shrink-0 items-center" aria-hidden>
            {POSES.map(({ src, cls }) => (
              <span
                key={src}
                className={`relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border-2 border-background bg-accent-soft ${cls}`}
              >
                <Image src={src} alt="" width={44} height={34} className="w-[1.9rem]" />
              </span>
            ))}
          </div>
          <p className="max-w-[19rem] text-left text-sm leading-snug text-muted">
            Para prepa, universidad y admisión.{" "}
            <span className="font-semibold text-accent">Gratis para empezar.</span>
          </p>
        </motion.div>

        <motion.h1 variants={item} className={cn(HEADING_HERO, "mt-9 text-foreground sm:mt-11")}>
          {/* Los saltos van forzados: dejados al flujo, "intención." queda
              pegado a "No" y se pierde el ritmo de tres líneas del mockup. */}
          Estudia con
          <br />
          <span className="text-accent">intención.</span>
          <br />
          No más a ciegas.
        </motion.h1>

        <motion.p
          variants={item}
          className="mt-5 max-w-lg text-base leading-relaxed text-muted sm:mt-6 sm:text-lg"
        >
          Diagnóstico inteligente, plan personalizado y tutor con IA. Todo en un solo lugar.
        </motion.p>

        <motion.a
          variants={item}
          href="#como-funciona"
          aria-label="Ir a la siguiente sección"
          className="mt-10 text-accent transition-transform hover:translate-y-0.5"
        >
          <ChevronDown className="h-7 w-7" strokeWidth={2.25} aria-hidden />
        </motion.a>
      </motion.div>
    </section>
  );
}
