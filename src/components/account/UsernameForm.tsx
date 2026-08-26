"use client";

import { useActionState } from "react";
import { updateUsernameAction } from "@/app/dashboard/perfil/actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";

export function UsernameForm({ currentUsername }: { currentUsername: string | null }) {
  const [state, formAction, isPending] = useActionState(updateUsernameAction, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <Label htmlFor="username">Nombre de usuario</Label>
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1 rounded-lg border border-border-strong/60 bg-surface px-3 focus-within:ring-2 focus-within:ring-accent">
          <span className="text-sm text-subtle">@</span>
          <Input
            id="username"
            name="username"
            defaultValue={currentUsername ?? ""}
            placeholder="tu_usuario"
            maxLength={20}
            className="border-none px-0 shadow-none focus-visible:ring-0"
          />
        </div>
        <Button type="submit" variant="secondary" size="sm" disabled={isPending}>
          {isPending ? "Guardando..." : "Guardar"}
        </Button>
      </div>
      <p className="text-xs text-subtle">3-20 caracteres: letras, números o guion bajo. Así te encuentran tus amigos.</p>
      {state && !state.ok && <p className="text-sm text-danger">{state.error}</p>}
      {state?.ok && <p className="text-sm text-success">Guardado.</p>}
    </form>
  );
}
