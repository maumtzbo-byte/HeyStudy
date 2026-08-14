"use client";

import { useTransition } from "react";
import { toggleStudyPlanItemAction } from "@/app/dashboard/actions";

interface StudyPlanItemView {
  id: string;
  title: string;
  reason: string;
  minutes: number;
  completed: boolean;
}

export function StudyPlanList({ items }: { items: StudyPlanItemView[] }) {
  const [, startTransition] = useTransition();

  return (
    <div className="flex flex-col divide-y divide-border overflow-hidden rounded-xl border border-border">
      {items.map((item) => (
        <div key={item.id} className="flex items-start gap-3 px-4 py-3">
          <button
            type="button"
            onClick={() => startTransition(() => toggleStudyPlanItemAction(item.id))}
            className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
              item.completed ? "border-success bg-success text-white" : "border-border"
            }`}
            aria-label={item.completed ? "Marcar como pendiente" : "Marcar como hecho"}
          >
            {item.completed && "✓"}
          </button>
          <div className="flex-1">
            <p className={`text-sm font-medium ${item.completed ? "text-muted line-through" : "text-foreground"}`}>
              {item.title}
            </p>
            <p className="text-xs text-muted">{item.reason}</p>
          </div>
          <span className="shrink-0 text-xs font-medium text-muted">{item.minutes} min</span>
        </div>
      ))}
    </div>
  );
}
