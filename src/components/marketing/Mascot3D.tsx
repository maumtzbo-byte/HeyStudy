"use client";

import { useRef } from "react";
import Image from "next/image";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import { cn } from "@/lib/utils/cn";

/* ----------------------------------------------------------------------- */
/* Mascota con volumen.                                                     */
/*                                                                          */
/* Lo que delata a una imagen plana no es que sea una imagen: es que no      */
/* reacciona a nada. Un objeto con volumen se inclina cuando lo miras de     */
/* lado, su brillo especular se corre, y proyecta sombra al piso. Eso es lo  */
/* que se recrea aquí sobre el PNG real, en vez de redibujar al personaje    */
/* con divs y gradientes — un rounded-[42%] da una esfera, no esta silueta   */
/* de orejas, brazos y patas, y el personaje dejaría de ser el suyo.        */
/*                                                                          */
/* Cuatro capas, de atrás hacia adelante:                                   */
/*   1. resplandor de color que late                                        */
/*   2. sombra de contacto elíptica que se corre y encoge con la inclinación */
/*   3. el personaje, inclinado en perspectiva hacia el cursor              */
/*   4. brillo especular recortado a su silueta con mask-image del propio    */
/*      PNG, que persigue al cursor                                         */
/* ----------------------------------------------------------------------- */

// Antes el PNG se recortaba contra el cuerpo para ganar tamaño, dejando la
// chispa fuera. Con la inclinación eso deja de funcionar: el canto recto de
// los brazos recortados queda a la vista en cuanto la pieza gira. Va
// completo, y la chispa deja de estorbar — con las partículas alrededor ya
// lee como parte de la escena.
const MAX_TILT = 11;

