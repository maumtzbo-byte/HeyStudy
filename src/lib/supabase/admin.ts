import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Cliente con la service role key: puede borrar usuarios de auth.users y
// saltarse RLS. NUNCA importar esto desde un componente cliente ni desde
// código que no sea explícitamente de confianza — a diferencia de
// lib/supabase/server.ts (que usa la sesión del propio usuario), este
// cliente actúa con privilegios de administrador sobre todo el proyecto.
//
// Requiere SUPABASE_SERVICE_ROLE_KEY en el entorno (Supabase Dashboard →
// Settings → API → service_role secret). Si falta, se lanza al primer uso
// en vez de silenciosamente operar sin permisos — mejor un error claro en
// desarrollo que un "borrado de cuenta" que en realidad no borró nada.
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Falta SUPABASE_SERVICE_ROLE_KEY en el entorno. Consíguela en Supabase Dashboard → Settings → API " +
        "(sección 'service_role', no la 'anon'). Es necesaria para borrar cuentas de usuario.",
    );
  }

  return createSupabaseClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
