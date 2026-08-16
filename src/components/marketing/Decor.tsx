import { cn } from "@/lib/utils/cn";

// Blob de color suave para dar profundidad detrás de paneles/secciones —
// mismo lenguaje que el resplandor del hero, ahora reutilizable. Opacidad
// baja a propósito: es textura de fondo, no un elemento que compita.
export function Blob({ className, tone = "accent" }: { className?: string; tone?: "accent" | "premium" }) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute rounded-full blur-3xl",
        tone === "accent" ? "bg-accent/[0.16]" : "bg-premium/[0.18]",
        className,
      )}
    />
  );
}

// Destello de 4 puntas — el mismo motivo que ya aparece junto a la
// mascota, reutilizado como acento decorativo suelto cerca de títulos y
// CTAs en vez de un ícono genérico.
export function Sparkle({ className, tone = "accent" }: { className?: string; tone?: "accent" | "premium" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={cn(tone === "accent" ? "text-accent" : "text-premium", className)}
      fill="currentColor"
      aria-hidden
    >
      <path d="M12 0c.6 4.8 1.6 7.8 3 9.3 1.5 1.5 4.4 2.5 9 3-4.8.6-7.8 1.6-9.3 3-1.5 1.5-2.5 4.4-3 9-.6-4.8-1.6-7.8-3-9.3-1.5-1.5-4.4-2.5-9-3 4.8-.6 7.8-1.6 9.3-3 1.5-1.5 2.5-4.4 3-9Z" />
    </svg>
  );
}
