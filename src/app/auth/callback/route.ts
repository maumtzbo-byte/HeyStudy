import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

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
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
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
