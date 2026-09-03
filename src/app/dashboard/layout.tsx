import type { ReactNode } from "react";
import { requireStudentProfile } from "@/lib/auth/getCurrentUser";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { AnalyticsIdentify } from "@/components/analytics/PostHogProvider";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const { studentProfile } = await requireStudentProfile();

  return (
    <div className="force-light flex min-h-screen flex-1 flex-col bg-background">
      <DashboardHeader displayName={studentProfile.displayName} />
      {/* Une la sesión anónima del navegador con el usuario. Sólo viaja el
          UUID: ni el nombre que se muestra arriba ni el correo. */}
      <AnalyticsIdentify userId={studentProfile.userId} />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">{children}</main>
    </div>
  );
}
