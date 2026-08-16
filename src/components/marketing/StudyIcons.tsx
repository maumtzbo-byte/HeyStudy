"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { CSSProperties } from "react";

// Ilustraciones "clay" (formas planas + degradado + sombra suave) en vez de
// renders 3D fotorrealistas — más rápido de iterar y sin depender de un
// servicio externo de generación de imágenes. Cada una flota con un loop
// sutil para dar sensación de profundidad sin parallax de mouse.
// El loop se apaga por completo con prefers-reduced-motion.
function useFloat(duration: number, delay = 0) {
  const reduceMotion = useReducedMotion();
  if (reduceMotion) return {};
  return {
    animate: { y: [0, -10, 0], rotate: [0, 1.5, 0] },
    transition: { duration, delay, repeat: Infinity, ease: "easeInOut" as const },
  };
}

export function BookStack({ className, style }: { className?: string; style?: CSSProperties }) {
  const floatProps = useFloat(5);
  return (
    <motion.svg
      viewBox="0 0 160 130"
      className={className}
      style={style}
      {...floatProps}
      aria-hidden
    >
      <defs>
        <linearGradient id="book-a" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7b82df" />
          <stop offset="1" stopColor="#565ec2" />
        </linearGradient>
        <linearGradient id="book-b" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f2b84f" />
          <stop offset="1" stopColor="#d99a2b" />
        </linearGradient>
        <linearGradient id="book-c" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5cb37c" />
          <stop offset="1" stopColor="#3f7d52" />
        </linearGradient>
        <filter id="book-shadow" x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow dx="0" dy="6" stdDeviation="7" floodColor="#201f3d" floodOpacity="0.16" />
        </filter>
      </defs>

      <g filter="url(#book-shadow)">
        <g transform="rotate(-7 80 96)">
          <rect x="14" y="82" width="126" height="26" rx="5" fill="url(#book-a)" />
          <rect x="132" y="84" width="6" height="22" rx="2" fill="#c7cbf2" />
        </g>
        <g transform="rotate(5 80 68)">
          <rect x="26" y="56" width="102" height="24" rx="5" fill="url(#book-b)" />
          <rect x="120" y="58" width="6" height="20" rx="2" fill="#fbe3ae" />
        </g>
        <g transform="rotate(-4 80 42)">
          <rect x="38" y="32" width="82" height="22" rx="5" fill="url(#book-c)" />
          <rect x="112" y="34" width="6" height="18" rx="2" fill="#bfe6cc" />
        </g>
      </g>
    </motion.svg>
  );
}

export function Pencil({ className, style }: { className?: string; style?: CSSProperties }) {
  const floatProps = useFloat(4.2, 0.4);
  return (
    <motion.svg
      viewBox="0 0 160 60"
      className={className}
      style={style}
      {...floatProps}
      aria-hidden
    >
      <defs>
        <linearGradient id="pencil-body" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#ffd76a" />
          <stop offset="1" stopColor="#f2b84f" />
        </linearGradient>
        <filter id="pencil-shadow" x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow dx="0" dy="5" stdDeviation="6" floodColor="#201f3d" floodOpacity="0.16" />
        </filter>
      </defs>
      <g filter="url(#pencil-shadow)" transform="rotate(-18 80 30)">
        <rect x="18" y="20" width="104" height="20" rx="6" fill="url(#pencil-body)" />
        <rect x="18" y="20" width="104" height="6" fill="#ffffff" fillOpacity="0.35" />
        <rect x="4" y="22" width="16" height="16" rx="3" fill="#e8768f" />
        <path d="M122 20 L144 30 L122 40 Z" fill="#f3d9ad" />
        <path d="M136 26 L144 30 L136 34 Z" fill="#4b4b4f" />
      </g>
    </motion.svg>
  );
}

