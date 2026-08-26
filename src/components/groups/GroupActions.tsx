"use client";

import { useState, useTransition } from "react";
import { Share2, X, LogOut } from "lucide-react";
import { shareTodayPlanAction, unsharePlanAction, leaveGroupAction } from "@/app/dashboard/grupos/actions";
import { Button } from "@/components/ui/Button";

export function ShareTodayPlanButton({
  groupId,
  alreadyShared,
  hasPlan,
}: {
  groupId: string;
  alreadyShared: boolean;
  hasPlan: boolean;
}) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!hasPlan) {
    return (
      <p className="text-sm text-muted">
        Genera tu plan de hoy en <strong className="text-foreground">Hoy</strong> para poder compartirlo.
      </p>
    );
  }

  if (alreadyShared) {
    return <p className="text-sm text-success">Ya compartiste tu plan de hoy con este grupo.</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      <Button
        type="button"
        disabled={isPending}
        onClick={() => {
          setError(null);
          startTransition(async () => {
            const result = await shareTodayPlanAction(groupId);
            if (!result.ok) setError(result.error);
          });
        }}
      >
        <Share2 className="h-4 w-4" strokeWidth={1.75} />
        {isPending ? "Compartiendo..." : "Compartir mi plan de hoy"}
      </Button>
      {error && <p className="text-sm text-danger">{error}</p>}
    </div>
  );
}

export function UnshareButton({ groupId, sharedPlanId }: { groupId: string; sharedPlanId: string }) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex shrink-0 flex-col items-end gap-1">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        disabled={isPending}
        aria-label="Dejar de compartir este plan"
        onClick={() => {
          setError(null);
          startTransition(async () => {
            const result = await unsharePlanAction(groupId, sharedPlanId);
            if (!result.ok) setError(result.error);
          });
        }}
      >
        <X className="h-4 w-4 text-subtle" strokeWidth={1.75} />
      </Button>
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}

export function LeaveGroupButton({ groupId, isOwner }: { groupId: string; isOwner: boolean }) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const message = isOwner
    ? "Eres quien creó el grupo: si sales, el grupo se borra para todos. ¿Continuar?"
    : "¿Salir de este grupo?";

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        disabled={isPending}
        onClick={() => {
          if (!window.confirm(message)) return;
          setError(null);
          startTransition(async () => {
            // En caso de éxito esto redirige y nunca regresa un resultado.
            const result = await leaveGroupAction(groupId);
            if (!result.ok) setError(result.error);
          });
        }}
      >
        <LogOut className="h-4 w-4" strokeWidth={1.75} />
        {isOwner ? "Borrar grupo" : "Salir"}
      </Button>
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}
