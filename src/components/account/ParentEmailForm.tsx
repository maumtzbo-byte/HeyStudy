"use client";

import { useActionState } from "react";
import { updateParentEmailAction } from "@/app/dashboard/perfil/actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";

export function ParentEmailForm({ currentEmail }: { currentEmail: string | null }) {
  const [state, formAction, isPending] = useActionState(updateParentEmailAction, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <Label htmlFor="parentEmail">Correo de tu padre, madre o tutor (opcional)</Label>
      <div className="flex flex-wrap gap-2">
        <Input
          id="parentEmail"
          name="parentEmail"
          type="email"
          defaultValue={currentEmail ?? ""}
          placeholder="nombre@correo.com"
          className="max-w-xs"
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
