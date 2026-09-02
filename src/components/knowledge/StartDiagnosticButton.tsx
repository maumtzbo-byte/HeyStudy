"use client";

import { useState, useTransition } from "react";
import { startDiagnosticAction } from "@/app/dashboard/materias/[id]/diagnostico/actions";
import { Button } from "@/components/ui/Button";

export function StartDiagnosticButton({ subjectId, topicId }: { subjectId: string; topicId: string }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleClick() {
    setError(null);
    startTransition(async () => {
      const result = await startDiagnosticAction(subjectId, topicId);
      // Si tuvo éxito la action redirige, así que sólo llegamos aquí cuando
      // falló. El caso importante es el límite del plan free: sin esto, ese
      // mensaje nunca llegaba a la pantalla.
      if (!result.ok) setError(result.error);
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button type="button" size="sm" variant="secondary" disabled={isPending} onClick={handleClick}>
        {isPending ? "Preparando..." : "Diagnosticar"}
      </Button>
      {error && <p className="max-w-xs text-right text-xs text-danger">{error}</p>}
    </div>
  );
}
