import { cn } from "@/lib/utils/cn";

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
    <span className={cn("inline-flex items-center gap-2", className)}>
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
        <span className="text-base leading-none font-black" aria-hidden>
          H
        </span>
      </span>
      {!iconOnly && (
        <span className={cn("text-lg font-semibold tracking-tight", inverted ? "text-deep-foreground" : "text-foreground")}>
          HeyStudy
        </span>
      )}
    </span>
  );
}
