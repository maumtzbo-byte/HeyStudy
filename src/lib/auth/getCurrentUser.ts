import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma/client";

export async function getAuthUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

// Para páginas que requieren sesión. Redirige a /login si no hay usuario.
export async function requireAuthUser() {
  const user = await getAuthUser();
  if (!user) redirect("/login");
  return user;
}

// Para páginas del dashboard: requiere sesión Y onboarding completado.
export async function requireStudentProfile() {
  const user = await requireAuthUser();
  const studentProfile = await prisma.studentProfile.findUnique({
    where: { userId: user.id },
  });
  if (!studentProfile) redirect("/onboarding");
  return { user, studentProfile };
}
