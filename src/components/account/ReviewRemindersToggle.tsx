"use client";

import { useActionState, useRef } from "react";
import { updateReviewRemindersEnabledAction } from "@/app/dashboard/perfil/actions";

export function ReviewRemindersToggle({ enabled }: { enabled: boolean }) {
  const [state, formAction] = useActionState(updateReviewRemindersEnabledAction, undefined);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-2">
      <label className="flex items-center gap-2.5 text-sm text-foreground">
        <input
          type="checkbox"
          name="reviewRemindersEnabled"
          defaultChecked={enabled}
          onChange={() => formRef.current?.requestSubmit()}
          className="h-4 w-4 shrink-0 rounded border-border-strong/60 text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        />
        Avísame por correo cuando tenga repasos vencidos
      </label>
      {state && !state.ok && <p className="text-sm text-danger">{state.error}</p>}
    </form>
  );
}
