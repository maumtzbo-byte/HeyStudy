import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";
import { CapsuleRow } from "@/components/ui/Capsule";

export const metadata: Metadata = { title: "Página no encontrada — HeyStudy" };

export default function NotFound() {
  return (
    <div className="force-light relative flex min-h-dvh flex-1 items-center justify-center overflow-hidden bg-background px-4 py-12">
      <div className="relative flex w-full max-w-sm flex-col items-center text-center">
        {/* Todas grises: aquí no hay nada que medir. El sistema de
            cápsulas también sirve para decir "vacío" sin ilustración. */}
        <CapsuleRow fills={[null, null, null]} className="justify-center" />
        <p className="mt-8 text-sm font-semibold tracking-wide text-accent-hover uppercase">Error 404</p>
        <h1 className="mt-2 font-display text-2xl font-semibold tracking-tight text-foreground">
          Esta página no existe.
        </h1>
        <p className="mt-2 text-sm text-muted">Puede que el enlace esté roto o la página se haya movido.</p>
        <ButtonLink href="/" className="mt-8">
          Volver al inicio
        </ButtonLink>
        <div className="mt-10 opacity-70">
          <Logo />
        </div>
      </div>
    </div>
  );
}
