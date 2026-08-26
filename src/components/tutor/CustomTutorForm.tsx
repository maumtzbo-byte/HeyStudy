"use client";

import { useActionState, useEffect, useState } from "react";
import { createTutorAction, updateTutorAction } from "@/app/dashboard/tutores/actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import type { TutorMode } from "@/services/ai/types";

const EMOJI_OPTIONS = ["🎓", "🧠", "🔬", "📐", "🧪", "🗺️", "⚡", "🦉", "🎯", "📚"];

const MODE_LABELS: { value: TutorMode; label: string; hint: string }[] = [
  { value: "explicar", label: "Explicar", hint: "Explicación clara y completa, con ejemplo" },
  { value: "socratico", label: "Socrático", hint: "Nunca da la respuesta: te guía con preguntas" },
  { value: "pista", label: "Pista", hint: "Una sola pista breve, sin resolverlo" },
  { value: "practica", label: "Práctica", hint: "Te propone ejercicios similares" },
];

export const MAX_INSTRUCTIONS = 600;

export interface TutorFormValues {
  id?: string;
  name: string;
  emoji: string;
  instructions: string;
  baseMode: TutorMode;
  subjectId: string | null;
}

export function CustomTutorForm({
  subjects,
  initial,
  onDone,
}: {
  subjects: { id: string; name: string }[];
  initial?: TutorFormValues;
  onDone?: () => void;
}) {
  const isEdit = Boolean(initial?.id);
  const [state, formAction, isPending] = useActionState(isEdit ? updateTutorAction : createTutorAction, undefined);
  const [emoji, setEmoji] = useState(initial?.emoji ?? "🎓");
  const [length, setLength] = useState(initial?.instructions.length ?? 0);

  // Al editar, cerrar el panel después de guardar. React 19 ya limpia por su
  // cuenta los campos no controlados de un form cuando la action termina bien,
  // así que aquí no hay que resetear nada a mano.
  useEffect(() => {
    if (state?.ok && isEdit) onDone?.();
  }, [state, isEdit, onDone]);

  return (
    <form
      action={formAction}
      // El reset automático de React dispara el evento nativo, así que el
      // contador se sincroniza sin necesidad de un efecto.
      onReset={() => {
        setLength(0);
        setEmoji("🎓");
      }}
      className="flex flex-col gap-5"
    >
      {initial?.id && <input type="hidden" name="tutorId" value={initial.id} />}
      <input type="hidden" name="emoji" value={emoji} />

      <div className="flex flex-col gap-2">
        <Label htmlFor="tutor-name">Nombre</Label>
        <Input
          id="tutor-name"
          name="name"
          defaultValue={initial?.name}
          placeholder="p. ej. Profe Ana"
          maxLength={40}
          required
        />
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-sm font-medium text-foreground">Ícono</legend>
        <div className="flex flex-wrap gap-2">
          {EMOJI_OPTIONS.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setEmoji(option)}
              aria-label={`Usar ícono ${option}`}
              aria-pressed={emoji === option}
              className={`flex h-11 w-11 items-center justify-center rounded-xl border text-lg transition-all duration-100 ease-out active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 ${
                emoji === option
                  ? "border-accent bg-accent shadow-sm"
                  : "border-border bg-background hover:border-border-strong hover:bg-surface-elevated"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="flex flex-col gap-2">
        <Label htmlFor="tutor-mode">Estilo base</Label>
        <Select id="tutor-mode" name="baseMode" defaultValue={initial?.baseMode ?? "explicar"}>
          {MODE_LABELS.map((mode) => (
            <option key={mode.value} value={mode.value}>
              {mode.label} — {mode.hint}
            </option>
          ))}
        </Select>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="tutor-subject">Materia</Label>
        <Select id="tutor-subject" name="subjectId" defaultValue={initial?.subjectId ?? ""}>
          <option value="">Todas las materias</option>
          {subjects.map((subject) => (
            <option key={subject.id} value={subject.id}>
              {subject.name}
            </option>
          ))}
        </Select>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="tutor-instructions">¿Cómo quieres que te explique?</Label>
        <Textarea
          id="tutor-instructions"
          name="instructions"
          defaultValue={initial?.instructions}
          onChange={(e) => setLength(e.target.value.length)}
          rows={4}
          maxLength={MAX_INSTRUCTIONS}
          placeholder="p. ej. Explícame con analogías de futbol, ve directo al grano y ponme un ejemplo resuelto antes de preguntarme nada."
          required
        />
        <p className="text-xs text-subtle">
          {length}/{MAX_INSTRUCTIONS} · Cambia el tono y el estilo, no la exactitud de lo que te enseña.
        </p>
      </div>

      {state && !state.ok && <p className="text-sm text-danger">{state.error}</p>}

      <div className="flex gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Guardando..." : isEdit ? "Guardar cambios" : "Crear tutor"}
        </Button>
        {isEdit && onDone && (
          <Button type="button" variant="secondary" onClick={onDone}>
            Cancelar
          </Button>
        )}
      </div>
    </form>
  );
}
