import { type ButtonHTMLAttributes, forwardRef } from "react";
import Link, { type LinkProps } from "next/link";
import { cn } from "@/lib/utils/cn";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg" | "icon";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

// Cápsula, no rectángulo redondeado: el botón es parte del sistema de
// medición de la marca (misma geometría que el logo, los chips de materia y
// las barras de dominio). Una sola forma propagada sostiene más
// reconocimiento que varias formas bonitas sin relación.
//
// El feedback de pulsación se queda —confirma el toque— pero sin escalar el
// botón: escalar controles al tocarlos es un tic de plantilla y, en móvil,
// mueve el objetivo justo cuando el dedo ya se comprometió.
const baseClasses = cn(
  "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-colors duration-150",
  "[transition-timing-function:cubic-bezier(0.2,0,0,1)]",
  "disabled:pointer-events-none disabled:opacity-50",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2",
);

// Se retiró el botón "tecla" con borde inferior grueso. Era una imitación
// declarada de Duolingo, y esta marca no compite ahí: HeyStudy es un
// instrumento de medición, no una app que celebra. Superficie plana, sin
// sombra y sin degradado — el peso lo cargan el color y la forma.
const variantClasses: Record<Variant, string> = {
  primary: "bg-accent text-accent-foreground hover:bg-accent-hover",
  secondary: "border border-border-strong/60 bg-surface text-foreground hover:border-border-strong hover:bg-surface-elevated",
  ghost: "text-foreground hover:bg-border/40",
  danger: "bg-danger text-white hover:brightness-95",
};

// Ningún tamaño baja de 44px de alto: es el objetivo táctil mínimo cómodo
// en un teléfono, y el usuario de este producto llega desde uno. `sm` sigue
// siendo visualmente más chico gracias al padding horizontal y al texto,
// pero su área de toque ya no lo es.
const sizeClasses: Record<Size, string> = {
  sm: "h-11 px-4 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-[3.25rem] px-7 text-base",
  icon: "h-11 w-11 p-0",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(baseClasses, variantClasses[variant], sizeClasses[size], className)}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

interface ButtonLinkProps extends LinkProps {
  variant?: Variant;
  size?: Size;
  className?: string;
  children?: React.ReactNode;
}

// Para CTAs que navegan: se ve y se comporta como Button, pero renderiza un
// solo <a> en vez de anidar <button> dentro de <a> (HTML inválido — rompe
// el orden de foco por teclado en algunos lectores de pantalla).
export const ButtonLink = forwardRef<HTMLAnchorElement, ButtonLinkProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <Link ref={ref} className={cn(baseClasses, variantClasses[variant], sizeClasses[size], className)} {...props} />
    );
  },
);
ButtonLink.displayName = "ButtonLink";
