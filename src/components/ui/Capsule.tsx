import { cn } from "@/lib/utils/cn";

// La cápsula es la unidad de medida de HeyStudy, no un adorno. Sale del
// propio logo (tres rect con rx=3) y de aquí baja a todo el sistema: chips
// de materia, barras de dominio, racha, progreso del plan.
//
// REGLA: si no representa una medición, no debe ser una cápsula. Para
// contenedores y tarjetas está la escala de radios normal (8–32px).
//
// El eje de conocimiento usa UN SOLO color con llenado variable:
//   - vacía (gris)  = sin medir. No sabemos nada de esto todavía.
//   - llena (morado) = medido, y cuánto llena es cuánto domina.
// Verde/ámbar/rojo quedan reservados al eje de urgencia (cercanía de un
// examen), que es una dimensión distinta y nunca debe cruzarse con esta.

export interface CapsuleProps {
  /** 0–1. `null` significa sin medir, que NO es lo mismo que medir 0. */
  fill?: number | null;
  /** Ancho en px. Sin valor, la cápsula se estira a su contenedor. */
  width?: number;
  className?: string;
}

export function Capsule({ fill = null, width, className }: CapsuleProps) {
  const measured = fill !== null && Number.isFinite(fill);
  const pct = measured ? Math.round(Math.min(1, Math.max(0, fill)) * 100) : 0;

  return (
    <span
      aria-hidden
      className={cn("relative block h-3 shrink-0 overflow-hidden rounded-full bg-unmeasured", className)}
      style={width ? { width } : undefined}
    >
      {measured && (
        <span
          className="absolute inset-y-0 left-0 rounded-full bg-accent transition-[width] duration-[900ms]"
          style={{ width: `${pct}%`, transitionTimingFunction: "cubic-bezier(0.2, 0, 0, 1)" }}
        />
      )}
    </span>
  );
}

// Una fila de cápsulas. Se usa para representar un conjunto de temas: los
// medidos se llenan, los que faltan se quedan grises. Es literalmente el
// argumento del producto — "mediste uno, te faltan estos" — así que aparece
// en el hero, en el 404 y en los estados vacíos.
//
// `aria-hidden` en las cápsulas es deliberado: son la representación visual
// de un dato que SIEMPRE debe existir también como texto al lado. Ningún
// estado de esta app puede comunicarse sólo por color o sólo por forma.
export function CapsuleRow({
  fills,
  className,
  capsuleClassName,
}: {
  fills: Array<number | null>;
  className?: string;
  capsuleClassName?: string;
}) {
  // Anchos variables para que una fila de cápsulas lea como un conjunto de
  // temas reales (unos más largos que otros) y no como un ecualizador.
  const widths = [78, 46, 108, 46, 78, 62, 92, 46];

  return (
    <span className={cn("flex flex-wrap items-center gap-1.5", className)}>
      {fills.map((fill, i) => (
        <Capsule key={i} fill={fill} width={widths[i % widths.length]} className={capsuleClassName} />
      ))}
    </span>
  );
}
