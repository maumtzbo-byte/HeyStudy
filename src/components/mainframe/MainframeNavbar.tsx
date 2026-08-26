"use client";

import { useState } from "react";

const NAV_LINKS = ["Labs", "Studio", "Openings", "Shop"];

export function MainframeNavbar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-10 flex items-center justify-between px-5 py-4 sm:px-8 sm:py-5">
        <div className="flex flex-row items-center gap-3">
          <span
            className="text-[21px] tracking-tight text-black sm:text-[26px]"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Mainframe&reg;
          </span>
          <span
            aria-hidden
            className="select-none text-[25px] text-black sm:text-[30px]"
            style={{ letterSpacing: "-0.02em" }}
          >
            ✳︎
          </span>
        </div>

        <nav className="hidden flex-row text-[23px] text-black md:flex">
          {NAV_LINKS.map((label, i) => (
            <span key={label} className="flex flex-row">
              <a href="#" className="transition-opacity hover:opacity-60">
                {label}
              </a>
              {i < NAV_LINKS.length - 1 && <span>,&nbsp;</span>}
            </span>
          ))}
        </nav>

        <a
          href="#"
          className="hidden text-[23px] text-black underline underline-offset-2 transition-opacity hover:opacity-60 md:block"
        >
          Get in touch
        </a>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          className="flex flex-col items-center justify-center gap-[5px] md:hidden"
        >
          <span
            className={`h-[2px] w-6 bg-black transition-all duration-300 ${
              open ? "translate-y-[7px] rotate-45" : ""
            }`}
          />
          <span
            className={`h-[2px] w-6 bg-black transition-all duration-300 ${open ? "opacity-0" : "opacity-100"}`}
          />
          <span
            className={`h-[2px] w-6 bg-black transition-all duration-300 ${
              open ? "-translate-y-[7px] -rotate-45" : ""
            }`}
          />
        </button>
      </header>

      <div
        className={`fixed inset-0 z-[9] flex flex-col justify-center gap-8 bg-white/95 px-8 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        {NAV_LINKS.map((label) => (
          <a
            key={label}
            href="#"
            onClick={() => setOpen(false)}
            className="text-left text-[32px] font-medium text-black"
          >
            {label}
          </a>
        ))}
        <a
          href="#"
          onClick={() => setOpen(false)}
          className="text-left text-[32px] font-medium text-black underline underline-offset-2"
        >
          Get in touch
        </a>
      </div>
    </>
  );
}
