import { type ButtonHTMLAttributes, forwardRef } from "react";
import Link, { type LinkProps } from "next/link";
import { cn } from "@/lib/utils/cn";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

// La pulsación (active:scale) es lo que le falta al lift de hover para
// sentirse física, tipo Instagram: se hunde levemente al tocar y rebota de
// vuelta al soltar, en vez de sólo cancelar el lift. motion-reduce apaga el
// transform, no sólo la transición, para que quien pidió menos movimiento
// no reciba ni el salto instantáneo.
const baseClasses = cn(
  "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-150 ease-out",
  "active:translate-y-0 active:scale-[0.97] motion-reduce:active:scale-100",
  "disabled:pointer-events-none disabled:opacity-50",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2",
);

const variantClasses: Record<Variant, string> = {
  primary: "bg-accent text-accent-foreground shadow-sm hover:-translate-y-px hover:bg-accent-hover hover:shadow-md",
  secondary:
    "border border-border-strong/60 bg-surface text-foreground hover:-translate-y-px hover:border-border-strong hover:bg-surface-elevated hover:shadow-sm",
  ghost: "text-foreground hover:bg-border/40",
  danger: "bg-danger text-white hover:-translate-y-px hover:opacity-90 hover:shadow-md",
};

const sizeClasses: Record<Size, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-[3.25rem] px-7 text-base",
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
