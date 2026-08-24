"use client";

import { useActionState } from "react";
import { updatePreferredStudyMethodAction } from "@/app/dashboard/perfil/actions";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";

const STUDY_METHOD_LABELS: Record<string, string> = {
  VIDEOS: "Viendo videos",
  LECTURA: "Leyendo",
  PRACTICA: "Practicando con ejercicios",
  MIXTO: "Un poco de todo",
};

export function StudyMethodForm({ current }: { current: string }) {
  const [state, formAction, isPending] = useActionState(updatePreferredStudyMethodAction, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex flex-1 flex-col gap-1.5">
          <Select name="preferredStudyMethod" defaultValue={current}>
            {Object.entries(STUDY_METHOD_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </div>
        <Button type="submit" variant="secondary" disabled={isPending}>
          {isPending ? "Guardando..." : "Guardar"}
        </Button>
      </div>
      {state && !state.ok && <p className="text-sm text-danger">{state.error}</p>}
    </form>
  );
}
