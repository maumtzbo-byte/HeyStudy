import type { Metadata } from "next";
import { SiteHeader } from "@/components/marketing/SiteHeader";
import { Logo } from "@/components/ui/Logo";

export const metadata: Metadata = {
  title: "Términos de uso — HeyStudy",
};

export default function TerminosPage() {
  return (
    <div className="flex flex-1 flex-col bg-background">
      <SiteHeader />
      <main className="flex-1 px-6 py-20 sm:px-8">
        <div className="mx-auto w-full max-w-2xl">
          <p className="text-xs font-semibold tracking-wide text-accent-hover uppercase">Legal</p>
          <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Términos de uso
          </h1>
          <p className="mt-3 text-sm text-subtle">Última actualización: {new Date().getFullYear()}</p>

          <div className="mt-10 flex flex-col gap-8 text-muted">
            <section>
              <h2 className="text-base font-semibold text-foreground">Etapa temprana</h2>
              <p className="mt-2 text-sm leading-relaxed">
                HeyStudy está en desarrollo activo. Algunas funciones pueden cambiar, y el plan de pago descrito en
                precios está sujeto a ajustes antes de su lanzamiento.
              </p>
            </section>
            <section>
              <h2 className="text-base font-semibold text-foreground">Uso del servicio</h2>
              <p className="mt-2 text-sm leading-relaxed">
                HeyStudy es una herramienta de apoyo al estudio: diagnostica tu nivel real y prioriza qué repasar. No
                reemplaza a tus profesores ni garantiza un resultado específico en tus exámenes.
              </p>
            </section>
            <section>
              <h2 className="text-base font-semibold text-foreground">Tu cuenta</h2>
              <p className="mt-2 text-sm leading-relaxed">
                Eres responsable de mantener segura tu cuenta y de la veracidad de la información que registras
                (materias, tareas, exámenes y materiales).
              </p>
            </section>
            <section>
              <h2 className="text-base font-semibold text-foreground">Contenido que subes</h2>
              <p className="mt-2 text-sm leading-relaxed">
                Los materiales que subes (apuntes, guías) se usan solo para generar tu propio plan de estudio. Eres
                responsable de tener los derechos para subirlos.
              </p>
            </section>
          </div>

          <div className="mt-16 border-t border-border pt-8">
            <Logo />
          </div>
        </div>
      </main>
    </div>
  );
}
