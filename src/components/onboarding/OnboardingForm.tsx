"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Plus, X } from "lucide-react";
import { submitOnboardingAction } from "@/app/onboarding/actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";
import { ADMISSION_TARGETS } from "@/lib/data/standardizedExams";

// Solo lo que HeyStudy realmente sirve — ver la sección "educationLevels"
// en lib/validation/onboardingSchemas.ts.
const EDUCATION_LEVEL_LABELS: Record<string, string> = {
  PREPARATORIA: "Preparatoria",
  UNIVERSIDAD: "Universidad",
  OTRO: "Otro",
};

// Ver "studyMethods" en lib/validation/onboardingSchemas.ts.
const STUDY_METHOD_LABELS: Record<string, string> = {
  VIDEOS: "Viendo videos",
  LECTURA: "Leyendo",
  PRACTICA: "Practicando con ejercicios",
  MIXTO: "Un poco de todo",
};

export function OnboardingForm() {
  const [state, formAction, isPending] = useActionState(submitOnboardingAction, undefined);
  const [subjects, setSubjects] = useState<string[]>(["", ""]);
  const [admissionTargetId, setAdmissionTargetId] = useState("");

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
        <Label htmlFor="preferredStudyMethod">¿Cuál es tu manera favorita de estudiar?</Label>
        <Select id="preferredStudyMethod" name="preferredStudyMethod" defaultValue="MIXTO" required>
          {Object.entries(STUDY_METHOD_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
        <p className="text-xs text-muted">
          Si prefieres video, tu plan de estudio te sugerirá videos de los temas que más te cuesten.
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="admissionTargetId">¿Te estás preparando para un examen de admisión?</Label>
        <Select
          id="admissionTargetId"
          name="admissionTargetId"
          value={admissionTargetId}
          onChange={(e) => setAdmissionTargetId(e.target.value)}
        >
          <option value="">No, sólo llevo mis materias de la escuela</option>
          {ADMISSION_TARGETS.map((target) => (
            <option key={target.id} value={target.id}>
              {target.name}
            </option>
          ))}
        </Select>
        <p className="text-xs text-muted">
          Si eliges uno, dejamos listas las áreas de ese examen para que puedas diagnosticarte desde el primer día.
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>¿Qué materias cursas?{admissionTargetId && " (opcional)"}</Label>
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

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="schoolCalendarUrl">Link de calendario de tu escuela (opcional)</Label>
        <Input id="schoolCalendarUrl" name="schoolCalendarUrl" type="url" placeholder="https://..." />
        <p className="text-xs text-muted">
          Si tu escuela usa Toddle, Google Classroom, Canvas, Moodle o algo parecido, busca la opción de
          &ldquo;Suscribirse&rdquo; o &ldquo;Exportar calendario&rdquo; y pega aquí ese link — así podremos avisarte de tareas y
          exámenes sin que los captures a mano. Si no lo tienes a la mano, lo puedes agregar después desde tu cuenta.
        </p>
      </div>

      <label className="flex items-start gap-2.5 text-sm text-muted">
        <input
          type="checkbox"
          name="ageConfirmed"
          required
          className="mt-0.5 h-4 w-4 shrink-0 rounded border-border-strong/60 text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        />
        <span>
          Confirmo que tengo al menos 13 años y acepto los{" "}
          <Link href="/terminos" target="_blank" className="font-medium text-accent hover:underline">
            Términos de uso
          </Link>{" "}
          y la{" "}
          <Link href="/privacidad" target="_blank" className="font-medium text-accent hover:underline">
            Política de privacidad
          </Link>
          .
        </span>
      </label>

      {state?.error && <p className="text-sm text-danger">{state.error}</p>}

      <Button type="submit" size="lg" disabled={isPending}>
        {isPending ? "Preparando tu HeyStudy..." : "Empezar"}
      </Button>
    </form>
  );
}
