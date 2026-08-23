-- Hallazgos del linter de seguridad de Supabase tras aplicar RLS (no
-- estaban en el alcance original, pero eran baratos y correctos de cerrar
-- en la misma pasada):

-- _prisma_migrations: tabla interna de Prisma, expuesta a PostgREST por
-- estar en el schema public. Nadie debe leerla/escribirla vía API.
ALTER TABLE "_prisma_migrations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "_prisma_migrations" FORCE ROW LEVEL SECURITY;

-- handle_new_auth_user: función de trigger (usa NEW), no está pensada para
-- invocarse directamente. Postgres expone por default cualquier función de
-- `public` como endpoint RPC de PostgREST; se revoca ese acceso explícito.
-- Invocarla fuera de un trigger fallaría igual (NEW no existe fuera de ese
-- contexto), pero no debe aparecer como endpoint público.
REVOKE EXECUTE ON FUNCTION public.handle_new_auth_user() FROM anon, authenticated;
