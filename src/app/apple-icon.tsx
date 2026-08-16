import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#1e5b67",
        }}
      >
        <svg width="100" height="100" viewBox="0 0 32 32" fill="none">
          <rect x="7" y="6" width="6" height="20" rx="3" fill="#ffffff" />
          <rect x="19" y="6" width="6" height="20" rx="3" fill="#ffffff" />
          <rect x="7" y="13" width="18" height="6" rx="3" fill="#ffffff" />
        </svg>
      </div>
    ),
    { ...size },
  );
}
