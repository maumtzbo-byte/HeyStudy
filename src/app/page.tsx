import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth/getCurrentUser";
import { MainframeNavbar } from "@/components/mainframe/MainframeNavbar";
import { MainframeHero } from "@/components/mainframe/MainframeHero";

export const metadata: Metadata = {
  title: "HeyStudy: Sabe qué estudiar, hoy",
  description:
    "Diagnóstico de tu nivel real, mapa de conocimiento y un plan de estudio diario que se adapta a ti — con tutor de IA incluido.",
  alternates: { canonical: "/" },
};

export default async function Home() {
  const user = await getAuthUser();
  if (user) redirect("/dashboard");

  return (
    <>
      <MainframeNavbar />
      <MainframeHero />
    </>
  );
}
