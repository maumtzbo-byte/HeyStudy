"use client";

import { useActionState, useRef } from "react";
import type { ActionResult } from "@/lib/actions/result";

// Checkbox de preferencia de correo que se auto-envía al cambiar — mismo
// patrón para recordatorios de repaso, resumen semanal, avisos de entregas
// y reporte a padres/tutores, así que vive una sola vez aquí.
export function EmailToggle({
  action,
  fieldName,
  enabled,
  label,
}: {
  action: (prev: ActionResult | undefined, formData: FormData) => Promise<ActionResult>;
  fieldName: string;
  enabled: boolean;
  label: string;
}) {
  const [state, formAction] = useActionState(action, undefined);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-2">
      <label className="flex items-center gap-2.5 text-sm text-foreground">
        <input
          type="checkbox"
          name={fieldName}
          defaultChecked={enabled}
          onChange={() => formRef.current?.requestSubmit()}
          className="h-4 w-4 shrink-0 rounded border-border-strong/60 text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        />
        {label}
      </label>
      {state && !state.ok && <p className="text-sm text-danger">{state.error}</p>}
    </form>
  );
}
