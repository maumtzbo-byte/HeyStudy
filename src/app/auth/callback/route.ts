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

  return NextResponse.redirect(`${origin}/login?error=No se pudo iniciar sesión`);
}
