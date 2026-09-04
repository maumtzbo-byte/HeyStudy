import type { ReactNode } from "react";
import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { CapsuleRow } from "@/components/ui/Capsule";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="force-light relative flex min-h-dvh flex-1 items-center justify-center overflow-hidden bg-background px-4 py-12">
      <div className="relative w-full max-w-sm">
        {/* Cápsulas vacías: nadie ha sido medido todavía. Es el estado
            honesto de una pantalla de acceso, y sustituye a la mascota. */}
        <CapsuleRow fills={[null, null, null, null]} className="justify-center" />
        <div className="mt-6 mb-8 flex justify-center">
          <Link href="/">
            <Logo />
          </Link>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-8 shadow-soft">{children}</div>
      </div>
    </div>
  );
}
