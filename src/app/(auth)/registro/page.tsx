import type { Metadata } from "next";
import { RegistroForm } from "@/components/auth/RegistroForm";

export const metadata: Metadata = { title: "Crear cuenta — HeyStudy" };

export default function RegistroPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-lg font-semibold text-foreground">Crea tu cuenta</h1>
        <p className="text-sm text-muted">Carga tus materias y empieza a estudiar mejor, hoy.</p>
      </div>
      <RegistroForm />
    </div>
  );
}
