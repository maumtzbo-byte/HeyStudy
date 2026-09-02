"use client";

import { useState, useTransition } from "react";
import { generateTopicsAction } from "@/app/dashboard/materias/[id]/diagnostico/actions";
import { Button } from "@/components/ui/Button";

export function GenerateTopicsButton({ subjectId }: { subjectId: string }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleClick() {
    setError(null);
    startTransition(async () => {
      const result = await generateTopicsAction(subjectId);
      if (!result.ok) setError(result.error);
    });
  }

  return (
    <div className="flex flex-col gap-1">
      <Button type="button" disabled={isPending} onClick={handleClick} className="w-fit">
        {isPending ? "Generando temas..." : "Generar temas"}
      </Button>
      {error && <p className="text-sm text-danger">{error}</p>}
    </div>
  );
}
