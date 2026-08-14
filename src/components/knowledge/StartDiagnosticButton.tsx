"use client";

import { useTransition } from "react";
import { startDiagnosticAction } from "@/app/dashboard/materias/[id]/diagnostico/actions";
import { Button } from "@/components/ui/Button";

export function StartDiagnosticButton({ subjectId, topicId }: { subjectId: string; topicId: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      size="sm"
      variant="secondary"
      disabled={isPending}
      onClick={() => startTransition(() => startDiagnosticAction(subjectId, topicId))}
    >
      {isPending ? "Preparando..." : "Diagnosticar"}
    </Button>
  );
}
