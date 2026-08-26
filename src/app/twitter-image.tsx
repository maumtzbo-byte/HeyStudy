import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Inline como data URI — mismo motivo que opengraph-image.tsx (evita
// depender de que el dominio de producción sirva el asset en build time).
const mascotDataUri = `data:image/png;base64,${readFileSync(
  join(process.cwd(), "public/mascot/mascota-feliz.png"),
).toString("base64")}`;

// Mismo diseño que opengraph-image.tsx — Next.js exige el convenio por
// separado para que Twitter/X lo tome, no cae de vuelta al de OG solo. Morado
// plano a propósito, no degradado (ver comentario en opengraph-image.tsx).
export default function TwitterImage() {
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
