"use client";

import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export function CopyReferralLink({ link }: { link: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Portapapeles no disponible (permiso denegado, contexto no seguro):
      // el link ya está visible en el input, se puede copiar a mano.
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Input readOnly value={link} onFocus={(e) => e.currentTarget.select()} className="max-w-xs" />
      <Button type="button" variant="secondary" size="sm" onClick={handleCopy}>
        {copied ? "¡Copiado!" : "Copiar link"}
      </Button>
    </div>
  );
}
