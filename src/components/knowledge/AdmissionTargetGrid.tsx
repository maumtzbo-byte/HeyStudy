"use client";

import { useState, useTransition } from "react";
import { GraduationCap, Loader2 } from "lucide-react";
import { selectAdmissionTargetAction } from "@/app/dashboard/admision/actions";
import type { AdmissionTarget } from "@/lib/data/standardizedExams";

const FAMILY_LABELS: Record<string, string> = {
  PAA: "PAA — College Board",
  "EXANI-II": "EXANI-II — CENEVAL",
  "EXANI-I": "EXANI-I — CENEVAL",
};

export function AdmissionTargetGrid({ targets }: { targets: AdmissionTarget[] }) {
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  function handleSelect(targetId: string) {
    setError(null);
    setPendingId(targetId);
    startTransition(async () => {
      const result = await selectAdmissionTargetAction(targetId);
      if (!result.ok) {
        setPendingId(null);
        setError(result.error);
      }
      // Si tuvo éxito, la action redirige — no hay nada más que hacer aquí.
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {targets.map((target) => (
          <button
            key={target.id}
            type="button"
            disabled={pendingId !== null}
            onClick={() => handleSelect(target.id)}
            className="flex flex-col items-start gap-3 rounded-2xl border border-border bg-surface p-6 text-left shadow-soft transition-colors hover:border-accent/40 disabled:opacity-60"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent-soft text-accent">
              {pendingId === target.id ? (
                <Loader2 className="h-5 w-5 animate-spin" strokeWidth={1.75} />
              ) : (
                <GraduationCap className="h-5 w-5" strokeWidth={1.75} />
              )}
            </span>
            <div>
              <p className="font-semibold text-foreground">{target.name}</p>
              <p className="mt-0.5 text-xs text-muted">{FAMILY_LABELS[target.familyId] ?? target.familyId}</p>
            </div>
          </button>
        ))}
      </div>
      {error && <p className="text-sm text-danger">{error}</p>}
    </div>
  );
}
