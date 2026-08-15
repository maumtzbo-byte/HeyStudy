"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

// Fade + slide-up al entrar en el viewport, con stagger opcional vía
// `delay`. Coincide con el patrón de revelado del video de referencia:
// el contenedor aparece primero, el contenido adentro un poco después.
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
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, amount: 0.25 }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
