import type { Metadata } from "next";
import { SiteHeader } from "@/components/marketing/SiteHeader";
import { Logo } from "@/components/ui/Logo";

export const metadata: Metadata = {
  title: "Privacidad — HeyStudy",
  description: "Qué datos guarda HeyStudy, para qué los usa, y cómo controlas o eliminas los tuyos.",
  alternates: { canonical: "/privacidad" },
};

export default function PrivacidadPage() {
  return (
    <div className="force-light flex flex-1 flex-col bg-background">
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
              <h2 className="text-base font-semibold text-foreground">El tutor usa inteligencia artificial</h2>
              <p className="mt-2 text-sm leading-relaxed">
                Cuando chateas con el tutor, generas un diagnóstico o pides retroalimentación, tu mensaje se envía
                a Anthropic (el proveedor del modelo de IA Claude) para generar la respuesta. Antes de eso, un
                filtro automático revisa el mensaje buscando señales de riesgo (autolesión, contenido fuera de lo
                académico) — ver{" "}
                <a href="/terminos" className="font-medium text-accent hover:underline">
                  Términos de uso
                </a>
                . Ese filtro es una capa de seguridad, no reemplaza ayuda humana real.
              </p>
            </section>
            <section>
              <h2 className="text-base font-semibold text-foreground">Menores de edad</h2>
              <p className="mt-2 text-sm leading-relaxed">
                HeyStudy es para estudiantes de al menos 13 años y no recopila a sabiendas información de niños
                menores de esa edad. Si tienes entre 13 y 17 años, te pedimos usarlo con conocimiento de tu padre,
                madre o tutor. Si un padre, madre o tutor cree que un menor de 13 años creó una cuenta, puede
                escribirnos para que la eliminemos.
              </p>
            </section>
            <section>
              <h2 className="text-base font-semibold text-foreground">Con quién compartimos información</h2>
              <p className="mt-2 text-sm leading-relaxed">
                No vendemos tu información ni la compartimos con fines publicitarios. Sí la procesan los
                proveedores que operan el servicio: <strong>Anthropic</strong> (genera las respuestas del tutor y
                los diagnósticos), <strong>Supabase</strong> (aloja la base de datos, el inicio de sesión y los
                archivos que subes), <strong>Vercel</strong> (aloja la aplicación), <strong>Resend</strong> (manda
                los correos de recordatorio y los resúmenes), <strong>ElevenLabs</strong> (convierte a voz la
                respuesta del tutor, sólo si activas el modo voz) y <strong>PostHog</strong> (mide cómo se usa el
                producto). Todos procesan tus datos únicamente para darte el servicio, no para sus propios fines.
              </p>
              <p className="mt-2 text-sm leading-relaxed">
                Sobre la medición de uso: registramos acciones como &ldquo;terminó un diagnóstico&rdquo; o
                &ldquo;generó su plan&rdquo;, identificadas con el código interno de tu cuenta —nunca con tu
                nombre ni tu correo—, junto con tu nivel educativo y tu método de estudio preferido, que elegiste
                de una lista al registrarte. No grabamos tu pantalla ni tu navegación, y no mandamos a esa medición el
                contenido de tus conversaciones con el tutor, los nombres de tus materias, de tus grupos ni de tus
                archivos.
              </p>
            </section>
            <section>
              <h2 className="text-base font-semibold text-foreground">Cuánto tiempo guardamos tus datos</h2>
              <p className="mt-2 text-sm leading-relaxed">
                Mientras tu cuenta exista. Si borras un material o una tarea, desaparece de inmediato. Si eliminas
                tu cuenta completa desde tu perfil, se borra de forma permanente — materias, materiales,
                diagnósticos, planes de estudio y conversaciones con el tutor — y no se puede deshacer.
              </p>
            </section>
            <section>
              <h2 className="text-base font-semibold text-foreground">Tus derechos (ARCO)</h2>
              <p className="mt-2 text-sm leading-relaxed">
                Como usuario en México tienes derecho a acceder, rectificar, cancelar y oponerte al uso de tus
                datos personales. Puedes ejercer la cancelación tú mismo eliminando tu cuenta desde tu perfil; para
                acceso, rectificación u oposición, escríbenos desde tu cuenta.
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
