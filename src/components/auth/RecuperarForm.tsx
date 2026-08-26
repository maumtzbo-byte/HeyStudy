"use client";

import { useActionState } from "react";
import Link from "next/link";
import { forgotPasswordAction } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";

export function RecuperarForm() {
  const [state, formAction, isPending] = useActionState(forgotPasswordAction, undefined);

  return (
    <div className="flex flex-col gap-6">
      <form action={formAction} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">Correo</Label>
          <Input id="email" name="email" type="email" autoComplete="email" required />
        </div>
        {state?.error && <p className="text-sm text-danger">{state.error}</p>}
        {state?.message && <p className="text-sm text-success">{state.message}</p>}
        <Button type="submit" disabled={isPending} className="mt-2">
          {isPending ? "Enviando..." : "Enviar enlace"}
        </Button>
      </form>

      <p className="text-center text-sm text-muted">
        <Link href="/login" className="font-medium text-accent">
          Volver a iniciar sesión
        </Link>
      </p>
    </div>
  );
}
