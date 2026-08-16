"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { startConversationAction } from "@/app/dashboard/materias/[id]/tutor/actions";
import { Button } from "@/components/ui/Button";
import type { TutorMode } from "@/services/ai/types";

const MODES: { value: TutorMode; label: string; description: string }[] = [
  { value: "explicar", label: "Explicar", description: "Una explicación clara y completa, con ejemplo." },
  { value: "socratico", label: "Socrático", description: "Te guía con preguntas, no te da la respuesta directa." },
  { value: "pista", label: "Pista", description: "Una pista breve, sin resolver el problema." },
  { value: "practica", label: "Practicar", description: "Un ejercicio similar para que practiques." },
];

export interface TutorOption {
  id: string;
  name: string;
  emoji: string;
  baseMode: TutorMode;
}

export function StartTutorForm({ subjectId, tutors }: { subjectId: string; tutors: TutorOption[] }) {
  const [mode, setMode] = useState<TutorMode>("explicar");
  // null = tutor por defecto de HeyStudy; el estilo lo elige el estudiante.
  const [tutorId, setTutorId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const selectedTutor = tutors.find((t) => t.id === tutorId) ?? null;

  return (
    <div className="flex flex-col gap-5">
      {tutors.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-medium text-foreground">¿Con quién quieres estudiar?</p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setTutorId(null)}
              aria-pressed={tutorId === null}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                tutorId === null ? "border-accent bg-accent-soft text-accent-hover" : "border-border hover:bg-border/20"
              }`}
            >
              Tutor de HeyStudy
            </button>
            {tutors.map((tutor) => (
              <button
                key={tutor.id}
                type="button"
                onClick={() => setTutorId(tutor.id)}
                aria-pressed={tutorId === tutor.id}
                className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                  tutorId === tutor.id
                    ? "border-accent bg-accent-soft text-accent-hover"
                    : "border-border hover:bg-border/20"
                }`}
              >
                <span aria-hidden>{tutor.emoji}</span>
                {tutor.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {selectedTutor ? (
        <p className="rounded-xl border border-border bg-background px-4 py-3 text-sm text-muted">
          <span aria-hidden>{selectedTutor.emoji}</span> <strong className="text-foreground">{selectedTutor.name}</strong>{" "}
          usa su propio estilo configurado.{" "}
          <Link href="/dashboard/tutores" className="text-accent-hover underline">
            Editarlo
          </Link>
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {MODES.map((m) => (
            <button
              key={m.value}
              type="button"
              onClick={() => setMode(m.value)}
              aria-pressed={mode === m.value}
              className={`flex flex-col items-start gap-1 rounded-lg border px-4 py-3 text-left transition-colors ${
                mode === m.value ? "border-accent bg-accent/5" : "border-border hover:bg-border/20"
              }`}
            >
              <span className="text-sm font-medium text-foreground">{m.label}</span>
              <span className="text-xs text-muted">{m.description}</span>
            </button>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="button"
          disabled={isPending}
          onClick={() => startTransition(() => startConversationAction(subjectId, mode, tutorId))}
        >
          {isPending ? "Iniciando..." : "Iniciar conversación"}
        </Button>
        {tutors.length === 0 && (
          <Link href="/dashboard/tutores" className="text-sm text-accent-hover underline">
            Crear un tutor a tu medida
          </Link>
        )}
      </div>
    </div>
  );
}
