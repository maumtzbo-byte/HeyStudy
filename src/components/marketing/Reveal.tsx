"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

// Fade + slide-up al entrar en el viewport, con stagger opcional vía
// `delay`. Coincide con el patrón de revelado del video de referencia:
// el contenedor aparece primero, el contenido adentro un poco después.
// Con prefers-reduced-motion, aparece directo sin desplazamiento.
export function Reveal({
  children,
  delay = 0,
  y = 24,
  className,
  once = true,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  once?: boolean;
}) {
  const reduceMotion = useReducedMotion();
  const offsetY = reduceMotion ? 0 : y;

  return (
    <motion.div
      initial={{ opacity: 0, y: offsetY }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, amount: 0.25 }}
      transition={{ duration: reduceMotion ? 0.15 : 0.6, delay: reduceMotion ? 0 : delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
