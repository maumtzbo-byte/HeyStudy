"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { createSubjectAction } from "@/app/dashboard/materias/actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

const COLOR_OPTIONS = ["#C1502E", "#2A6F73", "#B8860B", "#4B7B5D", "#7D4F6D", "#B15D5D"];

export function CreateSubjectForm() {
  const [state, formAction, isPending] = useActionState(createSubjectAction, undefined);
  const formRef = useRef<HTMLFormElement>(null);
  const [color] = useState(() => COLOR_OPTIONS[Math.floor(Math.random() * COLOR_OPTIONS.length)]);

  useEffect(() => {
    if (state?.success) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <div className="flex-1">
        <Input name="name" placeholder="Nombre de la materia (p. ej. Cálculo)" required />
      </div>
      <input type="hidden" name="color" value={color} />
      <Button type="submit" disabled={isPending}>
        {isPending ? "Agregando..." : "Agregar materia"}
      </Button>
      {state?.error && <p className="text-sm text-danger">{state.error}</p>}
    </form>
  );
}
