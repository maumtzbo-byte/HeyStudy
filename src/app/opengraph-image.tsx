import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Inline como data URI en vez de fetch a una URL absoluta: next/og sí
// soporta ambos, pero un fetch de red en cada render (o en cada build
// estático) depende de que el dominio de producción ya esté sirviendo este
// mismo archivo — un problema de huevo y gallina que no existe si el PNG se
// lee del propio filesystem del build.
const mascotDataUri = `data:image/png;base64,${readFileSync(
  join(process.cwd(), "public/mascot/mascota-feliz.png"),
).toString("base64")}`;

// Mismo mark y morado que icon.tsx (favicon) — una sola fuente de verdad
// visual para "cómo se ve HeyStudy cuando alguien más lo comparte". Morado
// plano a propósito, no degradado — un blob de gradiente ahí es el cliché
// visual de "producto de IA genérico".
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 56,
          background: "#6d46e3",
        }}
      >
        <img src={mascotDataUri} width={280} height={210} alt="" />
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <svg width="56" height="56" viewBox="0 0 32 32" fill="none">
              <rect x="7" y="6" width="6" height="20" rx="3" fill="#ffffff" />
              <rect x="19" y="6" width="6" height="20" rx="3" fill="#ffffff" />
              <rect x="7" y="13" width="18" height="6" rx="3" fill="#ffffff" />
            </svg>
            <div style={{ fontSize: 64, fontWeight: 700, color: "#ffffff", display: "flex" }}>HeyStudy</div>
          </div>
          <div style={{ fontSize: 32, color: "#e4dcfb", display: "flex" }}>Sabe qué estudiar, hoy</div>
        </div>
      </div>
    ),
    { ...size },
  );
}
