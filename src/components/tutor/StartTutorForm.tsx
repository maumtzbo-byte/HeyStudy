"use client";

import { useState, useTransition } from "react";
import { startConversationAction } from "@/app/dashboard/materias/[id]/tutor/actions";
import { Button } from "@/components/ui/Button";
import type { TutorMode } from "@/services/ai/types";

const MODES: { value: TutorMode; label: string; description: string }[] = [
  { value: "explicar", label: "Explicar", description: "Una explicación clara y completa, con ejemplo." },
  { value: "socratico", label: "Socrático", description: "Te guía con preguntas, no te da la respuesta directa." },
  { value: "pista", label: "Pista", description: "Una pista breve, sin resolver el problema." },
  { value: "practica", label: "Practicar", description: "Un ejercicio similar para que practiques." },
];

export function StartTutorForm({ subjectId }: { subjectId: string }) {
  const [mode, setMode] = useState<TutorMode>("explicar");
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {MODES.map((m) => (
          <button
            key={m.value}
            type="button"
            onClick={() => setMode(m.value)}
            className={`flex flex-col items-start gap-1 rounded-lg border px-4 py-3 text-left transition-colors ${
              mode === m.value ? "border-accent bg-accent/5" : "border-border hover:bg-border/20"
            }`}
          >
            <span className="text-sm font-medium text-foreground">{m.label}</span>
            <span className="text-xs text-muted">{m.description}</span>
          </button>
        ))}
      </div>
      <Button
        type="button"
        disabled={isPending}
        className="self-start"
        onClick={() => startTransition(() => startConversationAction(subjectId, mode))}
      >
        {isPending ? "Iniciando..." : "Iniciar conversación"}
      </Button>
    </div>
  );
}
