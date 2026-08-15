import { cn } from "@/lib/utils/cn";

export function Logo({ className, iconOnly = false }: { className?: string; iconOnly?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
        <span className="text-base leading-none font-black" aria-hidden>
          H
        </span>
      </span>
      {!iconOnly && <span className="text-lg font-semibold tracking-tight text-foreground">HeyStudy</span>}
    </span>
  );
}
