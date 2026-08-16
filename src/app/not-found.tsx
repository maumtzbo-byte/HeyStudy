import type { Metadata } from "next";
import Image from "next/image";
import { ButtonLink } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";

export const metadata: Metadata = { title: "Página no encontrada — HeyStudy" };

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen flex-1 items-center justify-center overflow-hidden bg-background px-4 py-12">
      <div
        className="pointer-events-none absolute -top-20 -left-20 h-72 w-72 rounded-full bg-accent/15 blur-3xl"
        aria-hidden
      />
      <div className="relative flex w-full max-w-sm flex-col items-center text-center">
        <Image
          src="/mascot/mascota-feliz.png"
          alt=""
          aria-hidden
          width={193}
          height={144}
          priority
          className="pointer-events-none h-24 w-auto"
        />
        <p className="mt-6 text-sm font-semibold tracking-wide text-accent-hover uppercase">Error 404</p>
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
