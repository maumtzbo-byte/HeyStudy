import type { ReactNode } from "react";
import { requireStudentProfile } from "@/lib/auth/getCurrentUser";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const { studentProfile } = await requireStudentProfile();

  return (
    <div className="flex min-h-screen flex-1 flex-col bg-background">
      <DashboardHeader displayName={studentProfile.displayName} />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">{children}</main>
    </div>
  );
}
