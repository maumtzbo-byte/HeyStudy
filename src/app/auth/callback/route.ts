import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { track } from "@/lib/analytics/server";

// Ventana para considerar que la cuenta se acaba de crear en este mismo
// intercambio. created_at lo pone Supabase al dar de alta la cuenta, así que
// un inicio de sesión posterior queda muy por fuera de estos cinco minutos y
// no se cuenta como alta.
const NEW_ACCOUNT_WINDOW_MS = 5 * 60 * 1000;

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // Sólo se usa para el flujo de "olvidé mi contraseña" (resetPasswordForEmail
  // manda aquí con ?next=/actualizar-contrasena) — cualquier otro valor se
  // ignora para no convertir esto en un open redirect.
  const next = searchParams.get("next");
  const destination = next === "/actualizar-contrasena" ? next : "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // El flujo de recuperar contraseña también pasa por aquí, y ahí la
      // cuenta es vieja por definición — la ventana de tiempo ya lo excluye,
      // pero se salta explícito para no depender sólo de eso.
      const user = data?.user;
      if (user && destination === "/dashboard") {
        const createdAt = new Date(user.created_at).getTime();
        if (Number.isFinite(createdAt) && Date.now() - createdAt < NEW_ACCOUNT_WINDOW_MS) {
          // app_metadata.provider es "el primer proveedor con el que se
          // registró", que es justo el dato del embudo.
          await track(user.id, "signup_completed", {
            method: user.app_metadata?.provider === "google" ? "google" : "password",
          });
        }
      }
      return NextResponse.redirect(`${origin}${destination}`);
    }
  }

  // Cuando el token ya se usó o expiró, Supabase redirige aquí con
  // error_description en vez de code — mostrarlo tal cual (en vez de un
  // genérico "no se pudo iniciar sesión") le dice al estudiante que pida
  // un enlace nuevo en lugar de reintentar el mismo sin saber por qué falla.
  const description = searchParams.get("error_description");
  const message = description ? description.replace(/\+/g, " ") : "No se pudo iniciar sesión";
  return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(message)}`);
}
