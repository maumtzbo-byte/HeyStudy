"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";

const NAV_LINKS = [
  { href: "#como-funciona", label: "Cómo funciona" },
  { href: "#demo", label: "Demo" },
  { href: "#precios", label: "Precios" },
];

function HeaderRow({ tone }: { tone: "dark" | "light" }) {
  const dark = tone === "dark";
  return (
    <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-4">
      <Logo inverted={dark} />
      <nav
        className={
          dark
            ? "hidden items-center gap-1 rounded-full border border-white/15 bg-white/10 p-1 backdrop-blur-md md:flex"
            : "hidden items-center gap-1 rounded-full border border-border bg-surface p-1 md:flex"
        }
      >
        {NAV_LINKS.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className={
              dark
                ? "rounded-full px-4 py-1.5 text-sm font-medium text-deep-foreground/90 hover:bg-white/10"
                : "rounded-full px-4 py-1.5 text-sm font-medium text-muted hover:text-foreground"
            }
          >
            {link.label}
          </a>
        ))}
      </nav>
      <div className="flex items-center gap-3">
        <Link
          href="/login"
          className={
            dark
              ? "text-sm font-medium text-deep-muted hover:text-deep-foreground"
              : "text-sm font-medium text-muted hover:text-foreground"
          }
        >
          Iniciar sesión
        </Link>
        <Link href="/registro">
          <Button size="sm" className={dark ? "bg-white text-accent-hover shadow-none hover:bg-white/90" : undefined}>
            Crear cuenta
          </Button>
        </Link>
      </div>
    </div>
  );
}

// Fijo arriba durante todo el scroll de la página (igual que en el video
// de referencia). Hace crossfade entre la variante "sobre foto oscura"
// del hero y la variante "sobre contenido claro" con la misma técnica
// de fundido que ya usa el hero, en vez de cambiar de golpe.
export function SiteHeader() {
  const { scrollY } = useScroll();
  const lightOpacity = useTransform(scrollY, [0, 160], [0, 1]);
  const darkOpacity = useTransform(scrollY, [0, 160], [1, 0]);

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <motion.div style={{ opacity: darkOpacity }} className="absolute inset-0">
        <HeaderRow tone="dark" />
      </motion.div>
      <motion.div
        style={{ opacity: lightOpacity }}
        className="absolute inset-0 border-b border-border bg-background/90 backdrop-blur-md"
      >
        <HeaderRow tone="light" />
      </motion.div>
      {/* fila invisible que reserva la altura real del header */}
      <div className="invisible">
        <HeaderRow tone="dark" />
      </div>
    </header>
  );
}
