import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#6c74d6",
          borderRadius: 7,
        }}
      >
        <svg width="18" height="18" viewBox="0 0 32 32" fill="none">
          <path
            d="M8.5 22.5L15 16l3.5 3.5L25 12"
            stroke="#ffffff"
            strokeWidth="2.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.55"
          />
          <circle cx="8.5" cy="22.5" r="2.75" fill="#ffffff" opacity="0.55" />
          <circle cx="18.5" cy="19.5" r="3" fill="#ffffff" opacity="0.8" />
          <circle cx="25" cy="12" r="3.5" fill="#ffffff" />
        </svg>
      </div>
    ),
    { ...size },
  );
}
