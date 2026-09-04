import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireAuthUser } from "@/lib/auth/getCurrentUser";
import { prisma } from "@/lib/prisma/client";
import { OnboardingForm } from "@/components/onboarding/OnboardingForm";
import { Logo } from "@/components/ui/Logo";
import { CapsuleRow } from "@/components/ui/Capsule";

export const metadata: Metadata = { title: "Bienvenido — HeyStudy" };

export default async function OnboardingPage() {
  const user = await requireAuthUser();

  const existing = await prisma.studentProfile.findUnique({ where: { userId: user.id } });
  if (existing) redirect("/dashboard");

  return (
    <div className="force-light relative flex min-h-dvh flex-1 items-center justify-center overflow-hidden bg-background px-4 py-12">
      <div className="relative w-full max-w-md">
        {/* El estado real de quien empieza: nada medido todavía. Estas
            mismas cápsulas se irán llenando conforme se diagnostique. */}
        <CapsuleRow fills={[null, null, null, null, null]} className="justify-center" />
        <div className="mt-6 mb-8 flex justify-center">
          <Logo />
        </div>
        <div className="rounded-2xl border border-border bg-surface p-8 shadow-soft">
          <h1 className="mb-1 text-lg font-semibold text-foreground">Cuéntanos de ti</h1>
          <p className="mb-6 text-sm text-muted">
            Con esto armamos tu espacio de estudio. Puedes ajustar todo después.
          </p>
          <OnboardingForm />
        </div>
      </div>
    </div>
  );
}
