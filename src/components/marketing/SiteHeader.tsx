"use client";

import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { ButtonLink } from "@/components/ui/Button";

const NAV_LINKS = [
  { href: "#como-funciona", label: "Cómo funciona" },
  { href: "#demo", label: "Demo" },
  { href: "#precios", label: "Precios" },
];

// Fijo arriba durante todo el scroll de la página. Vidrio real: blur fuerte
// + fondo translúcido, para que lo que scrollea debajo (íconos del hero, la
// banda de color del CTA final) se note desenfocado a través del header —
// no un blur decorativo sin nada detrás que refractar.
export function SiteHeader() {
  return (
    <header
      className="fixed inset-x-0 top-0 z-50 border-b border-white/50 bg-background/65 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] backdrop-blur-xl"
      style={{ backdropFilter: "blur(20px) saturate(160%)", WebkitBackdropFilter: "blur(20px) saturate(160%)" }}
    >
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-4">
        <Logo />
        <nav className="hidden items-center gap-1 rounded-full border border-border bg-surface/80 p-1 backdrop-blur-md md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-full px-4 py-1.5 text-sm font-medium text-muted hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm font-medium text-muted hover:text-foreground">
            Iniciar sesión
          </Link>
          <ButtonLink href="/registro" size="sm">
            Crear cuenta
          </ButtonLink>
        </div>
      </div>
    </header>
  );
}
