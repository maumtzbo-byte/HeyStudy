import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth/getCurrentUser";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "HeyStudy — Sabe qué estudiar, hoy",
};

export default async function Home() {
  const user = await getAuthUser();
  if (user) redirect("/dashboard");

  return (
    <div className="flex flex-1 flex-col bg-background">
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-6">
        <span className="text-lg font-semibold tracking-tight text-foreground">HeyStudy</span>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm font-medium text-muted hover:text-foreground">
            Iniciar sesión
          </Link>
          <Link href="/registro">
            <Button size="sm">Crear cuenta</Button>
          </Link>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-3xl flex-col items-center px-4 pt-16 pb-24 text-center sm:pt-24">
        <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
          ¿Qué debería estudiar hoy, y por qué?
        </h1>
        <p className="mt-6 max-w-xl text-lg text-muted">
          HeyStudy diagnostica qué sabes realmente, no solo si respondiste bien o mal, y arma tu plan de estudio
          del día. Las otras apps se adaptan a ti. HeyStudy se adapta a cómo aprendes tú.
        </p>
        <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:gap-4">
          <Link href="/registro" className="w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto">
              Empezar gratis
            </Button>
          </Link>
          <Link href="/login" className="w-full sm:w-auto">
            <Button size="lg" variant="secondary" className="w-full sm:w-auto">
              Ya tengo cuenta
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
