"use client";

import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { deleteSubjectAction } from "@/app/dashboard/materias/actions";
import { Button } from "@/components/ui/Button";

export function DeleteSubjectButton({ subjectId, subjectName }: { subjectId: string; subjectName: string }) {
  const router = useRouter();

  async function handleDelete() {
    if (!window.confirm(`¿Eliminar "${subjectName}"? Esto borra también sus tareas, exámenes y materiales.`)) {
      return;
    }
    const result = await deleteSubjectAction(subjectId);
    if (!result.ok) {
      window.alert(result.error);
      return;
    }
    router.push("/dashboard/materias");
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={handleDelete}
      className="text-danger hover:bg-danger/10"
    >
      <Trash2 className="h-4 w-4" strokeWidth={1.75} /> Eliminar materia
    </Button>
  );
}
