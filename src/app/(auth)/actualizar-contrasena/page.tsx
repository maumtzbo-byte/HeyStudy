import type { Metadata } from "next";
import { requireAuthUser } from "@/lib/auth/getCurrentUser";
import { ActualizarContrasenaForm } from "@/components/auth/ActualizarContrasenaForm";

export const metadata: Metadata = { title: "Nueva contraseña — HeyStudy" };

export default async function ActualizarContrasenaPage() {
  // Sólo se llega aquí con una sesión válida: la crea el enlace de
  // recuperación al pasar por /auth/callback. Sin sesión, requireAuthUser
  // manda a /login — no hay forma de cambiar la contraseña de otra cuenta.
  await requireAuthUser();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-lg font-semibold text-foreground">Elige tu nueva contraseña</h1>
        <p className="text-sm text-muted">Después de guardarla, entras directo a tu cuenta.</p>
      </div>
      <ActualizarContrasenaForm />
    </div>
  );
}
