import { type ButtonHTMLAttributes, forwardRef } from "react";
import Link, { type LinkProps } from "next/link";
import { cn } from "@/lib/utils/cn";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const baseClasses = cn(
  "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors",
  "disabled:pointer-events-none disabled:opacity-50",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2",
);

const variantClasses: Record<Variant, string> = {
  primary: "bg-accent text-accent-foreground shadow-soft hover:bg-accent-hover",
  secondary: "bg-surface border border-border text-foreground hover:bg-border/40",
  ghost: "text-foreground hover:bg-border/40",
  danger: "bg-danger text-white hover:opacity-90",
};

const sizeClasses: Record<Size, string> = {
  sm: "h-8 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-base",
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
