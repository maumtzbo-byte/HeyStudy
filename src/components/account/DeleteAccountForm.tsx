"use client";

import { useActionState, useState } from "react";
import { deleteAccountAction } from "@/app/dashboard/perfil/actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";

// Escribir el correo exacto como confirmación: es una acción irreversible
// (borra materias, diagnósticos, planes, conversaciones con el tutor — todo)
// y un solo clic en un botón rojo es demasiado fácil de disparar por
// accidente.
export function DeleteAccountForm({ email }: { email: string }) {
  const [open, setOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(deleteAccountAction, undefined);

  if (!open) {
    return (
      <Button variant="danger" onClick={() => setOpen(true)}>
        Eliminar mi cuenta
      </Button>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-3 rounded-xl border border-danger/30 bg-danger/5 p-4">
      <p className="text-sm text-foreground">
        Esto borra tu cuenta, materias, tareas, exámenes, materiales, diagnósticos, planes de estudio y
        conversaciones con el tutor — de forma permanente. No se puede deshacer.
      </p>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="confirmation">
          Escribe <span className="font-semibold text-foreground">{email}</span> para confirmar
        </Label>
        <Input id="confirmation" name="confirmation" autoComplete="off" required />
      </div>
      <div className="flex gap-3">
        <Button type="submit" variant="danger" disabled={isPending}>
          {isPending ? "Eliminando..." : "Sí, eliminar todo permanentemente"}
        </Button>
        <Button type="button" variant="secondary" onClick={() => setOpen(false)} disabled={isPending}>
          Cancelar
        </Button>
      </div>
      {state && !state.ok && <p className="text-sm text-danger">{state.error}</p>}
    </form>
  );
}
