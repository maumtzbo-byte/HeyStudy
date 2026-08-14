function getMasteryLevel(score: number, confidence: number) {
  if (confidence === 0) return { label: "Sin evidencia", className: "bg-border/60 text-muted" };
  if (score >= 0.7) return { label: "Dominado", className: "bg-success/10 text-success" };
  if (score >= 0.4) return { label: "En progreso", className: "bg-warning/10 text-warning" };
  return { label: "Débil", className: "bg-danger/10 text-danger" };
}

export function MasteryBadge({ score, confidence }: { score: number; confidence: number }) {
  const level = getMasteryLevel(score, confidence);
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${level.className}`}>
      {level.label}
      {confidence > 0 ? ` · ${Math.round(score * 100)}%` : ""}
    </span>
  );
}
