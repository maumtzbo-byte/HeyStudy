// Escala de headlines nombrada: antes cada titular traía su propio
// text-[…] leading-[…] tracking-[…] suelto, repetido casi idéntico entre
// HeroScene, Frame.tsx y el CTA final de page.tsx — con pequeñas
// inconsistencias que no se sabía si eran a propósito. Tailwind v4 no
// modela bien un tamaño responsive de varios breakpoints como un solo
// theme token (--text-*), así que la escala vive aquí como clases
// reusables, no como custom properties.
export const HEADING_HERO =
  "font-display text-[2.4rem] leading-[1.06] font-extrabold tracking-[-0.04em] sm:text-6xl lg:text-[4.5rem]";

// Titular de cierre (CTA final): deliberadamente más grande que un titular
// de sección normal en escritorio — es la última afirmación de la página.
export const HEADING_CTA =
  "font-display text-[1.75rem] leading-[1.15] font-semibold tracking-tight sm:text-5xl sm:leading-[1.1]";

// Titular de sección repetido (FrameHeading — Diagnóstico, Mapa, FAQ, etc.).
export const HEADING_SECTION =
  "font-display text-[1.7rem] leading-[1.15] font-semibold tracking-tight sm:text-4xl sm:leading-[1.12]";
