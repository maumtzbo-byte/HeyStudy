import type { Metadata } from "next";
import { RecuperarForm } from "@/components/auth/RecuperarForm";

export const metadata: Metadata = {
  title: "Recuperar contraseña — HeyStudy",
  description: "Recibe un enlace para restablecer la contraseña de tu cuenta de HeyStudy.",
  alternates: { canonical: "/recuperar" },
};

export default function RecuperarPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-lg font-semibold text-foreground">Recupera tu contraseña</h1>
        <p className="text-sm text-muted">Te mandamos un enlace a tu correo para restablecerla.</p>
      </div>
      <RecuperarForm />
    </div>
  );
}
