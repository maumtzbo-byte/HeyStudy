import type { Metadata } from "next";
import { RegistroForm } from "@/components/auth/RegistroForm";
import { CaptureReferralCode } from "@/components/auth/CaptureReferralCode";

export const metadata: Metadata = {
  title: "Crear cuenta — HeyStudy",
  description: "Crea tu cuenta gratis en HeyStudy y arma tu primer plan de estudio en minutos.",
  alternates: { canonical: "/registro" },
};

export default async function RegistroPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>;
}) {
  const { ref } = await searchParams;

  return (
    <div className="flex flex-col gap-6">
      <CaptureReferralCode code={ref ?? null} />
      <div>
        <h1 className="text-lg font-semibold text-foreground">Crea tu cuenta</h1>
        <p className="text-sm text-muted">Carga tus materias y empieza a estudiar mejor, hoy.</p>
      </div>
      <RegistroForm />
    </div>
  );
}
