"use client";

import { useTransition } from "react";
import { generateTopicsAction } from "@/app/dashboard/materias/[id]/diagnostico/actions";
import { Button } from "@/components/ui/Button";

export function GenerateTopicsButton({ subjectId }: { subjectId: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      disabled={isPending}
      onClick={() => startTransition(() => generateTopicsAction(subjectId))}
    >
      {isPending ? "Generando temas..." : "Generar temas"}
    </Button>
  );
}
