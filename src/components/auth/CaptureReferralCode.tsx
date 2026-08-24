"use client";

import { useEffect } from "react";
import { REFERRAL_COOKIE_NAME, REFERRAL_COOKIE_MAX_AGE_SECONDS, isValidReferralCode } from "@/lib/referrals/cookie";

// Guarda el código de referido de la URL (?ref=CODE) en una cookie para que
// sobreviva hasta que la persona termine el registro y el onboarding —
// pueden ser pasos separados con redirecciones de por medio (verificación
// de correo, OAuth). No pisa una cookie existente con un valor inválido:
// así un link raro no borra un ?ref= válido que ya se había guardado antes.
export function CaptureReferralCode({ code }: { code: string | null }) {
  useEffect(() => {
    if (!code || !isValidReferralCode(code)) return;
    document.cookie = `${REFERRAL_COOKIE_NAME}=${code}; path=/; max-age=${REFERRAL_COOKIE_MAX_AGE_SECONDS}; SameSite=Lax`;
  }, [code]);

  return null;
}
