"use client";

import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { deleteSubjectAction } from "@/app/dashboard/materias/actions";

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
    <button
      type="button"
      onClick={handleDelete}
      className="flex items-center gap-1.5 text-sm font-medium text-danger hover:opacity-80"
    >
      <Trash2 className="h-4 w-4" /> Eliminar materia
    </button>
  );
}
