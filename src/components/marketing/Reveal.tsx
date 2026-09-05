import type { ReactNode } from "react";

// Ya no anima nada, y es a propósito.
//
// Esto empezó como un fade + slide con framer-motion que arrancaba en
// `opacity: 0` sin condición. Efecto secundario: si el JS tardaba o fallaba,
// toda la landing debajo del hero quedaba en blanco. Lo reescribí con CSS y
// `animation-timeline: view()` — y reprodujo exactamente el mismo defecto,
// porque `fill-mode: both` deja en opacidad 0 todo lo que está fuera del
// rango. Sin JavaScript, 22 bloques seguían invisibles.
//
// No es un problema de técnica: es la naturaleza del efecto. Una entrada de
// scroll necesita que las cosas empiecen escondidas, y eso choca de frente
// con la regla que la Fase 2 dejó cerrada — el estado por defecto es el
// estado final, nada nace invisible esperando un scroll.
//
// Aplicada la prueba de borrado de la Fase 2: una entrada de sección no
// explica, no revela, no transforma, no orienta, no prioriza y no conecta.
// Después de verla no sabes nada que no supieras antes. Se borra.
//
// El componente se conserva como envoltura neutra porque lo usan muchas
// secciones y quitarlo de todas sería ruido sin ganancia. Si alguna vez
// vuelve a haber motivo para animar la entrada, este es el lugar — pero el
// contenido nunca debe depender de que esa animación corra.
export function Reveal({
  children,
  className,
}: {
  children: ReactNode;
  /** Ignorados: ya no hay animación de entrada. Ver el comentario de arriba. */
  delay?: number;
  y?: number;
  once?: boolean;
  className?: string;
}) {
  return <div className={className}>{children}</div>;
}
