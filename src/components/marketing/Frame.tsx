import type { ReactNode } from "react";
import { Reveal } from "@/components/marketing/Reveal";
import { cn } from "@/lib/utils/cn";

/* ----------------------------------------------------------------------- */
/* Frame — una sección = una idea = una prueba visual.                       */
/*                                                                          */
/* Antes el producto entero vivía en un solo bento de tarjetitas, así que    */
/* ninguna capacidad se explicaba: se enumeraban. Aquí cada capacidad ocupa  */
/* su propio frame a ancho completo, con un titular que afirma una cosa y    */
/* un visual grande que la demuestra. Los frames alternan lado y fondo para  */
/* que el scroll tenga ritmo en vez de ser una lista.                        */
/* ----------------------------------------------------------------------- */

export function Frame({
  id,
  tone = "base",
  className,
  children,
}: {
  id?: string;
  tone?: "base" | "raised";
  className?: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      className={cn(
        "relative overflow-hidden border-t border-border px-6 py-14 sm:px-8 sm:py-24",
        tone === "raised" ? "bg-surface" : "bg-background",
        id && "scroll-mt-20",
        className,
      )}
    >
      <div className="mx-auto w-full max-w-[1280px]">{children}</div>
    </section>
  );
}

/** Titular de frame: número/etiqueta arriba, afirmación grande abajo. */
export function FrameHeading({
  eyebrow,
  title,
  lead,
  align = "left",
  className,
}: {
  eyebrow?: string;
  title: ReactNode;
  lead?: ReactNode;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <Reveal
      className={cn(
        "max-w-2xl",
        align === "center" && "mx-auto text-center",
        className,
      )}
    >
      {eyebrow && (
        <p
          className={cn(
            "flex items-center gap-3 text-xs font-semibold tracking-[0.14em] text-muted uppercase",
            align === "center" && "justify-center",
          )}
        >
          <span aria-hidden className="h-px w-8 bg-border-strong" />
          {eyebrow}
        </p>
      )}
      <h2 className="mt-4 font-display text-[1.7rem] leading-[1.15] font-semibold tracking-tight text-foreground sm:text-4xl sm:leading-[1.12]">
        {title}
      </h2>
      {lead && <p className="mt-4 text-base leading-relaxed text-muted sm:text-lg">{lead}</p>}
    </Reveal>
  );
}

/**
 * Frame partido: texto de un lado, prueba visual del otro. `flip` invierte
 * el orden en escritorio; en móvil el texto siempre va primero, porque el
 * visual sin contexto no dice nada.
 */
export function SplitFrame({
  eyebrow,
  title,
  lead,
  bullets,
  visual,
  flip = false,
}: {
  eyebrow?: string;
  title: ReactNode;
  lead?: ReactNode;
  bullets?: string[];
  visual: ReactNode;
  flip?: boolean;
}) {
  return (
    <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16">
      <div className={cn(flip && "lg:order-2")}>
        <FrameHeading eyebrow={eyebrow} title={title} lead={lead} className="max-w-xl" />
        {bullets && bullets.length > 0 && (
          <Reveal delay={0.08}>
            <ul className="mt-7 flex flex-col gap-3">
              {bullets.map((b) => (
                <li key={b} className="flex gap-3 border-t border-border pt-3 text-sm text-muted">
                  <span aria-hidden className="mt-[0.45rem] h-1 w-1 shrink-0 rounded-full bg-accent" />
                  {b}
                </li>
              ))}
            </ul>
          </Reveal>
        )}
      </div>
      <Reveal delay={0.1} className={cn(flip && "lg:order-1")}>
        {visual}
      </Reveal>
    </div>
  );
}

/**
 * Chrome de producto. El truco de textura que hace que un visual se lea como
 * software real y no como ilustración: una barra superior con el nombre de
 * la vista y el lienzo hundido debajo.
 */
export function Panel({
  label,
  meta,
  children,
  className,
}: {
  label: string;
  meta?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-border bg-surface shadow-lg",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3 border-b border-border bg-surface-elevated px-4 py-2.5 sm:px-5">
        <p className="text-xs font-semibold tracking-wide text-subtle uppercase">{label}</p>
        {meta && <p className="text-xs text-subtle tabular-nums">{meta}</p>}
      </div>
      <div className="bg-background p-4 sm:p-6">{children}</div>
    </div>
  );
}
