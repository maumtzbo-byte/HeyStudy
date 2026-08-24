import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Mismo diseño que opengraph-image.tsx — Next.js exige el convenio por
// separado para que Twitter/X lo tome, no cae de vuelta al de OG solo.
export default function TwitterImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 28,
          background: "#6d46e3",
        }}
      >
        <svg width="120" height="120" viewBox="0 0 32 32" fill="none">
          <rect x="7" y="6" width="6" height="20" rx="3" fill="#ffffff" />
          <rect x="19" y="6" width="6" height="20" rx="3" fill="#ffffff" />
          <rect x="7" y="13" width="18" height="6" rx="3" fill="#ffffff" />
        </svg>
        <div style={{ fontSize: 64, fontWeight: 700, color: "#ffffff", display: "flex" }}>HeyStudy</div>
        <div style={{ fontSize: 32, color: "#e4dcfb", display: "flex" }}>Sabe qué estudiar, hoy</div>
      </div>
    ),
    { ...size },
  );
}
