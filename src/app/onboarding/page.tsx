import type { Metadata } from "next";
import Image from "next/image";
import { redirect } from "next/navigation";
import { requireAuthUser } from "@/lib/auth/getCurrentUser";
import { prisma } from "@/lib/prisma/client";
import { OnboardingForm } from "@/components/onboarding/OnboardingForm";
import { Logo } from "@/components/ui/Logo";

export const metadata: Metadata = { title: "Bienvenido — HeyStudy" };

export default async function OnboardingPage() {
  const user = await requireAuthUser();

  const existing = await prisma.studentProfile.findUnique({ where: { userId: user.id } });
  if (existing) redirect("/dashboard");

  return (
    <div className="force-light relative flex min-h-screen flex-1 items-center justify-center overflow-hidden bg-background px-4 py-12">
      <div
        className="pointer-events-none absolute -top-20 -right-20 h-72 w-72 rounded-full bg-accent/15 blur-3xl"
        aria-hidden
      />
      <div className="relative w-full max-w-md">
        <Image
          src="/mascot/mascota-lectura.png"
          alt=""
          aria-hidden
          width={278}
          height={222}
          priority
          className="pointer-events-none relative mx-auto h-20 w-auto"
        />
        <div className="mt-2 mb-8 flex justify-center">
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
