"use client";

import { useActionState, useState } from "react";
import { Plus, X } from "lucide-react";
import { submitOnboardingAction } from "@/app/onboarding/actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";

const EDUCATION_LEVEL_LABELS: Record<string, string> = {
  PRIMARIA: "Primaria",
  SECUNDARIA: "Secundaria",
  PREPARATORIA: "Preparatoria",
  UNIVERSIDAD: "Universidad",
  OTRO: "Otro",
};

export function OnboardingForm() {
  const [state, formAction, isPending] = useActionState(submitOnboardingAction, undefined);
  const [subjects, setSubjects] = useState<string[]>(["", ""]);

  function updateSubject(index: number, value: string) {
    setSubjects((prev) => prev.map((s, i) => (i === index ? value : s)));
  }

  function addSubject() {
    setSubjects((prev) => [...prev, ""]);
  }

  function removeSubject(index: number) {
    setSubjects((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="displayName">¿Cómo te llamas?</Label>
        <Input id="displayName" name="displayName" placeholder="Tu nombre" required />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="educationLevel">¿Qué nivel cursas?</Label>
        <Select id="educationLevel" name="educationLevel" defaultValue="PREPARATORIA" required>
          {Object.entries(EDUCATION_LEVEL_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>¿Qué materias cursas?</Label>
        <div className="flex flex-col gap-2">
          {subjects.map((subject, index) => (
            <div key={index} className="flex items-center gap-2">
              <Input
                name="subjectNames"
                value={subject}
                onChange={(e) => updateSubject(index, e.target.value)}
                placeholder={`Materia ${index + 1}`}
              />
              {subjects.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeSubject(index)}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-muted hover:bg-border/40"
                  aria-label="Quitar materia"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addSubject}
          className="mt-1 flex w-fit items-center gap-1.5 text-sm font-medium text-accent"
        >
          <Plus className="h-4 w-4" /> Agregar materia
        </button>
      </div>

      {state?.error && <p className="text-sm text-danger">{state.error}</p>}

      <Button type="submit" size="lg" disabled={isPending}>
        {isPending ? "Preparando tu HeyStudy..." : "Empezar"}
      </Button>
    </form>
  );
}
