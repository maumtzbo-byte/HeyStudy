import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Verifica tu correo — HeyStudy" };

export default function VerificarCorreoPage() {
  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <h1 className="text-lg font-semibold text-foreground">Revisa tu correo</h1>
      <p className="text-sm text-muted">
        Te enviamos un enlace de confirmación. Ábrelo para activar tu cuenta y empezar a usar HeyStudy.
      </p>
      <Link href="/login" className="text-sm font-medium text-accent">
        Volver a iniciar sesión
      </Link>
    </div>
  );
}
