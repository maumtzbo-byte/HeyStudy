import type { CSSProperties } from "react";

// Objetos de estudio "soft-3D": gradientes + luz suave para dar volumen
// real (no el estilo "clay" plano que se quitó antes). Sirven de capas
// flotantes en el hero cinemático — reemplazables por renders de
// Higgsfield más adelante sin cambiar el layout que los usa.

export function NotebookObject({ className, style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 120 148" className={className} style={style} aria-hidden>
      <defs>
        <linearGradient id="nb-cover" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#8b90e0" />
          <stop offset="1" stopColor="#565ec2" />
        </linearGradient>
        <linearGradient id="nb-shine" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.35" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        <filter id="nb-shadow" x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow dx="0" dy="10" stdDeviation="10" floodColor="#201f3d" floodOpacity="0.22" />
        </filter>
      </defs>
      <g filter="url(#nb-shadow)">
        <rect x="10" y="8" width="94" height="130" rx="10" fill="#3d3f5c" opacity="0.5" />
        <rect x="14" y="4" width="94" height="130" rx="10" fill="url(#nb-cover)" />
        <rect x="14" y="4" width="94" height="130" rx="10" fill="url(#nb-shine)" />
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <ellipse key={i} cx="18" cy={20 + i * 17} rx="4.5" ry="5" fill="#fbfaf9" opacity="0.9" />
        ))}
        <rect x="34" y="26" width="52" height="5" rx="2.5" fill="#fbfaf9" opacity="0.85" />
        <rect x="34" y="38" width="36" height="5" rx="2.5" fill="#fbfaf9" opacity="0.55" />
        <rect x="14" y="112" width="94" height="22" rx="6" fill="#a87d3e" opacity="0.9" />
      </g>
    </svg>
  );
}

export function PencilObject({ className, style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 148 44" className={className} style={style} aria-hidden>
      <defs>
        <linearGradient id="pc-body" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#c99a4f" />
          <stop offset="1" stopColor="#a87d3e" />
        </linearGradient>
        <filter id="pc-shadow" x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow dx="0" dy="8" stdDeviation="8" floodColor="#201f3d" floodOpacity="0.2" />
        </filter>
      </defs>
      <g filter="url(#pc-shadow)">
        <rect x="18" y="14" width="94" height="16" rx="7" fill="url(#pc-body)" />
        <rect x="18" y="14" width="94" height="5" rx="2.5" fill="#ffffff" opacity="0.3" />
        <rect x="4" y="15" width="18" height="14" rx="6" fill="#e8899e" />
        <rect x="2" y="16" width="8" height="12" rx="4" fill="#c9c9d3" />
        <path d="M112 14 L138 22 L112 30 Z" fill="#f3d9ad" />
        <path d="M128 19 L138 22 L128 25 Z" fill="#3d3f5c" />
      </g>
    </svg>
  );
}

export function ExamObject({ className, style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 116 138" className={className} style={style} aria-hidden>
      <defs>
        <linearGradient id="ex-badge" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#5aa383" />
          <stop offset="1" stopColor="#407765" />
        </linearGradient>
        <filter id="ex-shadow" x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow dx="0" dy="9" stdDeviation="9" floodColor="#201f3d" floodOpacity="0.2" />
        </filter>
      </defs>
      <g filter="url(#ex-shadow)">
        <rect x="10" y="6" width="96" height="122" rx="10" fill="#fbfaf9" stroke="#e8e5df" strokeWidth="1.5" />
        <rect x="24" y="24" width="54" height="6" rx="3" fill="#d9d6cd" />
        <rect x="24" y="40" width="68" height="6" rx="3" fill="#d9d6cd" />
        <rect x="24" y="56" width="40" height="6" rx="3" fill="#d9d6cd" />
        <rect x="24" y="78" width="68" height="5" rx="2.5" fill="#ece9e2" />
        <rect x="24" y="90" width="52" height="5" rx="2.5" fill="#ece9e2" />
        <circle cx="86" cy="102" r="19" fill="url(#ex-badge)" />
        <path
          d="M77 102 L84 109 L96 94"
          fill="none"
          stroke="#fbfaf9"
          strokeWidth="4.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
}
