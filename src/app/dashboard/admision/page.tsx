import type { Metadata } from "next";
import { requireStudentProfile } from "@/lib/auth/getCurrentUser";
import { ADMISSION_TARGETS } from "@/lib/data/standardizedExams";
import { AdmissionTargetGrid } from "@/components/knowledge/AdmissionTargetGrid";

export const metadata: Metadata = { title: "Exámenes de admisión — HeyStudy" };

export default async function AdmisionPage() {
  await requireStudentProfile();

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">Exámenes de admisión</h1>
        <p className="mt-1 text-sm text-muted">
          Elige a qué universidad quieres entrar. Armamos el temario de su examen y te llevamos directo a
          diagnosticar qué tan preparado estás.
        </p>
      </div>

      <AdmissionTargetGrid targets={ADMISSION_TARGETS} />

      <p className="text-xs text-subtle">
        Las áreas y temas son una guía de referencia general (para la PAA, del formato conocido del examen; para
        EXANI, de sus áreas publicadas) — no son el temario oficial vigente de College Board, CENEVAL ni de
        ninguna universidad. La UANL agrega además un módulo específico por carrera que no está incluido aquí.
      </p>
    </div>
  );
}
