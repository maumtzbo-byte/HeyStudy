function getMasteryLevel(score: number, confidence: number) {
  if (confidence === 0) return { label: "Sin evidencia", className: "bg-border/60 text-muted", barClassName: "bg-subtle" };
  if (score >= 0.7) return { label: "Dominado", className: "bg-success/10 text-success", barClassName: "bg-success" };
  if (score >= 0.4) return { label: "En progreso", className: "bg-warning/10 text-warning", barClassName: "bg-warning" };
  return { label: "Débil", className: "bg-danger/10 text-danger", barClassName: "bg-danger" };
}

export function MasteryBadge({ score, confidence }: { score: number; confidence: number }) {
  const level = getMasteryLevel(score, confidence);
  const pct = confidence > 0 ? Math.round(score * 100) : 0;
  return (
    <span className="inline-flex items-center gap-2">
      <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${level.className}`}>
        {level.label}
        {confidence > 0 ? ` · ${pct}%` : ""}
      </span>
      <span aria-hidden className="h-1.5 w-12 shrink-0 overflow-hidden rounded-full bg-border">
        <span className={`block h-full rounded-full ${level.barClassName}`} style={{ width: `${pct}%` }} />
      </span>
    </span>
  );
}
