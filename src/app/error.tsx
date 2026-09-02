"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

// Antes no existía ningún error boundary en la app: cualquier excepción no
// manejada (por ejemplo una server action sin runAction) mandaba al
// estudiante a la pantalla de error genérica de Next, sin salida.
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Sin servicio de monitoreo todavía; al menos queda en los logs del
    // servidor con su digest para poder correlacionarlo.
    console.error("[error-boundary]", error.digest, error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-md flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">Algo salió mal</h1>
      <p className="text-sm text-muted">
        No pudimos cargar esta parte de HeyStudy. Puedes intentar de nuevo o volver a tu panel.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button type="button" onClick={reset}>
          Intentar de nuevo
        </Button>
        <Link href="/dashboard" className="text-sm font-medium text-accent hover:underline">
          Ir a mi panel
        </Link>
      </div>
    </div>
  );
}
