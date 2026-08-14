"use client";

import { useActionState } from "react";
import { generatePlanAction } from "@/app/dashboard/actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";

export function GeneratePlanForm({ regenerate = false }: { regenerate?: boolean }) {
  const [state, formAction, isPending] = useActionState(generatePlanAction, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="minutesAvailable">Minutos disponibles hoy</Label>
        <Input id="minutesAvailable" name="minutesAvailable" type="number" min={10} max={240} defaultValue={45} />
      </div>
      <Button type="submit" variant={regenerate ? "secondary" : "primary"} size="sm" disabled={isPending}>
        {isPending ? "Armando tu plan..." : regenerate ? "Regenerar plan" : "Generar mi plan de hoy"}
      </Button>
      {state?.error && <p className="text-sm text-danger">{state.error}</p>}
    </form>
  );
}