// Chispa — la mascota de HeyStudy: un foco con cara, cálido y cercano
// (idea/momento "ahá" al entender algo). Mismo estilo "clay" que el resto
// de las ilustraciones, con un halo que respira además del flotado.
export function Chispa({ className, style }: { className?: string; style?: CSSProperties }) {
  const floatProps = useFloat(5.5, 0.2);
  const reduceMotion = useReducedMotion();
  const glowProps = reduceMotion
    ? {}
    : {
        animate: { opacity: [0.15, 0.32, 0.15] },
        transition: { duration: 3.2, repeat: Infinity, ease: "easeInOut" as const },
      };

  return (
    <motion.svg viewBox="0 0 160 200" className={className} style={style} {...floatProps} aria-hidden>
      <defs>
        <radialGradient id="chispa-glow" cx="50%" cy="45%" r="55%">
          <stop offset="0" stopColor="#6c74d6" stopOpacity="0.6" />
          <stop offset="1" stopColor="#6c74d6" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="chispa-bulb" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffe9a8" />
          <stop offset="1" stopColor="#f2b84f" />
        </linearGradient>
        <filter id="chispa-shadow" x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow dx="0" dy="8" stdDeviation="8" floodColor="#201f3d" floodOpacity="0.18" />
        </filter>
      </defs>

      <motion.circle cx="80" cy="88" r="56" fill="url(#chispa-glow)" opacity={0.2} {...glowProps} />

      <g filter="url(#chispa-shadow)">
        {/* brazo saludando */}
        <path
          d="M113 88 C 124 78, 130 62, 128 50"
          fill="none"
          stroke="#f2b84f"
          strokeWidth="7"
          strokeLinecap="round"
        />
        <circle cx="128" cy="48" r="7" fill="#f2b84f" />
        {/* brazo apoyado */}
        <path d="M47 92 C 38 100, 34 110, 36 118" fill="none" stroke="#f2b84f" strokeWidth="7" strokeLinecap="round" />
        <circle cx="36" cy="119" r="7" fill="#f2b84f" />

        {/* base metálica */}
        <rect x="66" y="146" width="28" height="9" rx="4" fill="#8b8b98" />
        <rect x="68" y="134" width="24" height="7" rx="3" fill="#9a9aa8" />
        <rect x="64" y="112" width="32" height="26" rx="8" fill="#c9c9d3" />

        {/* foco */}
        <ellipse cx="80" cy="72" rx="44" ry="46" fill="url(#chispa-bulb)" />
        <ellipse cx="64" cy="54" rx="12" ry="16" fill="#ffffff" fillOpacity="0.35" />

        {/* filamento */}
        <path
          d="M62 82 L72 60 L80 80 L88 60 L98 82"
          fill="none"
          stroke="#d9852a"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.55"
        />

        {/* cachetes */}
        <ellipse cx="55" cy="82" rx="7" ry="5" fill="#f4a6a6" fillOpacity="0.55" />
        <ellipse cx="105" cy="82" rx="7" ry="5" fill="#f4a6a6" fillOpacity="0.55" />

        {/* cara */}
        <circle cx="66" cy="76" r="5.5" fill="#201f3d" />
        <circle cx="94" cy="76" r="5.5" fill="#201f3d" />
        <circle cx="68" cy="74" r="1.6" fill="#ffffff" />
        <circle cx="96" cy="74" r="1.6" fill="#ffffff" />
        <path d="M67 90 Q80 100 93 90" stroke="#201f3d" strokeWidth="4" fill="none" strokeLinecap="round" />
      </g>

      {/* chispas */}
      <path d="M124 30 L127 22 L130 30 L138 33 L130 36 L127 44 L124 36 L116 33 Z" fill="#6c74d6" opacity="0.7" />
      <path d="M32 44 L34 39 L36 44 L41 46 L36 48 L34 53 L32 48 L27 46 Z" fill="#f2b84f" opacity="0.6" />
    </motion.svg>
  );
}

export function ExamCard({ className, style }: { className?: string; style?: CSSProperties }) {
  const floatProps = useFloat(4.8, 0.8);
  return (
    <motion.svg
      viewBox="0 0 140 110"
      className={className}
      style={style}
      {...floatProps}
      aria-hidden
    >
      <defs>
        <filter id="exam-shadow" x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow dx="0" dy="6" stdDeviation="7" floodColor="#201f3d" floodOpacity="0.16" />
        </filter>
      </defs>
      <g filter="url(#exam-shadow)" transform="rotate(6 70 55)">
        <rect x="12" y="8" width="100" height="94" rx="8" fill="#ffffff" stroke="#e7e6ee" strokeWidth="1.5" />
        <rect x="26" y="26" width="56" height="6" rx="3" fill="#d9d8e6" />
        <rect x="26" y="40" width="72" height="6" rx="3" fill="#d9d8e6" />
        <rect x="26" y="54" width="44" height="6" rx="3" fill="#d9d8e6" />
        <circle cx="94" cy="76" r="20" fill="#e5f3ea" />
        <path
          d="M85 76 L91 82 L104 68"
          fill="none"
          stroke="#3f7d52"
          strokeWidth="4.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </motion.svg>
  );
}
