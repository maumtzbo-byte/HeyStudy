import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = { title: "Iniciar sesión — HeyStudy" };

export default function LoginPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-lg font-semibold text-foreground">Bienvenido de nuevo</h1>
        <p className="text-sm text-muted">Entra para ver tu plan de estudio de hoy.</p>
      </div>
      <LoginForm />
    </div>
  );
}
