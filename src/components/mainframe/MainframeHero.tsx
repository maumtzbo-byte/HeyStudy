"use client";

import { useEffect, useRef, useState } from "react";
import { useTypewriter } from "@/lib/hooks/useTypewriter";

const VIDEO_SRC =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260530_042513_df96a13b-6155-4f6e-8b93-c9dee66fba08.mp4";
const SENSITIVITY = 0.8;
const EMAIL = "hello@mainframe.co";

const PILLS = ["Pitch us an idea", "Come work here", "Send a brief hello", "See how we operate"];

function CopyIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
      <rect x="3.5" y="3.5" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1" />
      <rect x="1.5" y="1.5" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}

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
      readyRef.current = true;
      // Sin esto el <video> se queda en blanco hasta el primer mousemove:
      // pausado y sin haber reproducido nunca, algunos navegadores no
      // decodifican ni pintan el frame inicial solo por cargar metadata.
      if (video) video.currentTime = 0.001;
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
    "Glad you stopped in. Good taste tends to find us. Now, what are we building?",
  );
  const [pillsVisible, setPillsVisible] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => setPillsVisible(true), 400);
    return () => clearTimeout(id);
  }, []);

  function copyEmail() {
    navigator.clipboard.writeText(EMAIL);
  }

  return (
    <div className="mainframe-page relative">
      <VideoScrubBackground />

      <section className="relative z-[1] flex h-screen flex-col justify-end overflow-hidden px-5 pb-12 sm:px-8 md:justify-center md:px-10 md:pb-0">
        <div className="relative z-10 max-w-xl">
          <p
            aria-hidden
            className="pointer-events-none mb-5 [filter:blur(4px)] select-none sm:mb-6"
            style={{ fontSize: "clamp(18px, 4vw, 26px)", lineHeight: 1.3, fontWeight: 400, color: "#000" }}
          >
            Hey there, meet A.R.I.A,
            <br />
            Mainframe&apos;s Adaptive Response Interface Agent
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
            {PILLS.map((label) => (
              <button
                key={label}
                type="button"
                className="mx-[0.2em] mb-[0.4em] inline-flex items-center justify-center rounded-full border border-black/10 bg-white px-4 py-[0.3em] text-[13px] whitespace-nowrap text-black transition-colors duration-200 hover:bg-black hover:text-white sm:px-5 sm:text-[15px]"
              >
                {label}
              </button>
            ))}
            <button
              type="button"
              onClick={copyEmail}
              className="mx-[0.2em] mb-[0.4em] inline-flex items-center justify-center gap-2 rounded-full border border-white bg-transparent px-4 py-[0.3em] text-[13px] whitespace-nowrap text-white transition-colors duration-200 hover:bg-white hover:text-black sm:gap-3 sm:px-5 sm:text-[15px]"
            >
              Reach us: <span className="underline underline-offset-1">{EMAIL}</span>
              <CopyIcon />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
