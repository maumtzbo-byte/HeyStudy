import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Lo que ve alguien cuando comparten HeyStudy. Ya no lleva mascota: lleva
// el sistema de la marca, que es la cápsula como unidad de medida.
//
// Las cápsulas de abajo dicen el argumento del producto sin una sola frase
// de marketing: unas llenas (medido) y otras vacías (todavía no). Es la
// misma gramática del hero, del mapa de conocimiento y de MasteryBadge.
//
// Morado plano a propósito, nunca degradado: el degradado morado-azul es
// exactamente el cliché visual del "producto de IA genérico".
const CAPSULES: Array<{ w: number; fill: number | null }> = [
  { w: 132, fill: 1 },
  { w: 78, fill: 0.45 },
  { w: 168, fill: 0.7 },
  { w: 78, fill: null },
  { w: 120, fill: null },
  { w: 78, fill: null },
];

function OgCard() {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 84,
        background: "#fbfaf9",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <svg width="44" height="44" viewBox="0 0 32 32" fill="none">
          <rect x="7" y="6" width="6" height="20" rx="3" fill="#6d46e3" />
          <rect x="19" y="6" width="6" height="20" rx="3" fill="#6d46e3" />
          <rect x="7" y="13" width="18" height="6" rx="3" fill="#6d46e3" />
        </svg>
        <div style={{ fontSize: 34, fontWeight: 600, color: "#16211f", display: "flex" }}>HeyStudy</div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
        <div style={{ fontSize: 116, fontWeight: 800, color: "#16211f", letterSpacing: "-0.04em", display: "flex" }}>
          ¿Qué no sabes?
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          {CAPSULES.map((c, i) => (
            <div
              key={i}
              style={{
                width: c.w,
                height: 22,
                borderRadius: 999,
                background: "#c9cecc",
                display: "flex",
                overflow: "hidden",
              }}
            >
              {c.fill !== null && (
                <div style={{ width: `${c.fill * 100}%`, height: "100%", borderRadius: 999, background: "#6d46e3" }} />
              )}
            </div>
          ))}
        </div>
      </div>

      <div style={{ fontSize: 30, color: "#55625f", display: "flex" }}>
        Diagnóstico, mapa de conocimiento y plan diario.
      </div>
    </div>
  );
}

// Next.js exige el archivo por separado para que X/Twitter lo tome: no cae
// de vuelta al de OpenGraph por su cuenta.
export default function TwitterImage() {
  return new ImageResponse(<OgCard />, { ...size });
}
