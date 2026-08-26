"use client";

import { useState } from "react";
import { FileText, Image as ImageIcon, Trash2 } from "lucide-react";
import { deleteMaterialAction, getMaterialUrlAction } from "@/app/dashboard/materias/actions";
import { Button } from "@/components/ui/Button";

interface MaterialItem {
  id: string;
  fileName: string;
  fileType: "PDF" | "IMAGEN";
  uploadedAt: Date;
}

export function MaterialList({ subjectId, materials }: { subjectId: string; materials: MaterialItem[] }) {
  const [openingId, setOpeningId] = useState<string | null>(null);

  async function handleView(materialId: string) {
    setOpeningId(materialId);
    try {
      const result = await getMaterialUrlAction(materialId);
      if (!result.ok) {
        window.alert(result.error);
        return;
      }
      window.open(result.data, "_blank", "noopener,noreferrer");
    } finally {
      setOpeningId(null);
    }
  }

  if (materials.length === 0) {
    return <p className="text-sm text-muted">Aún no subes materiales para esta materia.</p>;
  }

  return (
    <div className="flex flex-col divide-y divide-border overflow-hidden rounded-xl border border-border">
      {materials.map((material) => (
        <div key={material.id} className="flex items-center justify-between gap-3 px-4 py-3">
          <button
            type="button"
            onClick={() => handleView(material.id)}
            disabled={openingId === material.id}
            className="flex min-w-0 flex-1 items-center gap-2 text-left"
          >
            {material.fileType === "PDF" ? (
              <FileText className="h-4 w-4 shrink-0 text-muted" />
            ) : (
              <ImageIcon className="h-4 w-4 shrink-0 text-muted" />
            )}
            <span className="truncate text-sm font-medium text-foreground">{material.fileName}</span>
          </button>
          <form action={deleteMaterialAction.bind(null, material.id, subjectId)}>
            <Button type="submit" variant="ghost" size="icon" aria-label="Eliminar material">
              <Trash2 className="h-4 w-4 text-danger" strokeWidth={1.75} />
            </Button>
          </form>
        </div>
      ))}
    </div>
  );
}
