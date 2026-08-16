import { cn } from "@/lib/utils/cn";

// "H" trazada como tres barras redondeadas (no el glifo de una fuente) —
// mismo mark del board de marca: gruesa, con esquinas suaves, reconocible
// a tamaño de favicon.
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="none" aria-hidden>
      <rect x="7" y="6" width="6" height="20" rx="3" fill="currentColor" />
      <rect x="19" y="6" width="6" height="20" rx="3" fill="currentColor" />
      <rect x="7" y="13" width="18" height="6" rx="3" fill="currentColor" />
    </svg>
  );
}

export function Logo({
  className,
  iconOnly = false,
  inverted = false,
}: {
  className?: string;
  iconOnly?: boolean;
  inverted?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[0.6rem] bg-accent text-accent-foreground">
        <LogoMark className="h-[18px] w-[18px]" />
      </span>
      {!iconOnly && (
        <span
          className={cn(
            "font-display text-lg font-semibold tracking-tight",
            inverted ? "text-deep-foreground" : "text-foreground",
          )}
        >
          HeyStudy
        </span>
      )}
    </span>
  );
}
