import type { Metadata } from "next";
import { SiteHeader } from "@/components/marketing/SiteHeader";
import { Logo } from "@/components/ui/Logo";

export const metadata: Metadata = {
  title: "Privacidad — HeyStudy",
};

export default function PrivacidadPage() {
  return (
    <div className="flex flex-1 flex-col bg-background">
      <SiteHeader />
      <main className="flex-1 px-6 py-20 sm:px-8">
        <div className="mx-auto w-full max-w-2xl">
          <p className="text-xs font-semibold tracking-wide text-accent-hover uppercase">Legal</p>
          <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Política de privacidad
          </h1>
          <p className="mt-3 text-sm text-subtle">Última actualización: {new Date().getFullYear()}</p>

          <div className="mt-10 flex flex-col gap-8 text-muted">
            <section>
              <h2 className="text-base font-semibold text-foreground">Qué datos guardamos</h2>
              <p className="mt-2 text-sm leading-relaxed">
                Tu cuenta, las materias, tareas y exámenes que registras, los materiales que subes (PDFs o imágenes)
                y las respuestas de tus diagnósticos. Nada más de lo necesario para generar tu mapa de conocimiento y
                tu plan de estudio.
              </p>
            </section>
            <section>
              <h2 className="text-base font-semibold text-foreground">Para qué lo usamos</h2>
              <p className="mt-2 text-sm leading-relaxed">
                Únicamente para generar tu propio diagnóstico, tu mapa de conocimiento y tu plan de estudio diario.
                Tus materiales y respuestas no se comparten con otros usuarios ni se usan para entrenar modelos de
                terceros fuera de brindarte el servicio.
              </p>
            </section>
            <section>
              <h2 className="text-base font-semibold text-foreground">Tu control sobre tus datos</h2>
              <p className="mt-2 text-sm leading-relaxed">
                Puedes eliminar tus materiales, tareas o tu cuenta completa desde tu perfil en cualquier momento.
              </p>
            </section>
            <section>
              <h2 className="text-base font-semibold text-foreground">Contacto</h2>
              <p className="mt-2 text-sm leading-relaxed">
                HeyStudy está en etapa temprana de desarrollo. Si tienes dudas sobre tus datos, escríbenos desde tu
                cuenta.
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
