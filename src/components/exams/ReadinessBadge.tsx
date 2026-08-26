import type { ReadinessStatus } from "@/services/exams/readinessService";

const STATUS_META: Record<ReadinessStatus, { label: string; className: string; barClassName: string }> = {
  sin_temas: { label: "Sin configurar", className: "bg-border/60 text-muted", barClassName: "bg-subtle" },
  en_riesgo: { label: "En riesgo", className: "bg-danger/10 text-danger", barClassName: "bg-danger" },
  en_progreso: { label: "En progreso", className: "bg-warning/10 text-warning", barClassName: "bg-warning" },
  listo: { label: "Listo", className: "bg-success/10 text-success", barClassName: "bg-success" },
};

export function ReadinessBadge({ status, score }: { status: ReadinessStatus; score: number | null }) {
  const meta = STATUS_META[status];
  const pct = score ?? 0;
  return (
    <span className="inline-flex items-center gap-2">
      <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${meta.className}`}>
        {meta.label}
        {score !== null ? ` · ${score}%` : ""}
      </span>
      {score !== null && (
        <span aria-hidden className="h-1.5 w-12 shrink-0 overflow-hidden rounded-full bg-border">
          <span className={`block h-full rounded-full ${meta.barClassName}`} style={{ width: `${pct}%` }} />
        </span>
      )}
    </span>
  );
}
