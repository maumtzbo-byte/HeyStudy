"use client";

import { useActionState, useEffect, useRef } from "react";
import { createAssignmentAction } from "@/app/dashboard/materias/actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export function CreateAssignmentForm({ subjectId }: { subjectId: string }) {
  const [state, formAction, isPending] = useActionState(createAssignmentAction, undefined);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.ok) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <input type="hidden" name="subjectId" value={subjectId} />
      <Input name="title" placeholder="Nueva tarea" required className="sm:flex-1" />
      <Input name="dueDate" type="date" required className="sm:w-40" />
      <Button type="submit" size="sm" disabled={isPending}>
        Agregar
      </Button>
      {state && !state.ok && <p className="text-sm text-danger">{state.error}</p>}
    </form>
  );
}
