import type { ReactNode } from "react";
import Link from "next/link";
import { requireStudentProfile } from "@/lib/auth/getCurrentUser";
import { Logo } from "@/components/ui/Logo";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const { studentProfile } = await requireStudentProfile();

  return (
    <div className="flex min-h-screen flex-1 flex-col bg-background">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-4">
          <div className="flex items-center gap-8">
            <Link href="/dashboard">
              <Logo />
            </Link>
            <nav className="flex items-center gap-4 text-sm font-medium text-muted sm:gap-6">
              <Link href="/dashboard" className="hover:text-foreground">
                Hoy
              </Link>
              <Link href="/dashboard/materias" className="hover:text-foreground">
                Materias
              </Link>
              <Link href="/dashboard/tutores" className="hover:text-foreground">
                Tutores
              </Link>
              <Link href="/dashboard/grupos" className="hover:text-foreground">
                Grupos
              </Link>
              <Link href="/dashboard/resumen" className="hover:text-foreground">
                Resumen
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-muted sm:inline">Hola, {studentProfile.displayName}</span>
            <form action="/auth/logout" method="post">
              <button type="submit" className="text-sm font-medium text-muted hover:text-foreground">
                Salir
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">{children}</main>
    </div>
  );
}
