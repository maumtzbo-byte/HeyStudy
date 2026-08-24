import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma/client";

// cache() memoiza por request: layout.tsx, page.tsx y generateMetadata del
// dashboard llaman a estas funciones por separado en la misma navegación
// (hasta 3 veces en materias/[id]), y cada llamada sin memoizar repetía un
// round-trip a Supabase Auth más una query a studentProfile. Con cache(),
// la primera llamada hace el trabajo y las demás reusan el resultado.
export const getAuthUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});

// Para páginas que requieren sesión. Redirige a /login si no hay usuario.
export const requireAuthUser = cache(async () => {
  const user = await getAuthUser();
  if (!user) redirect("/login");
  return user;
});

// Para páginas del dashboard: requiere sesión Y onboarding completado.
export const requireStudentProfile = cache(async () => {
  const user = await requireAuthUser();
  const studentProfile = await prisma.studentProfile.findUnique({
    where: { userId: user.id },
  });
  if (!studentProfile) redirect("/onboarding");
  return { user, studentProfile };
});
