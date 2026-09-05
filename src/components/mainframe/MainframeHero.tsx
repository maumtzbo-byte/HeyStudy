import { MicroDiagnostic } from "@/components/diagnostic/MicroDiagnostic";

// El hero es una pregunta que nadie puede contestarse solo — y que es justo
// lo que el producto responde. No es un eslogan: es el planteamiento del
// problema, y ningún competidor de la categoría puede decirlo, porque todos
// venden certeza en vez de medir la duda.
//
// Lo que NO lleva, y es deliberado: cursor parpadeante, efecto de máquina de
// escribir y burbujas de chat. Ese trío es el gesto compartido de todo
// producto de IA, y usarlo aquí volvería a HeyStudy indistinguible del resto
// justo en la pantalla donde más se juega. Lo que aparece al lado es una
// medición, no una conversación.
//
// Tampoco es 100vh: la altura la fija el contenido, para que se vea que
// abajo hay más y nadie crea que la página se acaba ahí.
export function MainframeHero() {
  return (
    <section className="px-5 pt-16 pb-16 sm:px-8 sm:pt-24 sm:pb-28 md:px-10">
      <div className="mx-auto grid w-full max-w-[1180px] gap-14 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-5">
          {/* El objeto más grande de la página, y en la primera pantalla.
              Antes el hero medía 18-26px mientras los títulos de sección
              medían 44: la jerarquía estaba invertida y en móvil los enlaces
              del menú pesaban más que el mensaje principal. */}
          <h1
            className="font-display leading-[0.95] font-extrabold tracking-[-0.04em] text-foreground"
            style={{ fontSize: "clamp(44px, 9vw, 96px)" }}
          >
            ¿Qué no sabes?
          </h1>
          {/* Desactiva la lectura de reproche en una línea. La pregunta es
              provocadora a propósito; lo que sigue tiene que ser alivio, no
              juicio — el usuario es un adolescente que ya llega ansioso. */}
          <p className="mt-6 max-w-md text-lg leading-relaxed text-muted">
            Nadie puede contestar eso solo. Para eso existe HeyStudy.
          </p>
        </div>

        <div className="lg:col-span-7">
          <MicroDiagnostic />
        </div>
      </div>
    </section>
  );
}
