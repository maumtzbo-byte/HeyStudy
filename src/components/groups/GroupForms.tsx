"use client";

import { useActionState } from "react";
import { createGroupAction, joinGroupAction } from "@/app/dashboard/grupos/actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";

export function CreateGroupForm() {
  const [state, formAction, isPending] = useActionState(createGroupAction, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <Label htmlFor="group-name">Nombre del grupo</Label>
      <Input id="group-name" name="name" placeholder="p. ej. Cálculo con los del salón" maxLength={50} required />
      <Button type="submit" disabled={isPending} className="self-start">
        {isPending ? "Creando..." : "Crear grupo"}
      </Button>
      {state && !state.ok && <p className="text-sm text-danger">{state.error}</p>}
    </form>
  );
}

export function JoinGroupForm() {
  const [state, formAction, isPending] = useActionState(joinGroupAction, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <Label htmlFor="join-code">Código de invitación</Label>
      <Input
        id="join-code"
        name="joinCode"
        placeholder="p. ej. K7QM2P"
        maxLength={6}
        autoCapitalize="characters"
        className="uppercase"
        required
      />
      <Button type="submit" variant="secondary" disabled={isPending} className="self-start">
        {isPending ? "Entrando..." : "Unirme"}
      </Button>
      {state && !state.ok && <p className="text-sm text-danger">{state.error}</p>}
    </form>
  );
}
