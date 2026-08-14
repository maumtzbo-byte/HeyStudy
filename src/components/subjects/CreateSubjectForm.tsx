"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { createSubjectAction } from "@/app/dashboard/materias/actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

const COLOR_OPTIONS = ["#4F46E5", "#0EA5E9", "#F59E0B", "#10B981", "#EC4899", "#8B5CF6"];

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
