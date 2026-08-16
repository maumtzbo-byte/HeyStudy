"use client";

import { forwardRef, useRef, type ReactNode, type PointerEvent, type CSSProperties } from "react";

// Un solo listener de mouse en todo el hero, expuesto como variables CSS
// (--mx/--my, -0.5 a 0.5). Los ParallaxLayer adentro leen esas variables
// con distinto "depth" para crear sensación de profundidad — sin bloquear
// clics de los hijos (a diferencia de una capa absoluta por encima).
// Acepta un ref reenviado porque el mismo nodo también sirve de target
// para el scroll-tracking (useScroll) del hero.
export const ParallaxField = forwardRef<HTMLDivElement, { children: ReactNode; className?: string }>(
  function ParallaxField({ children, className }, forwardedRef) {
    const innerRef = useRef<HTMLDivElement>(null);

    function setRefs(node: HTMLDivElement | null) {
      innerRef.current = node;
      if (typeof forwardedRef === "function") forwardedRef(node);
      else if (forwardedRef) forwardedRef.current = node;
    }

    function handlePointerMove(e: PointerEvent<HTMLDivElement>) {
      const el = innerRef.current;
      if (!el) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      el.style.setProperty("--mx", x.toFixed(3));
      el.style.setProperty("--my", y.toFixed(3));
    }

    function handlePointerLeave() {
      innerRef.current?.style.setProperty("--mx", "0");
      innerRef.current?.style.setProperty("--my", "0");
    }

    return (
      <div
        ref={setRefs}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        className={className}
        style={{ "--mx": 0, "--my": 0 } as CSSProperties}
      >
        {children}
      </div>
    );
  },
);

export function ParallaxLayer({
  children,
  depth = 1,
  className,
}: {
  children: ReactNode;
  depth?: number;
  className?: string;
}) {
  return (
    <div
      className={className}
      style={{
        transform:
          `perspective(1200px) rotateX(calc(var(--my, 0) * ${(-10 * depth).toFixed(2)}deg)) ` +
          `rotateY(calc(var(--mx, 0) * ${(10 * depth).toFixed(2)}deg)) ` +
          `translate3d(calc(var(--mx, 0) * ${(12 * depth).toFixed(1)}px), calc(var(--my, 0) * ${(12 * depth).toFixed(1)}px), 0)`,
        transition: "transform 0.2s ease-out",
        willChange: "transform",
      }}
    >
      {children}
    </div>
  );
}
