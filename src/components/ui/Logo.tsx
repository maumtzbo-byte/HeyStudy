import { BookOpen } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export function Logo({ className, iconOnly = false }: { className?: string; iconOnly?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
        <BookOpen className="h-4 w-4" strokeWidth={2.25} />
      </span>
      {!iconOnly && (
        <span className="font-serif text-lg font-semibold tracking-tight text-foreground">HeyStudy</span>
      )}
    </span>
  );
}
