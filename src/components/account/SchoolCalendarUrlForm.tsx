"use client";

import { useActionState } from "react";
import { updateSchoolCalendarUrlAction } from "@/app/dashboard/perfil/actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";

export function SchoolCalendarUrlForm({ currentUrl }: { currentUrl: string | null }) {
  const [state, formAction, isPending] = useActionState(updateSchoolCalendarUrlAction, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <Label htmlFor="schoolCalendarUrl">Link de calendario de tu escuela (opcional)</Label>
      <div className="flex flex-wrap gap-2">
        <Input
          id="schoolCalendarUrl"
          name="schoolCalendarUrl"
          type="url"
          defaultValue={currentUrl ?? ""}
          placeholder="https://..."
          className="max-w-md"
        />
        <Button type="submit" variant="secondary" size="sm" disabled={isPending}>
          {isPending ? "Guardando..." : "Guardar"}
        </Button>
      </div>
      {state && !state.ok && <p className="text-sm text-danger">{state.error}</p>}
      {state?.ok && <p className="text-sm text-success">Guardado.</p>}
    </form>
  );
}
