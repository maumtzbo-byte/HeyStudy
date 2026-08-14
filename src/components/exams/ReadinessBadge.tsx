import type { ReadinessStatus } from "@/services/exams/readinessService";

const STATUS_META: Record<ReadinessStatus, { label: string; className: string }> = {
  sin_temas: { label: "Sin configurar", className: "bg-border/60 text-muted" },
  en_riesgo: { label: "En riesgo", className: "bg-danger/10 text-danger" },
  en_progreso: { label: "En progreso", className: "bg-warning/10 text-warning" },
  listo: { label: "Listo", className: "bg-success/10 text-success" },
};

export function ReadinessBadge({ status, score }: { status: ReadinessStatus; score: number | null }) {
  const meta = STATUS_META[status];
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${meta.className}`}>
      {meta.label}
      {score !== null ? ` · ${score}%` : ""}
    </span>
  );
}
