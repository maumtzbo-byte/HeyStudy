"use client";

import { useState, useTransition } from "react";
import { Check, X, UserMinus } from "lucide-react";
import { respondFriendRequestAction, removeFriendAction } from "@/app/dashboard/amigos/actions";
import { Button } from "@/components/ui/Button";

export function IncomingRequestActions({ friendshipId }: { friendshipId: string }) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function respond(accept: boolean) {
    setError(null);
    startTransition(async () => {
      const result = await respondFriendRequestAction(friendshipId, accept);
      if (!result.ok) setError(result.error);
    });
  }

  return (
    <div className="flex shrink-0 flex-col items-end gap-1">
      <div className="flex gap-1">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          disabled={isPending}
          aria-label="Aceptar solicitud"
          onClick={() => respond(true)}
        >
          <Check className="h-4 w-4 text-success" strokeWidth={2} />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          disabled={isPending}
          aria-label="Rechazar solicitud"
          onClick={() => respond(false)}
        >
          <X className="h-4 w-4 text-danger" strokeWidth={2} />
        </Button>
      </div>
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}

export function RemoveFriendButton({ friendshipId, label }: { friendshipId: string; label: string }) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex shrink-0 flex-col items-end gap-1">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        disabled={isPending}
        aria-label={label}
        onClick={() => {
          if (!window.confirm(`${label}?`)) return;
          setError(null);
          startTransition(async () => {
            const result = await removeFriendAction(friendshipId);
            if (!result.ok) setError(result.error);
          });
        }}
      >
        <UserMinus className="h-4 w-4 text-subtle" strokeWidth={1.75} />
      </Button>
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}
