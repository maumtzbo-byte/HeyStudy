"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Logo } from "@/components/ui/Logo";

const NAV_LINKS = [
  { href: "/dashboard", label: "Hoy" },
  { href: "/dashboard/materias", label: "Materias" },
  { href: "/dashboard/admision", label: "Admisión" },
  { href: "/dashboard/tutores", label: "Tutores" },
  { href: "/dashboard/grupos", label: "Grupos" },
  { href: "/dashboard/amigos", label: "Amigos" },
  { href: "/dashboard/resumen", label: "Resumen" },
];

export function DashboardHeader({ displayName }: { displayName: string }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!menuOpen) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  return (
    <header className="border-b border-border bg-surface">
      <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-4">
        <div className="flex items-center gap-8">
          <Link href="/dashboard">
            <Logo />
          </Link>
          <nav className="hidden items-center gap-6 text-sm font-medium text-muted md:flex">
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="hover:text-foreground">
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="hidden items-center gap-4 md:flex">
          <Link href="/dashboard/perfil" className="text-sm text-muted hover:text-foreground">
            Hola, {displayName}
          </Link>
          <form action="/auth/logout" method="post">
            <button type="submit" className="text-sm font-medium text-muted hover:text-foreground">
              Salir
            </button>
          </form>
        </div>

        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          aria-expanded={menuOpen}
          aria-controls="dashboard-mobile-nav"
          aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-border/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 md:hidden"
        >
          {menuOpen ? <X className="h-5 w-5" strokeWidth={1.75} /> : <Menu className="h-5 w-5" strokeWidth={1.75} />}
        </button>
      </div>

      <AnimatePresence initial={false}>
        {menuOpen && (
          <motion.nav
            id="dashboard-mobile-nav"
            aria-label="Principal, móvil"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-t border-border bg-surface md:hidden"
          >
            <div className="flex flex-col gap-1 px-4 py-4">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="rounded-lg px-2 py-2.5 text-sm font-medium text-foreground hover:bg-border/40"
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/dashboard/perfil"
                onClick={() => setMenuOpen(false)}
                className="rounded-lg px-2 py-2.5 text-sm font-medium text-muted hover:bg-border/40 hover:text-foreground"
              >
                Hola, {displayName}
              </Link>
              <form action="/auth/logout" method="post">
                <button
                  type="submit"
                  className="w-full rounded-lg px-2 py-2.5 text-left text-sm font-medium text-muted hover:bg-border/40 hover:text-foreground"
                >
                  Salir
                </button>
              </form>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
