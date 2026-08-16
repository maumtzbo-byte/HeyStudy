"use client";

import { useEffect, useRef } from "react";
import { ArrowRight, PlayCircle } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/Button";
import { PhoneMockup } from "@/components/marketing/PhoneMockup";
import { NotebookObject, PencilObject, ExamObject } from "@/components/marketing/StudyObjects";

/* ---------------------------------------------------------------------- */
/* Motor de scroll cinemático                                              */
/*                                                                          */
/* Adaptado de un patrón de "stage" fijo (position: sticky) + un loop de   */
/* rAF que suaviza scroll y mouse con lerp, y escribe el resultado como    */
/* CSS custom properties directamente en el DOM (sin pasar por React) —    */
/* así la animación corre a 60fps sin re-renders. Cada capa (texto,        */
/* teléfono, objetos flotantes) lee su propia variable con su propio       */
/* multiplicador de profundidad, así que se mueven a velocidades distintas */
/* con el mouse y desaparecen en momentos distintos del scroll.            */
/* ---------------------------------------------------------------------- */

const SCROLL_DISTANCE = 1150;

function clamp(v: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, v));
}
function smoothstep(e0: number, e1: number, v: number) {
  const x = clamp((v - e0) / (e1 - e0));
  return x * x * (3 - 2 * x);
}
function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export function HeroScene() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const stage = stageRef.current;
    if (!section || !stage) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    let targetMouseX = 0;
    let targetMouseY = 0;
    let mouseX = 0;
    let mouseY = 0;
    let targetScroll = 0;
    let smoothScroll = 0;
    let initialized = false;
    let rafPending = false;

    function getScrollDistance() {
      const rect = section!.getBoundingClientRect();
      return clamp(-rect.top, 0, section!.offsetHeight - window.innerHeight);
    }

    function update() {
      rafPending = false;
      targetScroll = getScrollDistance();
      if (!initialized || reduceMotion.matches) {
        smoothScroll = targetScroll;
        initialized = true;
      } else {
        smoothScroll = lerp(smoothScroll, targetScroll, 0.14);
      }
      if (Math.abs(smoothScroll - targetScroll) < 0.08) smoothScroll = targetScroll;

      mouseX = lerp(mouseX, targetMouseX, 0.12);
      mouseY = lerp(mouseY, targetMouseY, 0.12);

      const mx = reduceMotion.matches ? 0 : mouseX;
      const my = reduceMotion.matches ? 0 : mouseY;

      const titleExit = smoothstep(0, 640, smoothScroll);
      const phoneExit = smoothstep(120, 1020, smoothScroll);
      const floatExit = smoothstep(60, 900, smoothScroll);
      const bgDrift = smoothstep(0, SCROLL_DISTANCE, smoothScroll);

      const s = stage!.style;
      s.setProperty("--title-y", `${titleExit * -130}px`);
      s.setProperty("--title-opacity", `${1 - titleExit}`);
      s.setProperty("--title-scale", `${1 - titleExit * 0.05}`);

      s.setProperty("--phone-x", `${mx * 20}px`);
      s.setProperty("--phone-y", `${my * 12 + phoneExit * 70}px`);
      s.setProperty("--phone-rotate", `${mx * 8}deg`);
      s.setProperty("--phone-scale", `${1 + (1 - phoneExit) * 0 + phoneExit * -0.04}`);
      s.setProperty("--phone-opacity", `${1 - phoneExit}`);

      s.setProperty("--float-notebook-x", `${mx * 34 - floatExit * 26}px`);
      s.setProperty("--float-notebook-y", `${my * 20 - floatExit * 90}px`);
      s.setProperty("--float-notebook-rotate", `${-10 - floatExit * 12 + mx * 6}deg`);
      s.setProperty("--float-notebook-opacity", `${1 - floatExit}`);

      s.setProperty("--float-pencil-x", `${mx * -26 + floatExit * 22}px`);
      s.setProperty("--float-pencil-y", `${my * 24 - floatExit * 110}px`);
      s.setProperty("--float-pencil-rotate", `${20 + floatExit * 16 + mx * 6}deg`);
      s.setProperty("--float-pencil-opacity", `${1 - floatExit}`);

      s.setProperty("--float-exam-x", `${mx * 18 - floatExit * 18}px`);
      s.setProperty("--float-exam-y", `${my * 16 - floatExit * 70}px`);
      s.setProperty("--float-exam-rotate", `${6 - floatExit * 10 + mx * -5}deg`);
      s.setProperty("--float-exam-opacity", `${1 - floatExit}`);

      s.setProperty("--bg-x", `${mx * -10}px`);
      s.setProperty("--bg-y", `${my * -6 - bgDrift * 20}px`);
      s.setProperty("--bg-scale", `${1 + bgDrift * 0.06}`);

      const stillMoving =
        Math.abs(smoothScroll - targetScroll) > 0.08 ||
        Math.abs(mouseX - targetMouseX) > 0.001 ||
        Math.abs(mouseY - targetMouseY) > 0.001;
      if (stillMoving) requestTick();
    }

    function requestTick() {
      if (rafPending) return;
      rafPending = true;
      requestAnimationFrame(update);
    }

    function onScroll() {
      requestTick();
    }
    function onResize() {
      requestTick();
    }
    function onPointerMove(e: PointerEvent) {
      targetMouseX = e.clientX / window.innerWidth - 0.5;
      targetMouseY = e.clientY / window.innerHeight - 0.5;
      requestTick();
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    requestTick();

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onPointerMove);
    };
  }, []);

  return (
    <section ref={sectionRef} className="relative" style={{ height: `calc(100vh + ${SCROLL_DISTANCE}px)` }}>
      <div
        ref={stageRef}
        className="sticky top-0 h-screen min-h-[620px] overflow-hidden bg-background"
        style={
          {
            "--title-y": "0px",
            "--title-opacity": 1,
            "--title-scale": 1,
            "--phone-x": "0px",
            "--phone-y": "0px",
            "--phone-rotate": "0deg",
            "--phone-scale": 1,
            "--phone-opacity": 1,
            "--float-notebook-x": "0px",
            "--float-notebook-y": "0px",
            "--float-notebook-rotate": "-10deg",
            "--float-notebook-opacity": 1,
            "--float-pencil-x": "0px",
            "--float-pencil-y": "0px",
            "--float-pencil-rotate": "20deg",
            "--float-pencil-opacity": 1,
            "--float-exam-x": "0px",
            "--float-exam-y": "0px",
            "--float-exam-rotate": "6deg",
            "--float-exam-opacity": 1,
            "--bg-x": "0px",
            "--bg-y": "0px",
            "--bg-scale": 1,
            perspective: "1500px",
          } as React.CSSProperties
        }
      >
        {/* Fondo: puntos casi invisibles con su propio drift de profundidad */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.5]"
          style={{
            backgroundImage: "radial-gradient(var(--border) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
            transform: "translate3d(var(--bg-x), var(--bg-y), 0) scale(var(--bg-scale))",
            maskImage: "radial-gradient(ellipse 70% 60% at 50% 0%, black 30%, transparent 75%)",
            WebkitMaskImage: "radial-gradient(ellipse 70% 60% at 50% 0%, black 30%, transparent 75%)",
          }}
        />

        <div className="relative mx-auto flex h-full w-full max-w-3xl flex-col items-center px-6 pt-24 text-center sm:px-8 sm:pt-28">
          <div
            style={{
              transform: "translate3d(0, var(--title-y), 0) scale(var(--title-scale))",
              opacity: "var(--title-opacity)",
              willChange: "transform, opacity",
            }}
          >
            <span className="inline-flex items-center rounded-full border border-border bg-surface px-3.5 py-1.5 text-xs font-semibold tracking-wide text-accent-hover uppercase">
              Tu estudio, con dirección
            </span>
            <h1 className="mt-7 font-display text-5xl leading-[1.05] font-semibold tracking-tight text-foreground sm:text-6xl">
              ¿Qué deberías
              <br />
              estudiar hoy?
            </h1>
            <p className="mt-6 max-w-xl text-lg text-muted">
              HeyStudy analiza lo que realmente dominas, detecta tus puntos débiles y convierte tu próximo examen en
              un plan claro para hoy.
            </p>
            <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-4">
              <ButtonLink href="/registro" size="lg" className="w-full sm:w-auto">
                Empezar gratis
                <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
              </ButtonLink>
              <a href="#como-funciona" className="w-full sm:w-auto">
                <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                  <PlayCircle className="h-4 w-4" strokeWidth={1.75} />
                  Ver cómo funciona
                </Button>
              </a>
            </div>
          </div>

          {/* Escena 3D: teléfono + objetos de estudio flotando alrededor,
              cada uno a su propia profundidad (mouse-parallax + salida en scroll) */}
          <div
            className="relative mt-10 flex w-full flex-1 items-start justify-center"
            style={{ transformStyle: "preserve-3d" }}
          >
            {/* El teléfono va primero en el DOM para quedar detrás de los
                objetos flotantes en el orden de pintado. */}
            <div
              style={{
                transform:
                  "translate3d(var(--phone-x), var(--phone-y), 0) scale(var(--phone-scale)) rotateY(var(--phone-rotate))",
                opacity: "var(--phone-opacity)",
                transformStyle: "preserve-3d",
                willChange: "transform, opacity",
              }}
            >
              <PhoneMockup />
            </div>

            <div
              className="pointer-events-none absolute top-2 left-[6%] z-10 hidden w-16 sm:block md:top-4 md:left-[14%] md:w-20"
              style={{
                transform:
                  "translate3d(var(--float-notebook-x), var(--float-notebook-y), 0) rotate(var(--float-notebook-rotate))",
                opacity: "var(--float-notebook-opacity)",
                willChange: "transform, opacity",
              }}
            >
              <NotebookObject className="w-full drop-shadow-none" />
            </div>

            <div
              className="pointer-events-none absolute top-16 right-[4%] z-10 hidden w-24 sm:block md:top-20 md:right-[12%] md:w-28"
              style={{
                transform:
                  "translate3d(var(--float-pencil-x), var(--float-pencil-y), 0) rotate(var(--float-pencil-rotate))",
                opacity: "var(--float-pencil-opacity)",
                willChange: "transform, opacity",
              }}
            >
              <PencilObject className="w-full" />
            </div>

            <div
              className="pointer-events-none absolute top-[19rem] left-[1%] z-10 hidden w-16 md:block md:left-[7%] md:w-[4.75rem]"
              style={{
                transform: "translate3d(var(--float-exam-x), var(--float-exam-y), 0) rotate(var(--float-exam-rotate))",
                opacity: "var(--float-exam-opacity)",
                willChange: "transform, opacity",
              }}
            >
              <ExamObject className="w-full" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
