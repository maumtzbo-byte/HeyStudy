export const REFERRAL_COOKIE_NAME = "heystudy_ref";
export const REFERRAL_COOKIE_MAX_AGE_SECONDS = 30 * 24 * 60 * 60;

// Códigos generados por referralService.ts: 8 caracteres base36 en
// mayúsculas. Cualquier otra cosa en la cookie se ignora — no se confía en
// contenido de cookie sin validar.
const CODE_PATTERN = /^[A-Z0-9]{8}$/;

export function isValidReferralCode(value: string): boolean {
  return CODE_PATTERN.test(value);
}
