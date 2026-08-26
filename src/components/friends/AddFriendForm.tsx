"use client";

import { useActionState } from "react";
import { sendFriendRequestAction } from "@/app/dashboard/amigos/actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";

export function AddFriendForm() {
  const [state, formAction, isPending] = useActionState(sendFriendRequestAction, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <Label htmlFor="add-friend-username">Nombre de usuario</Label>
      <div className="flex flex-wrap gap-2">
        <Input id="add-friend-username" name="username" placeholder="tu_amigo" maxLength={20} className="max-w-xs" required />
        <Button type="submit" disabled={isPending}>
          {isPending ? "Enviando..." : "Agregar"}
        </Button>
      </div>
      {state && !state.ok && <p className="text-sm text-danger">{state.error}</p>}
      {state?.ok && <p className="text-sm text-success">Solicitud enviada.</p>}
    </form>
  );
}
