"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useTypewriter } from "@/lib/hooks/useTypewriter";

const VIDEO_SRC =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260530_042513_df96a13b-6155-4f6e-8b93-c9dee66fba08.mp4";
const SENSITIVITY = 0.8;

const PILLS = [
  { label: "Ver cómo funciona", href: "#como-funciona" },
  { label: "Ver precios", href: "#precios" },
  { label: "Preguntas frecuentes", href: "#preguntas" },
];

function VideoScrubBackground() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const prevXRef = useRef(0);
  const targetTimeRef = useRef(0);
  const isSeekingRef = useRef(false);
  const readyRef = useRef(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    function onLoadedMetadata() {
      if (!video) return;
      // Sin esto el <video> se queda en blanco en iOS Safari: pausado y
      // sin haber reproducido nunca, no decodifica ni pinta ningún frame
      // solo por cargar metadata o hacer un seek — necesita play() real
      // (aunque sea una fracción de segundo) para arrancar el decoder.
      // muted + playsInline es justo lo que permite que ese play() no
      // choque con las políticas de autoplay.
      video
        .play()
        .then(() => video.pause())
        .catch(() => {
          // Autoplay bloqueado igual: al menos intenta pintar el primer
          // frame con un seek, que sí funciona en la mayoría de escritorio.
          video.currentTime = 0.001;
        })
        .finally(() => {
          readyRef.current = true;
        });
    }

    function seekTo(time: number) {
      if (!video) return;
      isSeekingRef.current = true;
      video.currentTime = time;
    }

    function onSeeked() {
      if (video && Math.abs(video.currentTime - targetTimeRef.current) > 0.01) {
        seekTo(targetTimeRef.current);
      } else {
        isSeekingRef.current = false;
      }
    }

    function onMouseMove(e: MouseEvent) {
      if (!video || !readyRef.current || !video.duration) {
        prevXRef.current = e.clientX;
        return;
      }
      const delta = e.clientX - prevXRef.current;
      prevXRef.current = e.clientX;

      const offset = (delta / window.innerWidth) * SENSITIVITY * video.duration;
      const targetTime = Math.min(Math.max(targetTimeRef.current + offset, 0), video.duration);
      targetTimeRef.current = targetTime;

      if (!isSeekingRef.current) seekTo(targetTime);
    }

    video.addEventListener("loadedmetadata", onLoadedMetadata);
    video.addEventListener("seeked", onSeeked);
    window.addEventListener("mousemove", onMouseMove);

    return () => {
      video.removeEventListener("loadedmetadata", onLoadedMetadata);
      video.removeEventListener("seeked", onSeeked);
      window.removeEventListener("mousemove", onMouseMove);
    };
  }, []);

  return (
    <video
      ref={videoRef}
      src={VIDEO_SRC}
      muted
      playsInline
      preload="auto"
      className="fixed inset-0 z-0 h-full w-full object-cover"
      style={{ objectPosition: "70% center" }}
    />
  );
}

export function MainframeHero() {
  const { displayed, done } = useTypewriter(
    "Diagnosticamos qué sabes de verdad y armamos tu plan de estudio. ¿Con qué materia empezamos?",
  );
  const [pillsVisible, setPillsVisible] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => setPillsVisible(true), 400);
    return () => clearTimeout(id);
  }, []);

  return (
    <div className="relative">
      <VideoScrubBackground />

      <section className="relative z-[1] flex h-screen flex-col justify-end overflow-hidden px-5 pb-12 sm:px-8 md:justify-center md:px-10 md:pb-0">
        <div className="relative z-10 max-w-xl">
          <p
            aria-hidden
            className="pointer-events-none mb-5 [filter:blur(4px)] select-none sm:mb-6"
            style={{ fontSize: "clamp(18px, 4vw, 26px)", lineHeight: 1.3, fontWeight: 400, color: "#000" }}
          >
            Antes de que sigas bajando,
            <br />
            esta es la mascota que va a acompañarte a estudiar
          </p>

          <p
            className="mb-5 text-black sm:mb-6"
            style={{
              fontSize: "clamp(18px, 4vw, 26px)",
              lineHeight: 1.35,
              fontWeight: 400,
              minHeight: "54px",
            }}
          >
            {displayed}
            {!done && (
              <span
                aria-hidden
                className="ml-[2px] inline-block h-[1.1em] w-[2px] bg-black align-middle"
                style={{ animation: "mainframe-blink 1s step-end infinite" }}
              />
            )}
          </p>

          <div
            className="flex flex-wrap gap-y-1 transition-[opacity,transform] duration-[400ms] ease-out"
            style={{
              opacity: pillsVisible ? 1 : 0,
              transform: pillsVisible ? "translateY(0)" : "translateY(8px)",
            }}
          >
            {PILLS.map((pill) => (
              <a
                key={pill.href}
                href={pill.href}
                className="mx-[0.2em] mb-[0.4em] inline-flex items-center justify-center rounded-full border border-black/10 bg-white px-4 py-[0.3em] text-[13px] whitespace-nowrap text-black transition-colors duration-200 hover:bg-black hover:text-white sm:px-5 sm:text-[15px]"
              >
                {pill.label}
              </a>
            ))}
            <Link
              href="/registro"
              className="mx-[0.2em] mb-[0.4em] inline-flex items-center justify-center rounded-full border border-white bg-transparent px-4 py-[0.3em] text-[13px] whitespace-nowrap text-white transition-colors duration-200 hover:bg-white hover:text-black sm:px-5 sm:text-[15px]"
            >
              Comenzar gratis
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
