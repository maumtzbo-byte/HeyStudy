"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";

/* ----------------------------------------------------------------------- */
/* Hero conducido por el personaje.                                         */
/*                                                                          */
/* El orden está invertido a propósito: mascota → acción → etiqueta →        */
/* titular. Funciona porque el personaje carga la primera pantalla solo y    */
/* el producto ya se explica a fondo en los frames de abajo, así que el      */
/* hero no tiene que probar nada — sólo tiene que detenerte.                 */
/*                                                                          */
/* Todo centrado y sin tarjetas flotantes ni textura de fondo: cualquier     */
/* elemento extra aquí le quita escala a la mascota, que es el punto.        */
/* ----------------------------------------------------------------------- */

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const } },
};

export function HeroScene() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="relative overflow-hidden bg-background">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="mx-auto flex w-full max-w-[1280px] flex-col items-center px-6 pt-6 pb-16 text-center sm:px-8 sm:pt-8 sm:pb-20"
      >
        {/* La mascota entra primero y ocupa casi todo el ancho: es la única
            pieza de marca que el visitante reconoce antes de leer nada. */}
        <motion.div
          variants={item}
          animate={reduceMotion ? undefined : { y: [0, -14, 0] }}
          transition={
            reduceMotion ? undefined : { duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.9 }
          }
        >
          <Image
            src="/mascot/mascota-feliz.png"
            alt=""
            aria-hidden
            width={351}
            height={263}
            priority
            className="pointer-events-none w-[min(21rem,88vw)] sm:w-[26rem] lg:w-[33rem]"
          />
        </motion.div>

        {/* Acción antes que titular, como en la referencia. */}
        <motion.div variants={item} className="mt-8 sm:mt-10">
          <ButtonLink href="/registro" size="lg" className="rounded-full px-8">
            Empezar gratis
            <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
          </ButtonLink>
        </motion.div>

        <motion.p
          variants={item}
          className="mt-7 rounded-full border border-border-strong/50 px-4 py-1.5 text-sm font-medium text-accent sm:mt-8"
        >
          Estudio dirigido con IA
        </motion.p>

        <motion.h1
          variants={item}
          className="mt-7 max-w-[16ch] font-display text-[2.9rem] leading-[0.98] font-semibold tracking-[-0.035em] text-foreground sm:mt-8 sm:max-w-[18ch] sm:text-6xl sm:leading-[1] lg:text-[4.5rem]"
        >
          ¿Qué deberías <span className="text-accent">estudiar hoy?</span>
        </motion.h1>

        <motion.p
          variants={item}
          className="mt-5 max-w-xl text-base leading-relaxed text-muted sm:mt-6 sm:text-lg"
        >
          HeyStudy detecta lo que <strong className="font-semibold text-foreground">todavía no dominas</strong> y
          convierte tu próximo examen en un plan claro para hoy.
        </motion.p>

        <motion.a
          variants={item}
          href="#como-funciona"
          className="mt-7 text-sm font-medium text-muted underline-offset-4 hover:text-foreground hover:underline"
        >
          Ver cómo funciona
        </motion.a>
      </motion.div>
    </section>
  );
}
