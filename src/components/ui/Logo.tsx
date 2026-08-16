import { cn } from "@/lib/utils/cn";

// Marca abstracta: tres nodos conectados en trayectoria ascendente — se lee
// a la vez como mapa de conocimiento (nodos/conexiones), progreso
// (trayectoria hacia arriba) y dirección (la pendiente apunta a algún
// lado). Nada de libro/cerebro/birrete: un glifo geométrico simple que
// resiste reducirse a tamaño de favicon.
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="none" aria-hidden>
      <path
        d="M8.5 22.5L15 16l3.5 3.5L25 12"
        stroke="currentColor"
        strokeWidth="2.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.55"
      />
      <circle cx="8.5" cy="22.5" r="2.75" fill="currentColor" opacity="0.55" />
      <circle cx="18.5" cy="19.5" r="3" fill="currentColor" opacity="0.8" />
      <circle cx="25" cy="12" r="3.5" fill="currentColor" />
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
