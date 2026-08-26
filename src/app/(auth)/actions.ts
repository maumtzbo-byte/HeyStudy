"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { loginSchema, registroSchema } from "@/lib/validation/authSchemas";
import { checkRateLimit } from "@/services/security/rateLimit";
import { clientIp } from "@/lib/http/clientIp";
import { UserFacingError } from "@/lib/actions/result";

export type AuthActionState = { error?: string } | undefined;

// Sin esto, login y registro no tenían ningún límite técnico — nada impedía
// probar contraseñas en loop contra una cuenta, o crear cuentas en loop
// desde una sola IP (sección 8.5: rate limiting en CADA endpoint, no sólo
// en los que llaman a IA). Se limita por IP y, en login, también por el
// correo que se está probando — así un atacante no puede esquivar el
// límite repartiendo intentos entre varias IPs contra la misma cuenta.
const RATE_LIMIT_ERROR = "Demasiados intentos. Espera un minuto e intenta de nuevo.";
const GENERIC_ERROR = "Algo salió mal. Vuelve a intentarlo.";

// checkRateLimit sólo lanza UserFacingError cuando el límite se excedió de
// verdad — cualquier otro error (la base de datos no responde, etc.) es un
// fallo real que no debería disfrazarse de "demasiados intentos": eso le
// dice al estudiante que espere cuando en realidad algo está roto.
async function guardRateLimit(fn: () => Promise<void>): Promise<string | undefined> {
  try {
    await fn();
  } catch (err) {
    if (err instanceof UserFacingError) return RATE_LIMIT_ERROR;
    console.error("[auth rate limit]", err);
    return GENERIC_ERROR;
  }
  return undefined;
}

export async function loginAction(_prevState: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const ip = await clientIp();
  const rateLimitError = await guardRateLimit(async () => {
    await checkRateLimit(`login-ip:${ip}`, 10, 60);
    await checkRateLimit(`login-email:${parsed.data.email.toLowerCase()}`, 5, 60);
  });
  if (rateLimitError) return { error: rateLimitError };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) {
    return { error: "Correo o contraseña incorrectos" };
  }

  redirect("/dashboard");
}

export async function registroAction(_prevState: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const parsed = registroSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const ip = await clientIp();
  const rateLimitError = await guardRateLimit(() => checkRateLimit(`registro-ip:${ip}`, 5, 60));
  if (rateLimitError) return { error: rateLimitError };

  const supabase = await createClient();
  const requestHeaders = await headers();
  const origin = requestHeaders.get("origin");

  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: { emailRedirectTo: `${origin}/auth/callback` },
  });
  if (error) {
    return { error: error.message };
  }

  redirect("/verificar-correo");
}

export async function signInWithGoogleAction() {
  const supabase = await createClient();
  const requestHeaders = await headers();
  const origin = requestHeaders.get("origin");

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${origin}/auth/callback` },
  });
  if (error || !data.url) {
    redirect("/login?error=No se pudo iniciar sesión con Google");
  }

  redirect(data.url);
}
