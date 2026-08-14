import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireAuthUser } from "@/lib/auth/getCurrentUser";
import { prisma } from "@/lib/prisma/client";
import { OnboardingForm } from "@/components/onboarding/OnboardingForm";

export const metadata: Metadata = { title: "Bienvenido — HeyStudy" };

export default async function OnboardingPage() {
  const user = await requireAuthUser();

  const existing = await prisma.studentProfile.findUnique({ where: { userId: user.id } });
  if (existing) redirect("/dashboard");

  return (
    <div className="flex min-h-screen flex-1 items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <span className="text-xl font-semibold tracking-tight text-foreground">HeyStudy</span>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-8 shadow-sm shadow-black/[0.03]">
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
