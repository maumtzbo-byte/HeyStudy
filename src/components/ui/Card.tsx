import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

type As = "div" | "section" | "article";

// `as` existe para que secciones que sí necesitan semántica HTML5
// (<section>, <article>) puedan usar el mismo tratamiento visual que Card
// en vez de duplicar su className a mano — es lo que unifica los dos
// idiomas de "card" que había en el dashboard.
export function Card({
  className,
  as = "div",
  ...props
}: HTMLAttributes<HTMLElement> & { as?: As }) {
  const Comp = as;
  return (
    <Comp
      className={cn("rounded-2xl border border-border bg-surface p-6 shadow-soft", className)}
      {...props}
    />
  );
}

export function CardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("text-base font-semibold text-foreground", className)} {...props} />;
}

export function CardDescription({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-sm text-muted", className)} {...props} />;
}
