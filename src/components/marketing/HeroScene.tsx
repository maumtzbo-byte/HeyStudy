"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, ChevronDown, PlayCircle } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";

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
  const reduceMotion = useReducedMotion();

  return (
    <section className="relative overflow-hidden bg-background">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="mx-auto flex w-full max-w-[1280px] flex-col items-center px-6 pt-6 pb-12 text-center sm:px-8 sm:pt-8 sm:pb-16"
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
          {/* El PNG mide 351x263, pero el cuerpo sólo ocupa 300x238: la chispa
              es un componente suelto arriba a la derecha que estira el marco.
              Encuadrar contra el archivo dejaba al personaje descentrado y un
              15% más chico de lo que aparenta.

              La chispa (x300-338, filas 12-56) se traslapa con el cuerpo, que
              llega a x=311 en las filas 152-214, así que ningún rectángulo
              contiene el cuerpo entero y excluye la chispa. Se recortan 12px
              de cada brazo — simétrico, para que lea como encuadre cerrado y
              no como un lado cortado. El archivo no se toca: todo es CSS. */}
          <div
            className="relative w-[94vw] max-w-[31rem] overflow-hidden sm:w-[26rem] sm:max-w-none lg:w-[32rem]"
            style={{ aspectRatio: "276 / 238" }}
          >
            <Image
              src="/mascot/mascota-feliz.png"
              alt=""
              aria-hidden
              width={351}
              height={263}
              priority
              className="pointer-events-none absolute top-[-5.46%] left-[-8.7%] w-[127.2%] max-w-none"
            />
          </div>
        </motion.div>

        {/* Acciones antes que titular, como en la referencia. */}
        <motion.div variants={item} className="mt-7 w-full max-w-sm sm:mt-9">
          <ButtonLink
            href="/registro"
            size="lg"
            className="w-full rounded-full shadow-[0_12px_32px_-8px_var(--accent)]"
          >
            Comenzar gratis
            <ArrowRight className="h-4 w-4" strokeWidth={2} />
          </ButtonLink>
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

        <motion.h1
          variants={item}
          className="mt-9 font-display text-[2.4rem] leading-[1.06] font-extrabold tracking-[-0.04em] text-foreground sm:mt-11 sm:text-6xl lg:text-[4.5rem]"
        >
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
