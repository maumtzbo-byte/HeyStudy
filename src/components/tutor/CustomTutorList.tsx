"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { Pencil, Trash2 } from "lucide-react";
import { deleteTutorAction } from "@/app/dashboard/tutores/actions";
import { CustomTutorForm, type TutorFormValues } from "@/components/tutor/CustomTutorForm";
import { Button } from "@/components/ui/Button";
import { Card, CardDescription } from "@/components/ui/Card";
import type { TutorMode } from "@/services/ai/types";

const MODE_LABEL: Record<TutorMode, string> = {
  explicar: "Explicar",
  socratico: "Socrático",
  pista: "Pista",
  practica: "Práctica",
};

export interface TutorListItem extends TutorFormValues {
  id: string;
  subjectName: string | null;
}

export function CustomTutorList({
  tutors,
  subjects,
}: {
  tutors: TutorListItem[];
  subjects: { id: string; name: string }[];
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleDelete(tutorId: string, name: string) {
    if (!window.confirm(`¿Borrar el tutor "${name}"? Las conversaciones que ya tuviste se quedan.`)) return;
    setError(null);
    startTransition(async () => {
      const result = await deleteTutorAction(tutorId);
      if (!result.ok) setError(result.error);
    });
  }

  if (tutors.length === 0) {
    return (
      <Card className="flex flex-col items-center gap-3 text-center sm:flex-row sm:text-left">
        <Image
          src="/mascot/mascota-feliz.png"
          alt=""
          aria-hidden
          width={139}
          height={104}
          className="h-16 w-auto shrink-0"
        />
        <CardDescription>Todavía no tienes tutores propios. Crea uno para que te explique a tu manera.</CardDescription>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {error && <p className="text-sm text-danger">{error}</p>}
      {tutors.map((tutor) =>
        editingId === tutor.id ? (
          <div key={tutor.id} className="rounded-2xl border border-accent/40 bg-surface p-5">
            <CustomTutorForm subjects={subjects} initial={tutor} onDone={() => setEditingId(null)} />
          </div>
        ) : (
          <div key={tutor.id} className="flex items-start gap-4 rounded-2xl border border-border bg-surface p-5">
            <span aria-hidden className="text-2xl leading-none">
              {tutor.emoji}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-semibold text-foreground">{tutor.name}</p>
                <span className="rounded-full bg-accent-soft px-2 py-0.5 text-[11px] font-medium text-accent-hover">
                  {MODE_LABEL[tutor.baseMode]}
                </span>
                <span className="text-[11px] text-subtle">{tutor.subjectName ?? "Todas las materias"}</span>
              </div>
              <p className="mt-1.5 text-sm text-muted">{tutor.instructions}</p>
            </div>
            <div className="flex shrink-0 gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setEditingId(tutor.id)}
                aria-label={`Editar ${tutor.name}`}
              >
                <Pencil className="h-4 w-4" strokeWidth={1.75} />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                disabled={isPending}
                onClick={() => handleDelete(tutor.id, tutor.name)}
                aria-label={`Borrar ${tutor.name}`}
              >
                <Trash2 className="h-4 w-4 text-danger" strokeWidth={1.75} />
              </Button>
            </div>
          </div>
        ),
      )}
    </div>
  );
}
