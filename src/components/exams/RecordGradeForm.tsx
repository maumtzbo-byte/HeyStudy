"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Award } from "lucide-react";
import { recordGradeAction } from "@/app/dashboard/materias/[id]/examenes/[examId]/actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";

// Sección 4.5: captura la calificación real y, si había una predicción
// (Exam Readiness) congelada para este examen, muestra el mensaje de
// refuerzo que compara ambas. Sin esto, "Exam Readiness Score" era una
// promesa que nunca se contrastaba contra un resultado real.
export function RecordGradeForm({ subjectId, examId }: { subjectId: string; examId: string }) {
  const action = recordGradeAction.bind(null, subjectId, examId);
  const [state, formAction, isPending] = useActionState(action, undefined);

  if (state?.ok && state.data) {
    const { predictedScore, actualPercent, message } = state.data;
    return (
      <div className="flex flex-col gap-3 rounded-xl bg-premium-soft px-4 py-4">
        <div className="flex items-center gap-2.5">
          <Award aria-hidden className="h-4 w-4 shrink-0 text-premium" strokeWidth={1.75} />
          <p className="text-sm font-semibold text-foreground">
            Predijiste {predictedScore}% · sacaste {actualPercent}%
          </p>
        </div>
        <p className="text-sm text-foreground">{message}</p>
        <Link href={`/dashboard/materias/${subjectId}/diagnostico`} className="text-sm font-medium text-accent hover:underline">
          {actualPercent < predictedScore ? "Repasar los temas más débiles →" : "Seguir subiendo el mapa de conocimiento →"}
        </Link>
      </div>
    );
  }

  if (state?.ok) {
    return <p className="text-sm text-muted">Calificación guardada.</p>;
  }

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="grade-label">¿Qué calificación es?</Label>
        <Input id="grade-label" name="label" placeholder="p. ej. Examen final" maxLength={80} required />
      </div>
      <div className="flex gap-3">
        <div className="flex flex-1 flex-col gap-1.5">
          <Label htmlFor="grade-score">Sacaste</Label>
          <Input id="grade-score" name="score" type="number" min={0} step="any" required />
        </div>
        <div className="flex flex-1 flex-col gap-1.5">
          <Label htmlFor="grade-max">Sobre</Label>
          <Input id="grade-max" name="maxScore" type="number" min={1} step="any" defaultValue={100} required />
        </div>
      </div>
      <Button type="submit" disabled={isPending} className="self-start">
        {isPending ? "Guardando..." : "Registrar calificación"}
      </Button>
      {state && !state.ok && <p className="text-sm text-danger">{state.error}</p>}
    </form>
  );
}
