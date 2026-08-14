"use client";

import { useActionState, useEffect, useRef } from "react";
import { uploadMaterialAction } from "@/app/dashboard/materias/actions";
import { Button } from "@/components/ui/Button";

export function MaterialUploadForm({ subjectId }: { subjectId: string }) {
  const [state, formAction, isPending] = useActionState(uploadMaterialAction, undefined);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <input type="hidden" name="subjectId" value={subjectId} />
      <input
        name="file"
        type="file"
        accept="application/pdf,image/png,image/jpeg,image/webp"
        required
        className="flex-1 text-sm text-muted file:mr-3 file:rounded-lg file:border-0 file:bg-accent file:px-3 file:py-2 file:text-sm file:font-medium file:text-accent-foreground"
      />
      <Button type="submit" size="sm" disabled={isPending}>
        {isPending ? "Subiendo..." : "Subir"}
      </Button>
      {state?.error && <p className="text-sm text-danger">{state.error}</p>}
    </form>
  );
}
