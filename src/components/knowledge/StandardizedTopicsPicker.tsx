"use client";

import { useState, useTransition } from "react";
import { loadStandardizedTopicsAction } from "@/app/dashboard/materias/[id]/diagnostico/actions";
import { STANDARDIZED_TOPIC_TEMPLATES } from "@/lib/data/standardizedExams";
import { Button } from "@/components/ui/Button";

// Sección 4.5: cargar un temario de referencia para exámenes de admisión
// estandarizados, sin gastar una llamada a IA. El texto deja claro que es
// contenido de referencia general, no el temario oficial — no tenemos forma
// de garantizar que coincida con la versión vigente de CENEVAL.
export function StandardizedTopicsPicker({ subjectId }: { subjectId: string }) {
  const [templateId, setTemplateId] = useState(STANDARDIZED_TOPIC_TEMPLATES[0]?.id ?? "");
  const [isPending, startTransition] = useTransition();
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (STANDARDIZED_TOPIC_TEMPLATES.length === 0) return null;

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-border p-4">
      <p className="text-sm font-medium text-foreground">Cargar temario de examen de admisión</p>
      <p className="text-xs text-muted">
        Áreas y temas de referencia para exámenes tipo EXANI. Son una guía general, no el temario oficial vigente.
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <select
          value={templateId}
          onChange={(e) => {
            setTemplateId(e.target.value);
            setDone(false);
          }}
          className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground"
        >
          {STANDARDIZED_TOPIC_TEMPLATES.map((t) => (
            <option key={t.id} value={t.id}>
              {t.examGroup} — {t.label}
            </option>
          ))}
        </select>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          disabled={isPending || !templateId}
          onClick={() =>
            startTransition(async () => {
              setError(null);
              const result = await loadStandardizedTopicsAction(subjectId, templateId);
              if (!result.ok) {
                setError(result.error);
                return;
              }
              setDone(true);
            })
          }
        >
          {isPending ? "Cargando..." : "Cargar temas"}
        </Button>
        {done && !isPending && <span className="text-xs text-success">Temas cargados.</span>}
        {error && <span className="text-xs text-danger">{error}</span>}
      </div>
    </div>
  );
}
