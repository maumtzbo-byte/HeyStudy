import { type InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils/cn";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          // text-base (16px) y no text-sm: por debajo de 16px, Safari en iOS hace
        // zoom a toda la página al enfocar el campo. En el hero, donde el campo
        // es la interacción principal, ese salto rompe la primera impresión.
        "h-11 w-full rounded-lg border border-border bg-surface px-3 text-base text-foreground",
          "placeholder:text-muted",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:border-transparent",
          "disabled:opacity-50",
          className,
        )}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";