export function Mascot3D({ className }: { className?: string }) {
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);

  // -1..1 en cada eje, relativo al centro del personaje.
  const px = useMotionValue(0);
  const py = useMotionValue(0);

  const spring = { stiffness: 140, damping: 18, mass: 0.6 };
  const sx = useSpring(px, spring);
  const sy = useSpring(py, spring);

  const rotateY = useTransform(sx, [-1, 1], [-MAX_TILT, MAX_TILT]);
  const rotateX = useTransform(sy, [-1, 1], [MAX_TILT, -MAX_TILT]);

  // El especular va al lado contrario de la inclinación, como una luz fija.
  const shineX = useTransform(sx, [-1, 1], [72, 28]);
  const shineY = useTransform(sy, [-1, 1], [70, 26]);
  const shine = useMotionTemplate`radial-gradient(58% 48% at ${shineX}% ${shineY}%, rgba(255,255,255,0.55), rgba(255,255,255,0.12) 45%, transparent 72%)`;

  // La sombra de contacto se corre al lado opuesto y se acorta al inclinar.
  const shadowX = useTransform(sx, [-1, 1], [16, -16]);
  const shadowScale = useTransform(sy, [-1, 1], [1.06, 0.9]);

  function onPointerMove(e: React.PointerEvent) {
    if (reduceMotion || e.pointerType === "touch") return;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    px.set(Math.max(-1, Math.min(1, ((e.clientX - r.left) / r.width - 0.5) * 2)));
    py.set(Math.max(-1, Math.min(1, ((e.clientY - r.top) / r.height - 0.5) * 2)));
  }

  function reset() {
    px.set(0);
    py.set(0);
  }

  return (
    <div
      ref={ref}
      onPointerMove={onPointerMove}
      onPointerLeave={reset}
      className={cn("relative", className)}
      style={{ perspective: 1000 }}
    >
      {/* 1 — resplandor */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-[12%] rounded-full bg-accent/25 blur-[70px]"
        animate={reduceMotion ? undefined : { opacity: [0.55, 0.9, 0.55], scale: [0.94, 1.06, 0.94] }}
        transition={reduceMotion ? undefined : { duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* 2 — sombra de contacto */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute bottom-[3%] left-1/2 h-[5%] w-[62%] -translate-x-1/2 rounded-[50%] bg-foreground/20 blur-lg"
        style={{ x: shadowX, scaleX: shadowScale }}
      />

      {/* Flotación: va en su propio contenedor para no pelearse con la
          inclinación, que vive en valores de movimiento. */}
      <motion.div
        animate={reduceMotion ? undefined : { y: [0, -16, 0] }}
        transition={reduceMotion ? undefined : { duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="relative"
      >
        {/* Gesto periódico: un wiggle breve cada ~7s (rotate + scale), no
            sólo la deriva ambiental de la flotación — lee como una reacción,
            no como ruido. Va en su propio contenedor para no pelearse con
            el tilt del cursor (capa siguiente, con sus propios motion
            values) ni con el ciclo de la flotación (capa de arriba, otra
            duración). */}
        <motion.div
          animate={
            reduceMotion
              ? undefined
              : { rotate: [0, 0, -4, 4, -2, 0, 0], scale: [1, 1, 1.03, 1.03, 1.01, 1, 1] }
          }
          transition={
            reduceMotion
              ? undefined
              : { duration: 7, repeat: Infinity, ease: "easeInOut", times: [0, 0.5, 0.58, 0.68, 0.76, 0.85, 1] }
          }
          className="relative"
        >
          <motion.div
            style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
            className="relative"
          >
            {/* 3 — el personaje */}
            <div className="relative">
              <Image
                src="/mascot/mascota-feliz.png"
                alt=""
                aria-hidden
                width={351}
                height={263}
                priority
                className="pointer-events-none w-full"
              />

              {/* Parpadeo: el PNG es una sola imagen plana, no hay capa de
                  ojos aparte para animar — así que se simula con dos
                  óvalos del mismo tono del parche de la cara que tapan cada
                  ojo un instante. scaleY va de 0 (invisible) a 1 (ojo
                  tapado) y de vuelta, casi todo el ciclo en 0 — el "times"
                  concentra el parpadeo en menos del 10% del ciclo para que
                  se sienta como un parpadeo real, no un tic. Posición en %
                  calculada del centroide real de cada pupila (script de
                  análisis de píxeles sobre este PNG, no a ojo) — left/top
                  son el centro exacto, con translate(-50%,-50%) para que el
                  óvalo quede centrado sobre el punto sin importar su tamaño. */}
              <motion.div
                aria-hidden
                className="pointer-events-none absolute h-[14%] w-[12%] origin-center rounded-full bg-[#fbf9f7]"
                style={{ left: "38.1%", top: "46.4%", transform: "translate(-50%, -50%)" }}
                animate={reduceMotion ? undefined : { scaleY: [0, 0, 1, 0, 0] }}
                transition={
                  reduceMotion ? undefined : { duration: 4.5, repeat: Infinity, ease: "easeInOut", times: [0, 0.9, 0.93, 0.96, 1] }
                }
              />
              <motion.div
                aria-hidden
                className="pointer-events-none absolute h-[14%] w-[12%] origin-center rounded-full bg-[#fbf9f7]"
                style={{ left: "59.2%", top: "45.1%", transform: "translate(-50%, -50%)" }}
                animate={reduceMotion ? undefined : { scaleY: [0, 0, 1, 0, 0] }}
                transition={
                  reduceMotion ? undefined : { duration: 4.5, repeat: Infinity, ease: "easeInOut", times: [0, 0.9, 0.93, 0.96, 1] }
                }
              />

              {/* 4 — especular recortado a la silueta.

                  El mask NO usa el PNG del personaje: apuntarlo ahí forzaba una
                  segunda descarga del original crudo (72 KB) porque next/image
                  sirve el hero como WebP desde otra URL — quince veces el peso
                  del hero por un brillo. mascota-feliz-mask.png es el mismo
                  canal alfa en PNG gris+alfa con RGB constante: 1.1 KB a
                  resolución completa, que es todo lo que el mask necesita. */}
              <motion.div
                aria-hidden
                className="pointer-events-none absolute inset-0 mix-blend-soft-light"
                style={{
                  backgroundImage: shine,
                  maskImage: "url(/mascot/mascota-feliz-mask.png)",
                  WebkitMaskImage: "url(/mascot/mascota-feliz-mask.png)",
                  maskSize: "100% 100%",
                  WebkitMaskSize: "100% 100%",
                }}
              />
            </div>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Partículas */}
      <motion.span
        aria-hidden
        className="pointer-events-none absolute top-[10%] left-[9%] h-2 w-2 rounded-full bg-accent/70"
        animate={reduceMotion ? undefined : { y: [0, -22, 0], opacity: [0.25, 1, 0.25] }}
        transition={reduceMotion ? undefined : { duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.span
        aria-hidden
        className="pointer-events-none absolute right-[8%] bottom-[22%] h-3 w-3 rounded-full bg-accent/45"
        animate={reduceMotion ? undefined : { y: [0, 18, 0], opacity: [0.2, 0.75, 0.2] }}
        transition={reduceMotion ? undefined : { duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />
    </div>
  );
}
