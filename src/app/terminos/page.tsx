import type { Metadata } from "next";
import { SiteHeader } from "@/components/marketing/SiteHeader";
import { Logo } from "@/components/ui/Logo";

export const metadata: Metadata = {
  title: "Términos de uso — HeyStudy",
  description: "Condiciones de uso de HeyStudy: edad mínima, propiedad, límite de responsabilidad y más.",
  alternates: { canonical: "/terminos" },
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
              <h2 className="text-base font-semibold text-foreground">Edad mínima</h2>
              <p className="mt-2 text-sm leading-relaxed">
                HeyStudy es para estudiantes de al menos 13 años. Si tienes entre 13 y 17 años, úsalo con
                conocimiento de tu padre, madre o tutor. No está dirigido a niños menores de 13 años, y no
                permitimos crear cuentas para ellos.
              </p>
            </section>
            <section>
              <h2 className="text-base font-semibold text-foreground">El tutor lo genera inteligencia artificial</h2>
              <p className="mt-2 text-sm leading-relaxed">
                Las explicaciones, pistas, diagnósticos y planes de estudio de HeyStudy los genera un modelo de IA
                (no una persona). Puede cometer errores — verifica lo importante con tu profesor o tu libro de
                texto. Filtramos mensajes que muestren señales de riesgo o contenido fuera de lo académico, pero
                ese filtro no es perfecto y no sustituye ayuda humana real: si tú o alguien que conoces está en
                crisis, contacta a un adulto de confianza o a la Línea de la Vida (800 911 2000, México, gratis
                24/7).
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
            <section>
              <h2 className="text-base font-semibold text-foreground">Qué no puedes hacer</h2>
              <p className="mt-2 text-sm leading-relaxed">
                No uses HeyStudy para generar o pedir contenido ilegal, sexual, violento, o para intentar evadir
                los filtros de seguridad del tutor. Podemos suspender o cerrar cuentas que violen esto.
              </p>
            </section>
            <section>
              <h2 className="text-base font-semibold text-foreground">Propiedad</h2>
              <p className="mt-2 text-sm leading-relaxed">
                HeyStudy y su marca nos pertenecen. Los materiales que tú subes siguen siendo tuyos — solo nos das
                el permiso necesario para procesarlos y darte el servicio.
              </p>
            </section>
            <section>
              <h2 className="text-base font-semibold text-foreground">Límite de responsabilidad</h2>
              <p className="mt-2 text-sm leading-relaxed">
                HeyStudy se ofrece &quot;como está&quot;, sin garantía de resultados específicos. En la medida que
                lo permita la ley, no somos responsables por daños indirectos derivados del uso del servicio.
              </p>
            </section>
            <section>
              <h2 className="text-base font-semibold text-foreground">Cambios y ley aplicable</h2>
              <p className="mt-2 text-sm leading-relaxed">
                Podemos actualizar estos términos; los cambios importantes se avisarán en esta página. Estos
                términos se rigen por las leyes de los Estados Unidos Mexicanos.
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
