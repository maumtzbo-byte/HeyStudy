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
